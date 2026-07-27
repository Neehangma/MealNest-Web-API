declare const require: any;
declare const module: any;

const mongoose = require("mongoose");
const User = require("../models/user.model");
const Restaurant = require("../models/restaurant.model");
const Reservation = require("../models/reservation.model");
const Review = require("../models/review.model");
const { ensureRestaurantPrices } = require("./restaurant.repository");
const { parsePagination } = require("../utils/apihelper.utils");

const seedRestaurants = [
  {
    name: "The Golden Truffle",
    cuisine: "French",
    location: "Upper East Side",
    rating: 4.8,
    priceRange: "$$$",
    price: 500,
    image: "/images/Golden.jpg",
    isOpen: true,
    description: "Modern French dining with seasonal tasting menus.",
    address: "120 Madison Ave, New York, NY",
    phone: "+1 (212) 555-0188",
    hours: "Mon-Sun: 5:00 PM - 10:30 PM",
    features: ["Private Dining", "Wine Pairing", "Reservations"],
  },
  {
    name: "Sakura Omakase",
    cuisine: "Japanese",
    location: "Tribeca",
    rating: 4.9,
    priceRange: "$$$$",
    price: 500,
    image: "/images/sakura.jpg",
    isOpen: true,
    description: "Chef-led omakase experience in a sleek setting.",
    address: "44 Hudson St, New York, NY",
    phone: "+1 (212) 555-0145",
    hours: "Tue-Sun: 6:00 PM - 11:00 PM",
    features: ["Omakase", "Sushi Bar", "Late Night"],
  },
  {
    name: "La Bella Italia",
    cuisine: "Italian",
    location: "SoHo",
    rating: 4.6,
    priceRange: "$$",
    price: 350,
    image: "/images/roma.jpg",
    isOpen: true,
    description: "Rustic Italian comfort food and handmade pasta.",
    address: "22 Greene St, New York, NY",
    phone: "+1 (212) 555-0121",
    hours: "Mon-Sun: 11:30 AM - 10:00 PM",
    features: ["Pasta", "Outdoor Seating", "Family Friendly"],
  },
  {
    name: "The Spice Route",
    cuisine: "Indian",
    location: "Williamsburg",
    rating: 4.7,
    priceRange: "$$",
    price: 250,
    image: "/images/osaka.jpg",
    isOpen: false,
    description: "Bold spice-forward plates with modern presentation.",
    address: "80 Kent Ave, Brooklyn, NY",
    phone: "+1 (718) 555-0164",
    hours: "Mon-Sun: 12:00 PM - 9:00 PM",
    features: ["Vegetarian", "Takeout", "Cocktails"],
  },
];

async function ensureSeedRestaurants() {
  const count = await Restaurant.countDocuments();
  if (count > 0) {
    return ensureRestaurantPrices(await Restaurant.find({}).sort({ name: 1 }));
  }

  await Restaurant.insertMany(seedRestaurants);
  return ensureRestaurantPrices(await Restaurant.find({}).sort({ name: 1 }));
}

function findByEmail(email, includePassword = false) {
  const query = User.findOne({ email });
  return includePassword ? query.select("+password") : query;
}

function findById(id, includePassword = false) {
  const query = User.findById(id);
  return includePassword ? query.select("+password") : query;
}

function findByValidPasswordResetToken(passwordResetToken) {
  return User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+password +passwordResetToken +passwordResetExpires");
}

function createUser(payload) {
  return User.create(payload);
}

async function listUsers(queryParams) {
  const { page, limit, skip } = parsePagination(queryParams);
  const search = String(queryParams.search || "").trim();

  let filter = {};
  if (search) {
    filter = {
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
  }

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

function deleteUser(id) {
  return User.findByIdAndDelete(id);
}

async function getAdminUserDetails(userId) {
  const [user, reservations, reviews] = await Promise.all([
    User.findById(userId).populate("favorites", "name cuisine image"),
    Reservation.find({ user: userId })
      .populate("restaurant", "name cuisine")
      .sort({ createdAt: -1 }),
    Review.find({ userId })
      .populate("restaurantId", "name cuisine")
      .sort({ createdAt: -1 }),
  ]);

  return { user, reservations, reviews };
}

async function getDashboardData(userId) {
  const user = await User.findById(userId).populate("favorites");
  const restaurants = await ensureSeedRestaurants();

  if (!user) {
    return { user: null, stats: { bookings: 0, favorites: 0, averageRating: 0 }, favorites: [], upcomingReservations: [], recentHistory: [], cancelledReservations: [] };
  }

  await migrateLegacyReservations(user);
  const sortedReservations = await Reservation.find({ user: userId }).sort({ createdAt: -1 });
  const now = new Date();

  const upcomingReservations = sortedReservations.filter((reservation) => {
    const reservationDate = new Date(reservation.reservationDate);
    return reservation.status !== "cancelled" && reservationDate >= now;
  });

  const recentHistory = sortedReservations.filter((reservation) => {
    const reservationDate = new Date(reservation.reservationDate);
    return reservation.status !== "cancelled" && reservationDate < now;
  });

  const cancelledReservations = sortedReservations.filter(
    (reservation) => reservation.status === "cancelled"
  );

  const favoriteRestaurants = user.favorites || [];

  return {
    user,
    stats: {
      bookings: sortedReservations.length,
      favorites: favoriteRestaurants.length,
      averageRating: (favoriteRestaurants.reduce((sum, restaurant) => sum + (restaurant.rating || 0), 0) / Math.max(favoriteRestaurants.length || 1, 1)).toFixed(1),
    },
    favorites: favoriteRestaurants,
    upcomingReservations,
    recentHistory,
    cancelledReservations,
  };
}

async function toggleFavorite(userId, restaurantId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const restaurantObjectId = new mongoose.Types.ObjectId(restaurantId);
  const hasFavorite = user.favorites.some((favoriteId) => favoriteId.toString() === restaurantId);

  if (hasFavorite) {
    user.favorites = user.favorites.filter((favoriteId) => favoriteId.toString() !== restaurantId);
  } else {
    user.favorites.push(restaurantObjectId);
  }

  await user.save();
  return { isFavorite: !hasFavorite, favorites: await User.findById(userId).populate("favorites") };
}

async function listRestaurants() {
  return ensureSeedRestaurants();
}

async function getRestaurantById(id) {
  return Restaurant.findById(id);
}

async function createReservation(userId, payload) {
  const user = await User.findById(userId);
  if (!user) return null;

  const restaurant = await Restaurant.findById(payload.restaurantId);
  if (!restaurant) return null;

  return Reservation.create({
    user: userId,
    restaurant: restaurant._id,
    restaurantName: payload.restaurantName,
    cuisine: restaurant.cuisine || payload.cuisine || "",
    image: restaurant.image || payload.image || "",
    reservationDate: new Date(payload.reservationDate),
    date: payload.date,
    time: payload.time,
    guests: payload.guests || 2,
    tableNumber: payload.tableNumber,
    status: "confirmed",
    specialRequests: payload.specialRequests || "",
    bookingReference: `MN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    location: restaurant.location || payload.location || "",
    restaurantAddress: restaurant.address || payload.restaurantAddress || "",
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentStatus,
    transactionId: payload.transactionId || "",
    totalPaid: payload.totalPaid,
  });
}

function findReservationByTransactionId(userId, transactionId) {
  const normalizedTransactionId = String(transactionId || "").trim();
  if (!normalizedTransactionId) return null;
  return Reservation.findOne({
    user: userId,
    transactionId: normalizedTransactionId,
  }).populate("restaurant");
}

function getReservationWithDetails(reservationId, userId) {
  return Reservation.findOne({ _id: reservationId, user: userId }).populate("restaurant");
}

async function updateReservation(userId, reservationId, payload) {
  const reservation = await Reservation.findOne({ _id: reservationId, user: userId });
  if (!reservation) return null;

  if (payload.date !== undefined) reservation.date = payload.date;
  if (payload.time !== undefined) reservation.time = payload.time;
  if (payload.guests !== undefined) reservation.guests = payload.guests;
  if (payload.tableNumber !== undefined) reservation.tableNumber = payload.tableNumber;
  if (payload.specialRequests !== undefined) reservation.specialRequests = payload.specialRequests;
  if (payload.reservationDate !== undefined) reservation.reservationDate = new Date(payload.reservationDate);

  await reservation.save();
  return reservation;
}

async function cancelReservation(userId, reservationId) {
  const reservation = await Reservation.findOne({ _id: reservationId, user: userId });
  if (!reservation) return null;
  if (!["pending", "confirmed"].includes(reservation.status)) return { cancellationDenied: true };
  const datePart = new Date(reservation.reservationDate);
  const timeMatch = String(reservation.time || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (timeMatch) {
    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const meridiem = timeMatch[3]?.toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    datePart.setHours(hours, minutes, 0, 0);
  }
  if (datePart.getTime() <= Date.now()) return { cancellationDenied: true };
  reservation.status = "cancelled";
  await reservation.save();
  return reservation;
}

async function migrateLegacyReservations(user) {
  const legacy = user?.reservations || [];
  if (!legacy.length) return;
  await Promise.all(legacy.map((item) => Reservation.updateOne(
    { legacyId: `${user._id}:${item._id}` },
    { $setOnInsert: {
      user: user._id, restaurant: item.restaurantId, restaurantName: item.restaurantName,
      cuisine: item.cuisine, image: item.image, location: item.location,
      restaurantAddress: item.restaurantAddress, reservationDate: item.reservationDate,
      date: item.date, time: item.time, guests: item.guests, status: item.status,
      paymentMethod: item.paymentMethod, paymentStatus: item.paymentStatus,
      bookingReference: item.bookingReference || `MN-LEGACY-${item._id}`,
      specialRequests: item.specialRequests, totalPaid: item.totalPaid,
      legacyId: `${user._id}:${item._id}`,
    } },
    { upsert: true }
  )));
}

async function listUserReservations(userId) {
  const user = await User.findById(userId);
  if (!user) return null;
  await migrateLegacyReservations(user);
  return Reservation.find({ user: userId }).populate("restaurant").sort({ createdAt: -1 });
}

async function listAdminReservations() {
  const usersWithLegacyReservations = await User.find({ "reservations.0": { $exists: true } });
  await Promise.all(usersWithLegacyReservations.map(migrateLegacyReservations));
  return Reservation.find()
    .populate("user", "fullName email phoneNumber role")
    .populate("restaurant")
    .sort({ createdAt: -1 });
}

async function listGroupedAdminReservations(filters) {
  const usersWithLegacyReservations = await User.find({ "reservations.0": { $exists: true } });
  await Promise.all(usersWithLegacyReservations.map(migrateLegacyReservations));

  const reservationMatch: any = { restaurant: { $type: "objectId" } };
  if (filters.status) reservationMatch.status = filters.status;

  const restaurantMatch: any = {};
  if (filters.search) restaurantMatch["restaurant.name"] = { $regex: filters.search, $options: "i" };
  if (filters.cuisine) restaurantMatch["restaurant.cuisine"] = filters.cuisine;

  const sortMap = {
    highest: { totalBookings: -1, latestBookingDate: -1 },
    lowest: { totalBookings: 1, latestBookingDate: -1 },
    newest: { latestBookingDate: -1 },
    oldest: { latestBookingDate: 1 },
  };

  const pipeline: any[] = [
    { $match: reservationMatch },
    {
      $lookup: {
        from: Restaurant.collection.name,
        localField: "restaurant",
        foreignField: "_id",
        as: "restaurant",
      },
    },
    { $unwind: "$restaurant" },
    ...(Object.keys(restaurantMatch).length ? [{ $match: restaurantMatch }] : []),
    {
      $group: {
        _id: "$restaurant._id",
        restaurantName: { $first: "$restaurant.name" },
        restaurantImage: { $first: "$restaurant.image" },
        cuisine: { $first: "$restaurant.cuisine" },
        totalBookings: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
        latestBookingDate: { $max: "$reservationDate" },
        userIds: { $addToSet: "$user" },
      },
    },
    { $sort: sortMap[filters.sort] || sortMap.newest },
    {
      $facet: {
        data: [
          { $skip: filters.skip },
          { $limit: filters.limit },
          {
            $project: {
              _id: 0,
              restaurantId: { $toString: "$_id" },
              restaurantName: 1,
              restaurantImage: 1,
              cuisine: 1,
              totalBookings: 1,
              statusCounts: {
                pending: "$pending",
                confirmed: "$confirmed",
                completed: "$completed",
                cancelled: "$cancelled",
              },
              latestBookingDate: 1,
            },
          },
        ],
        totals: [{
          $group: {
            _id: null,
            totalRestaurants: { $sum: 1 },
            totalBookings: { $sum: "$totalBookings" },
            pending: { $sum: "$pending" },
            confirmed: { $sum: "$confirmed" },
            completed: { $sum: "$completed" },
            cancelled: { $sum: "$cancelled" },
            userSets: { $push: "$userIds" },
          },
        }, {
          $project: {
            _id: 0,
            totalRestaurants: 1,
            totalBookings: 1,
            pending: 1,
            confirmed: 1,
            completed: 1,
            cancelled: 1,
            usersBooked: {
              $size: {
                $reduce: {
                  input: "$userSets",
                  initialValue: [],
                  in: { $setUnion: ["$$value", "$$this"] },
                },
              },
            },
          },
        }],
      },
    },
  ];

  const [result, cuisines] = await Promise.all([
    Reservation.aggregate(pipeline),
    Restaurant.distinct("cuisine", { cuisine: { $nin: [null, ""] } }),
  ]);
  return { result: result[0] || { data: [], totals: [] }, cuisines: cuisines.sort() };
}

async function listAdminReservationsByRestaurant(restaurantId) {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return null;
  const reservations = await Reservation.find({ restaurant: restaurantId })
    .populate("user", "fullName email phoneNumber")
    .populate("restaurant")
    .sort({ createdAt: -1 });
  return { restaurant, reservations };
}

async function getAdminDashboardStats() {
  const usersWithLegacyReservations = await User.find({ "reservations.0": { $exists: true } });
  await Promise.all(usersWithLegacyReservations.map(migrateLegacyReservations));
  const [totalUsers, totalRestaurants, totalBookings, revenue, recentUsers, recentRestaurants, recentBookings] = await Promise.all([
    User.countDocuments({}),
    Restaurant.countDocuments({}),
    Reservation.countDocuments({}),
    Reservation.aggregate([
      { $match: { paymentStatus: "simulated_success" } },
      { $group: { _id: null, total: { $sum: "$totalPaid" } } },
    ]),
    User.find({}).sort({ createdAt: -1 }).limit(3).select("fullName createdAt").lean(),
    Restaurant.find({}).sort({ updatedAt: -1 }).limit(3).select("name updatedAt").lean(),
    Reservation.find({}).sort({ createdAt: -1 }).limit(3).populate("user", "fullName").populate("restaurant", "name").lean(),
  ]);
  return { totalUsers, totalRestaurants, totalBookings, totalRevenue: revenue[0]?.total || 0, recentUsers, recentRestaurants, recentBookings };
}

function countActiveReservationsForSlot(restaurantId, date, time, excludeReservationId) {
  const filter = {
    restaurant: restaurantId,
    date,
    time,
    status: { $in: ["pending", "confirmed"] },
  };
  if (excludeReservationId) filter._id = { $ne: excludeReservationId };
  return Reservation.countDocuments(filter);
}

async function completeAdminReservation(reservationId) {
  const reservation = await Reservation.findById(reservationId).populate("restaurant");
  if (!reservation) return null;
  if (reservation.status !== "confirmed") return { completionDenied: true };
  return reservation;
}

function createAnalyticsBuckets(range, now = new Date()) {
  const buckets = [];

  if (range === "6m") {
    const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    for (let index = 0; index < 6; index += 1) {
      const date = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + index, 1));
      buckets.push({
        key: date.toISOString().slice(0, 7),
        label: date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }),
      });
    }
    return {
      buckets,
      startDate: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)),
      mongoFormat: "%Y-%m",
    };
  }

  const days = range === "30d" ? 30 : 7;
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days + 1));
  for (let index = 0; index < days; index += 1) {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + index);
    buckets.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    });
  }
  return { buckets, startDate, mongoFormat: "%Y-%m-%d" };
}

function fillAnalyticsBuckets(buckets, grouped) {
  const counts = new Map(grouped.map((item) => [item._id, item.count]));
  return buckets.map((bucket) => ({ label: bucket.label, count: counts.get(bucket.key) || 0 }));
}

async function getAdminAnalytics(range) {
  const { buckets, startDate, mongoFormat } = createAnalyticsBuckets(range);
  const dateGroup = {
    $dateToString: { format: mongoFormat, date: "$createdAt", timezone: "UTC" },
  };

  const [
    totalUsers,
    totalRestaurants,
    totalBookings,
    bookingTrendGroups,
    userGrowthGroups,
    bookingStatusGroups,
    cuisineGroups,
    topRestaurants,
  ] = await Promise.all([
    User.countDocuments({}),
    Restaurant.countDocuments({}),
    Reservation.countDocuments({}),
    Reservation.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: dateGroup, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { role: { $ne: "admin" }, createdAt: { $gte: startDate } } },
      { $group: { _id: dateGroup, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Reservation.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Restaurant.aggregate([
      { $project: { cuisine: { $trim: { input: "$cuisine" } } } },
      { $match: { cuisine: { $ne: "" } } },
      { $group: { _id: { $toLower: "$cuisine" }, cuisine: { $first: "$cuisine" }, count: { $sum: 1 } } },
      { $sort: { count: -1, cuisine: 1 } },
    ]),
    Reservation.aggregate([
      { $group: { _id: "$restaurant", bookingCount: { $sum: 1 } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: Restaurant.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "restaurant",
        },
      },
      { $unwind: "$restaurant" },
      {
        $project: {
          _id: 0,
          restaurantId: { $toString: "$restaurant._id" },
          name: "$restaurant.name",
          cuisine: "$restaurant.cuisine",
          image: "$restaurant.image",
          bookingCount: 1,
        },
      },
    ]),
  ]);

  const knownStatuses = ["pending", "confirmed", "completed", "cancelled"];
  const statusCounts = new Map(bookingStatusGroups.map((item) => [item._id, item.count]));

  return {
    summary: { totalUsers, totalRestaurants, totalBookings },
    bookingTrends: fillAnalyticsBuckets(buckets, bookingTrendGroups),
    userGrowth: fillAnalyticsBuckets(buckets, userGrowthGroups),
    bookingStatuses: knownStatuses.map((status) => ({ status, count: statusCounts.get(status) || 0 })),
    restaurantsByCuisine: cuisineGroups.map((item) => ({ cuisine: item.cuisine, count: item.count })),
    topRestaurants,
  };
}

module.exports = {
  cancelReservation,
  completeAdminReservation,
  countActiveReservationsForSlot,
  createReservation,
  createUser,
  deleteUser,
  findByEmail,
  findById,
  findByValidPasswordResetToken,
  findReservationByTransactionId,
  getDashboardData,
  getAdminUserDetails,
  getAdminDashboardStats,
  getAdminAnalytics,
  getRestaurantById,
  getReservationWithDetails,
  listRestaurants,
  listAdminReservations,
  listAdminReservationsByRestaurant,
  listGroupedAdminReservations,
  listUserReservations,
  listUsers,
  toggleFavorite,
  updateReservation,
};
