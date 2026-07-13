declare const require: any;
declare const module: any;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ALLOWED_ROLES, BCRYPT_SALT_ROUNDS, JWT_EXPIRES_IN, JWT_SECRET } = require("../config/constant");
const { HttpException } = require("../exceptions/http-exception");
const userRepository = require("../repositories/user.repository");
const { isValidObjectId, toSafeUser } = require("../utils/apihelper.utils");

function formatDisplayDate(dateValue) {
  const date = new Date(dateValue);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatReservationItem(reservation) {
  return {
    _id: reservation._id?.toString(),
    restaurantId: reservation.restaurantId?.toString(),
    restaurantName: reservation.restaurantName,
    cuisine: reservation.cuisine,
    image: reservation.image,
    reservationDate: reservation.reservationDate,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    status: reservation.status,
    specialRequests: reservation.specialRequests,
  };
}

function createToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function register(payload) {
  const existingUser = await userRepository.findByEmail(payload.email);
  if (existingUser) {
    throw new HttpException(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, BCRYPT_SALT_ROUNDS);
  const user = await userRepository.createUser({
    fullName: payload.fullName,
    email: payload.email,
    phoneNumber: payload.phoneNumber || "",
    password: hashedPassword,
    role: "user",
  });

  return {
    token: createToken(user),
    user: toSafeUser(user),
  };
}

async function login(payload) {
  const user = await userRepository.findByEmail(payload.email, true);
  if (!user) {
    throw new HttpException(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.password);
  if (!passwordMatches) {
    throw new HttpException(401, "Invalid email or password");
  }

  return {
    token: createToken(user),
    user: toSafeUser(user),
  };
}

async function getUserByIdOrThrow(id) {
  if (!isValidObjectId(id)) {
    throw new HttpException(400, "Invalid user id");
  }

  const user = await userRepository.findById(id);
  if (!user) {
    throw new HttpException(404, "User not found");
  }

  return user;
}

async function getCurrentUser(userId) {
  const user = await getUserByIdOrThrow(userId);
  return toSafeUser(user);
}

async function listAdminUsers(query) {
  const { users, meta } = await userRepository.listUsers(query);
  return {
    users: users.map(toSafeUser),
    meta,
  };
}

async function createAdminUser(payload) {
  if (!ALLOWED_ROLES.includes(payload.role)) {
    throw new HttpException(400, "Role must be either 'user' or 'admin'");
  }

  const existingUser = await userRepository.findByEmail(payload.email);
  if (existingUser) {
    throw new HttpException(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, BCRYPT_SALT_ROUNDS);
  const user = await userRepository.createUser({
    ...payload,
    password: hashedPassword,
  });

  return toSafeUser(user);
}

async function updateAdminUser(id, payload) {
  const user = await getUserByIdOrThrow(id);

  if (payload.email && payload.email !== user.email) {
    const existingUser = await userRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new HttpException(409, "Email already exists");
    }
    user.email = payload.email;
  }

  if (payload.fullName !== undefined && payload.fullName) user.fullName = payload.fullName;
  if (payload.phoneNumber !== undefined) user.phoneNumber = payload.phoneNumber;
  if (payload.role !== undefined) {
    if (!ALLOWED_ROLES.includes(payload.role)) {
      throw new HttpException(400, "Role must be either 'user' or 'admin'");
    }
    user.role = payload.role;
  }
  if (payload.password !== undefined && payload.password) {
    user.password = await bcrypt.hash(payload.password, BCRYPT_SALT_ROUNDS);
  }

  await user.save();
  return toSafeUser(user);
}

async function updateProfile(userId, payload) {
  const user = await getUserByIdOrThrow(userId);

  if (payload.email && payload.email !== user.email) {
    const existingUser = await userRepository.findByEmail(payload.email);
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      throw new HttpException(409, "Email already exists");
    }
    user.email = payload.email;
  }

  if (payload.fullName !== undefined && payload.fullName) user.fullName = payload.fullName;
  if (payload.phoneNumber !== undefined) user.phoneNumber = payload.phoneNumber;
  if (payload.profilePicture !== undefined) user.profilePicture = payload.profilePicture;

  await user.save();
  return toSafeUser(user);
}

async function changePassword(userId, payload) {
  const user = await userRepository.findById(userId, true);

  if (!user) {
    throw new HttpException(404, "User not found");
  }

  const passwordMatches = await bcrypt.compare(payload.currentPassword, user.password);
  if (!passwordMatches) {
    throw new HttpException(401, "Current password is incorrect");
  }

  user.password = await bcrypt.hash(payload.newPassword, BCRYPT_SALT_ROUNDS);
  await user.save();
}

async function deleteAdminUser(id, currentUserId) {
  const user = await getUserByIdOrThrow(id);

  if (user._id.toString() === currentUserId.toString()) {
    throw new HttpException(400, "Cannot delete your own account");
  }

  await userRepository.deleteUser(id);
}

async function getDashboard(userId) {
  const dashboard = await userRepository.getDashboardData(userId);
  if (!dashboard.user) {
    return {
      user: null,
      stats: { bookings: 0, favorites: 0, averageRating: 0 },
      favorites: [],
      upcomingReservations: [],
      recentHistory: [],
    };
  }

  const favorites = (dashboard.favorites || []).map((restaurant) => ({
    _id: restaurant._id?.toString(),
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    rating: restaurant.rating,
    image: restaurant.image,
    isOpen: restaurant.isOpen,
    status: restaurant.isOpen ? "Available Tonight" : "Closed",
    location: restaurant.location,
    priceRange: restaurant.priceRange,
    price: restaurant.price,
  }));

  const upcomingReservations = (dashboard.upcomingReservations || []).map(formatReservationItem);
  const recentHistory = (dashboard.recentHistory || []).map((reservation) => ({
    ...formatReservationItem(reservation),
    summary: reservation.status === "completed" ? "Completed reservation" : "Visited restaurant",
  }));

  return {
    user: toSafeUser(dashboard.user),
    stats: {
      bookings: dashboard.stats?.bookings || 0,
      favorites: dashboard.stats?.favorites || 0,
      averageRating: Number(dashboard.stats?.averageRating || 0),
    },
    favorites,
    upcomingReservations,
    recentHistory,
  };
}

async function listRestaurants() {
  return userRepository.listRestaurants();
}

async function getRestaurant(id) {
  if (!isValidObjectId(id)) {
    throw new HttpException(400, "Invalid restaurant id");
  }

  const restaurant = await userRepository.getRestaurantById(id);
  if (!restaurant) {
    throw new HttpException(404, "Restaurant not found");
  }

  return restaurant;
}

async function toggleFavorite(userId, restaurantId) {
  if (!isValidObjectId(restaurantId)) {
    throw new HttpException(400, "Invalid restaurant id");
  }

  const result = await userRepository.toggleFavorite(userId, restaurantId);
  if (!result) {
    throw new HttpException(404, "User not found");
  }

  return {
    action: result.isFavorite ? "added" : "removed",
    favorites: (result.favorites.favorites || []).map((restaurant) => ({
      _id: restaurant._id?.toString(),
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: restaurant.rating,
      image: restaurant.image,
      isOpen: restaurant.isOpen,
      status: restaurant.isOpen ? "Available Tonight" : "Closed",
    })),
  };
}

async function createReservation(userId, payload) {
  if (!payload.restaurantId || !isValidObjectId(payload.restaurantId)) {
    throw new HttpException(400, "Invalid restaurant id");
  }

  const reservation = await userRepository.createReservation(userId, payload);
  return formatReservationItem(reservation);
}

async function updateReservation(userId, reservationId, payload) {
  const reservation = await userRepository.updateReservation(userId, reservationId, payload);
  if (!reservation) {
    throw new HttpException(404, "Reservation not found");
  }

  return formatReservationItem(reservation);
}

async function cancelReservation(userId, reservationId) {
  const reservation = await userRepository.cancelReservation(userId, reservationId);
  if (!reservation) {
    throw new HttpException(404, "Reservation not found");
  }

  return formatReservationItem(reservation);
}

module.exports = {
  cancelReservation,
  changePassword,
  createAdminUser,
  createReservation,
  createToken,
  deleteAdminUser,
  getCurrentUser,
  getDashboard,
  getRestaurant,
  getUserByIdOrThrow,
  listAdminUsers,
  listRestaurants,
  login,
  register,
  toggleFavorite,
  updateAdminUser,
  updateProfile,
  updateReservation,
};
