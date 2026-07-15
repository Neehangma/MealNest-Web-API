declare const require: any;
declare const module: any;

const mongoose = require("mongoose");
const User = require("../models/user.model");
const Restaurant = require("../models/restaurant.model");
const Reservation = require("../models/reservation.model");
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

async function updateReservation(userId, reservationId, payload) {
  const reservation = await Reservation.findOne({ _id: reservationId, user: userId });
  if (!reservation) return null;

  if (payload.date !== undefined) reservation.date = payload.date;
  if (payload.time !== undefined) reservation.time = payload.time;
  if (payload.guests !== undefined) reservation.guests = payload.guests;
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

module.exports = {
  cancelReservation,
  createReservation,
  createUser,
  deleteUser,
  findByEmail,
  findById,
  getDashboardData,
  getRestaurantById,
  listRestaurants,
  listAdminReservations,
  listUserReservations,
  listUsers,
  toggleFavorite,
  updateReservation,
};
