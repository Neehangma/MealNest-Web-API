const Review = require("../models/review.model");

function listByRestaurant(restaurantId) {
  return Review.find({ restaurantId, status: { $ne: "hidden" } }).sort({ createdAt: -1 });
}

function findByReservation(reservationId) {
  return Review.findOne({ reservationId });
}

function findByReservationIds(reservationIds, userId) {
  return Review.find({ reservationId: { $in: reservationIds }, userId });
}

function create(payload) {
  return Review.create(payload);
}

function findOwnedById(reviewId, userId) {
  return Review.findOne({ _id: reviewId, userId });
}

async function updateOwned(reviewId, userId, payload) {
  return Review.findOneAndUpdate(
    { _id: reviewId, userId },
    { $set: payload },
    { returnDocument: "after", runValidators: true },
  );
}

function ratingSummary(restaurantId) {
  return Review.aggregate([
    { $match: { restaurantId, status: { $ne: "hidden" } } },
    { $group: { _id: "$restaurantId", rating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
  ]);
}

function adminList(filters) {
  const match: any = {};
  if (filters.status === "hidden") match.status = "hidden";
  if (filters.status === "published") match.$or = [{ status: "published" }, { status: { $exists: false } }];
  if (filters.rating) match.rating = filters.rating;
  if (filters.restaurantId) match.restaurantId = filters.restaurantId;
  const search = String(filters.search || "").trim();
  const sortMap: Record<string, any> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1, createdAt: -1 },
    lowest: { rating: 1, createdAt: -1 },
  };

  const pipeline: any[] = [
    { $match: match },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $lookup: { from: "restaurants", localField: "restaurantId", foreignField: "_id", as: "restaurant" } },
    { $lookup: { from: "reservations", localField: "reservationId", foreignField: "_id", as: "reservation" } },
    { $set: {
      user: { $first: "$user" },
      restaurant: { $first: "$restaurant" },
      reservation: { $first: "$reservation" },
      status: { $ifNull: ["$status", "published"] },
    } },
  ];
  if (search) {
    pipeline.push({ $match: { $or: [
      { userName: { $regex: search, $options: "i" } },
      { comment: { $regex: search, $options: "i" } },
      { "user.fullName": { $regex: search, $options: "i" } },
      { "restaurant.name": { $regex: search, $options: "i" } },
    ] } });
  }
  pipeline.push(
    { $sort: sortMap[filters.sort] || sortMap.newest },
    { $facet: {
      data: [{ $skip: filters.skip }, { $limit: filters.limit }],
      count: [{ $count: "total" }],
    } },
  );
  return Review.aggregate(pipeline);
}

function findById(reviewId) {
  return Review.findById(reviewId);
}

function updateStatus(reviewId, status) {
  return Review.findByIdAndUpdate(reviewId, { status }, { returnDocument: "after", runValidators: true });
}

function deleteById(reviewId) {
  return Review.findByIdAndDelete(reviewId);
}

function adminAnalytics(startDate) {
  return Promise.all([
    Review.aggregate([
      { $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        oneStarReviews: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        reviewsThisWeek: { $sum: { $cond: [{ $gte: ["$createdAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }, 1, 0] } },
        reviewsInRange: { $sum: { $cond: [{ $gte: ["$createdAt", startDate] }, 1, 0] } },
      } },
    ]),
    Review.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Review.aggregate([
      { $group: { _id: "$restaurantId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: "restaurants", localField: "_id", foreignField: "_id", as: "restaurant" } },
      { $set: { restaurant: { $first: "$restaurant" } } },
    ]),
    Review.find().sort({ createdAt: -1 }).limit(5)
      .populate("userId", "fullName email")
      .populate("restaurantId", "name cuisine"),
  ]);
}

module.exports = {
  create,
  adminAnalytics,
  adminList,
  deleteById,
  findById,
  findByReservation,
  findByReservationIds,
  findOwnedById,
  listByRestaurant,
  ratingSummary,
  updateStatus,
  updateOwned,
};
