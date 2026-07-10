const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const Restaurant = require("../models/restaurant.model.js");
const { parsePagination } = require("../utils/apihelper.utils.js");

const defaultSlots = ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"];
const restaurant = (name, cuisine, image, description, options = {}) => ({
  name, cuisine, image, description, location: options.location || "Kathmandu",
  rating: options.rating || 4.6, reviewCount: options.reviewCount || 120,
  priceRange: options.priceRange || "$$", isOpen: true,
  address: options.address || `${name}, Kathmandu, Nepal`, phone: options.phone || "+977 01-5550100",
  hours: options.hours || "Mon-Sun: 11:00 AM - 10:00 PM", featured: Boolean(options.featured),
  availableTimeSlots: options.availableTimeSlots || defaultSlots,
  features: options.features || ["Reservations", "Family Friendly", `${cuisine} Cuisine`],
});

const seedRestaurants = [
  restaurant("Amour", "French", "/images/Amour.png", "Elegant French dining with classic dishes, pastries, and a romantic atmosphere.", { rating: 4.8, priceRange: "$$$", featured: true }),
  restaurant("Antica", "Italian", "/images/Antica.png", "Traditional Italian restaurant serving handmade pasta, pizza, and authentic regional dishes.", { rating: 4.7 }),
  restaurant("Bella", "Italian", "/images/bella.png", "A welcoming Italian restaurant known for fresh pasta, wood-fired pizza, and family-style dining.", { location: "Thamel", rating: 4.6 }),
  restaurant("Bhanchha", "Nepali", "/images/bhanchha.png", "Authentic Nepali cuisine featuring dal bhat, momo, curries, and traditional homemade flavours.", { location: "Patan", rating: 4.8, priceRange: "$", featured: true }),
  restaurant("Chulo", "Nepali", "/images/chulo.png", "Traditional Nepali restaurant serving momo, thakali sets, grilled meats, and local favourites.", { location: "Lazimpat", rating: 4.7 }),
  restaurant("Golden", "Chinese", "/images/Golden.png", "Chinese restaurant offering noodles, fried rice, dumplings, stir-fries, and family platters.", { location: "New Road", rating: 4.5 }),
  restaurant("Hankook Sarang", "Korean", "/images/hankook.png", "Authentic Korean dining featuring barbecue, bibimbap, kimchi, and traditional side dishes.", { location: "Jhamsikhel", rating: 4.9, priceRange: "$$$", featured: true }),
  restaurant("Kimchi House", "Korean", "/images/kimchi.png", "Korean comfort food restaurant specialising in kimchi dishes, soups, barbecue, and rice bowls.", { location: "Thamel", rating: 4.7 }),
  restaurant("La Vie", "French", "/images/Lavie.png", "Modern French cuisine served in a stylish and relaxed dining environment.", { location: "Durbar Marg", rating: 4.7, priceRange: "$$$" }),
  restaurant("The Mahal", "Indian", "/images/mahal.jpg", "Indian restaurant serving rich curries, biryani, tandoori dishes, naan, and vegetarian options.", { location: "Kupondole", rating: 4.8 }),
  restaurant("Napoli", "Italian", "/images/napoli.png", "Neapolitan-style pizza restaurant with fresh ingredients, pasta, and classic Italian desserts.", { location: "Boudha", rating: 4.6 }),
  restaurant("Osaka", "Japanese", "/images/osaka.png", "Japanese restaurant offering sushi, ramen, tempura, rice bowls, and seasonal dishes.", { location: "Baluwatar", rating: 4.8, priceRange: "$$$" }),
  restaurant("Roja", "Mexican", "/images/Roja.png", "Mexican restaurant serving tacos, burritos, enchiladas, grilled dishes, and fresh salsa.", { location: "Thamel", rating: 4.5 }),
  restaurant("Roma", "Italian", "/images/roma.png", "Classic Roman-inspired restaurant offering pasta, pizza, seafood, and traditional Italian dishes.", { location: "Sanepa", rating: 4.7 }),
  restaurant("Sakura Restaurant", "Japanese", "/images/Sakura.png", "Japanese restaurant specialising in sushi, sashimi, ramen, tempura, and bento meals.", { location: "Jhamsikhel", rating: 4.9, priceRange: "$$$", featured: true }),
  restaurant("Sarang", "Korean", "/images/Sarang.png", "Korean restaurant serving barbecue, hot pots, bibimbap, fried chicken, and traditional side dishes.", { location: "Lazimpat", rating: 4.6 }),
  restaurant("Sensa", "Contemporary", "/images/Sensa.png", "Contemporary restaurant offering modern international dishes in an elegant atmosphere.", { location: "Durbar Marg", rating: 4.8, priceRange: "$$$" }),
  restaurant("Seoul Kitchen", "Korean", "/images/Seoul.png", "Korean restaurant known for barbecue, rice bowls, soups, noodles, and authentic Seoul-style flavours.", { location: "Boudha", rating: 4.7 }),
];

async function ensureSeedRestaurants() {
  await Restaurant.bulkWrite(seedRestaurants.map((record) => ({
    updateOne: { filter: { name: record.name }, update: { $set: record }, upsert: true },
  })));
  return Restaurant.find({}).sort({ name: 1 });
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
    return { user: null, stats: { bookings: 0, favorites: 0, averageRating: 0 }, favorites: [], upcomingReservations: [], recentHistory: [] };
  }

  const sortedReservations = [...(user.reservations || [])].sort((a, b) => new Date(a.reservationDate) - new Date(b.reservationDate));
  const now = new Date();

  const upcomingReservations = sortedReservations.filter((reservation) => {
    const reservationDate = new Date(reservation.reservationDate);
    return reservation.status !== "cancelled" && reservationDate >= now;
  });

  const recentHistory = sortedReservations.filter((reservation) => {
    const reservationDate = new Date(reservation.reservationDate);
    return reservation.status !== "cancelled" && reservationDate < now;
  });

  const favoriteRestaurants = (user.favorites && user.favorites.length > 0)
    ? user.favorites
    : restaurants.slice(0, 4);

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

  const reservation = {
    restaurantId: payload.restaurantId,
    restaurantName: payload.restaurantName,
    cuisine: payload.cuisine || "",
    image: payload.image || "",
    reservationDate: new Date(payload.reservationDate),
    date: payload.date,
    time: payload.time,
    guests: payload.guests || 2,
    status: payload.status || "confirmed",
    specialRequests: payload.specialRequests || "",
  };

  user.reservations.unshift(reservation);
  await user.save();
  return reservation;
}

async function updateReservation(userId, reservationId, payload) {
  const user = await User.findById(userId);
  if (!user) return null;

  const reservation = user.reservations.id(reservationId);
  if (!reservation) return null;

  if (payload.date !== undefined) reservation.date = payload.date;
  if (payload.time !== undefined) reservation.time = payload.time;
  if (payload.guests !== undefined) reservation.guests = payload.guests;
  if (payload.specialRequests !== undefined) reservation.specialRequests = payload.specialRequests;
  if (payload.reservationDate !== undefined) reservation.reservationDate = new Date(payload.reservationDate);

  await user.save();
  return reservation;
}

async function cancelReservation(userId, reservationId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const reservation = user.reservations.id(reservationId);
  if (!reservation) return null;

  reservation.status = "cancelled";
  await user.save();
  return reservation;
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
  listUsers,
  toggleFavorite,
  updateReservation,
};
