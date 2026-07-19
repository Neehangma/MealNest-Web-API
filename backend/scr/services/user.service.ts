declare const require: any;
declare const module: any;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ALLOWED_ROLES, BCRYPT_SALT_ROUNDS, JWT_EXPIRES_IN, JWT_SECRET } = require("../config/constant");
const { HttpException } = require("../exceptions/http-exception");
const userRepository = require("../repositories/user.repository");
const { sendBookingConfirmationEmail } = require("./emailService");
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
  const populatedRestaurant = reservation.restaurant && typeof reservation.restaurant === "object" && reservation.restaurant.name
    ? reservation.restaurant
    : null;
  return {
    _id: reservation._id?.toString(),
    restaurantId: (populatedRestaurant?._id || reservation.restaurant || reservation.restaurantId)?.toString(),
    restaurantName: populatedRestaurant?.name || reservation.restaurantName,
    cuisine: populatedRestaurant?.cuisine || reservation.cuisine,
    image: populatedRestaurant?.image || reservation.image,
    reservationDate: reservation.reservationDate,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    status: reservation.status,
    specialRequests: reservation.specialRequests,
    bookingReference: reservation.bookingReference,
    location: populatedRestaurant?.location || reservation.location,
    restaurantLocation: populatedRestaurant?.location || reservation.location,
    restaurantAddress: populatedRestaurant?.address || reservation.restaurantAddress,
    restaurantPhone: populatedRestaurant?.phone || "",
    restaurant: populatedRestaurant ? {
      _id: populatedRestaurant._id?.toString(), name: populatedRestaurant.name,
      cuisine: populatedRestaurant.cuisine, image: populatedRestaurant.image,
      location: populatedRestaurant.location, address: populatedRestaurant.address,
      phone: populatedRestaurant.phone, description: populatedRestaurant.description,
      priceRange: populatedRestaurant.priceRange, hours: populatedRestaurant.hours,
    } : undefined,
    paymentMethod: reservation.paymentMethod,
    paymentStatus: reservation.paymentStatus,
    totalPaid: reservation.totalPaid,
    totalAmount: reservation.totalPaid,
    partySize: reservation.guests,
    transactionId: reservation.transactionId || reservation.bookingReference,
    createdAt: reservation.createdAt,
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

  if (payload.fullName !== undefined && !payload.fullName) throw new HttpException(400, "Full name is required");
  if (payload.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) throw new HttpException(400, "Enter a valid email address");
  if (payload.phoneNumber && !/^[0-9+()\-\s]{7,20}$/.test(payload.phoneNumber)) throw new HttpException(400, "Enter a valid phone number");

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
  if (payload.location !== undefined) user.location = payload.location;
  if (payload.bio !== undefined) user.bio = payload.bio;

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
      cancelledReservations: [],
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
  const cancelledReservations = (dashboard.cancelledReservations || []).map(formatReservationItem);

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
    cancelledReservations,
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
      location: restaurant.location,
      priceRange: restaurant.priceRange,
      price: restaurant.price,
    })),
  };
}

async function createReservation(userId, payload) {
  if (!payload.restaurantId || !isValidObjectId(payload.restaurantId)) {
    throw new HttpException(400, "Invalid restaurant id");
  }

  if (!["esewa", "mobile_banking"].includes(payload.paymentMethod)) {
    throw new HttpException(400, "Payment method must be eSewa or Mobile Banking");
  }

  if (payload.paymentStatus !== "simulated_success") {
    throw new HttpException(400, "Payment must succeed before creating a reservation");
  }

  if (!payload.customerName || !/^(97|98)\d{8}$/.test(String(payload.customerPhone || ""))) {
    throw new HttpException(400, "Valid customer payment details are required");
  }

  if (!Number.isFinite(Number(payload.totalPaid)) || Number(payload.totalPaid) < 0) {
    throw new HttpException(400, "Invalid payment amount");
  }

  const reservation = await userRepository.createReservation(userId, payload);
  if (!reservation) {
    throw new HttpException(404, "User not found");
  }

  const reservationWithDetails = await userRepository.getReservationWithDetails(reservation._id, userId) || reservation;
  const booking = formatReservationItem(reservationWithDetails);
  const user = await userRepository.findById(userId);
  booking.customerName = String(payload.customerName || "").trim() || booking.customerName || user?.fullName?.trim() || user?.name?.trim() || "Guest";
  booking.customerEmail = user?.email || "";
  booking.customerPhone = user?.phoneNumber?.trim() || String(payload.customerPhone || "").trim();
  let emailSent = false;

  const authenticatedEmail = String(user?.email || "").trim().toLowerCase();
  const validAuthenticatedEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authenticatedEmail);
  if (!validAuthenticatedEmail) {
    console.warn(`Booking ${reservation.bookingReference} saved; confirmation email skipped because the authenticated account has no valid email.`);
  } else if (booking.status === "confirmed" && booking.paymentStatus === "simulated_success") {
    try {
      await sendBookingConfirmationEmail({
        recipientEmail: authenticatedEmail,
        customerName: booking.customerName,
        booking: {
          ...booking,
          customerName: booking.customerName,
          customerEmail: authenticatedEmail,
          customerPhone: booking.customerPhone || "",
        },
      });
      emailSent = true;
    } catch (error) {
      console.error(`Booking confirmation email failed for ${reservation.bookingReference}: ${error.message}`);
    }
  }

  return { booking, emailSent };
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
  if (reservation.cancellationDenied) {
    throw new HttpException(400, "This booking can no longer be cancelled");
  }

  return formatReservationItem(reservation);
}

async function listMyReservations(userId) {
  const reservations = await userRepository.listUserReservations(userId);
  if (!reservations) throw new HttpException(404, "User not found");
  return reservations.map(formatReservationItem);
}

async function getReservation(userId, reservationId) {
  if (!isValidObjectId(reservationId)) throw new HttpException(400, "Invalid reservation id");
  const reservation = await userRepository.getReservationWithDetails(reservationId, userId);
  if (!reservation) throw new HttpException(404, "Reservation not found");
  return formatReservationItem(reservation);
}

async function listAdminReservations() {
  const reservations = await userRepository.listAdminReservations();
  return reservations.map((reservation) => {
    const booking = formatReservationItem(reservation);
    return {
      ...booking,
      customer: reservation.user ? {
        _id: reservation.user._id?.toString(),
        fullName: reservation.user.fullName,
        email: reservation.user.email,
        phoneNumber: reservation.user.phoneNumber,
      } : null,
    };
  });
}

async function getAdminDashboardStats() {
  const result = await userRepository.getAdminDashboardStats();
  const activities = [
    ...result.recentUsers.map((user) => ({ type: "user", title: "User registered", text: `${user.fullName || "A user"} joined MealNest.`, createdAt: user.createdAt })),
    ...result.recentRestaurants.map((restaurant) => ({ type: "restaurant", title: "Restaurant updated", text: `${restaurant.name} was updated.`, createdAt: restaurant.updatedAt })),
    ...result.recentBookings.map((booking) => ({ type: "booking", title: "Booking created", text: `${booking.user?.fullName || "A user"} booked ${booking.restaurant?.name || booking.restaurantName || "a restaurant"}.`, createdAt: booking.createdAt })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
  return { stats: { totalUsers: result.totalUsers, totalRestaurants: result.totalRestaurants, totalBookings: result.totalBookings }, activities };
}

module.exports = {
  cancelReservation,
  changePassword,
  createAdminUser,
  createReservation,
  createToken,
  deleteAdminUser,
  getCurrentUser,
  getAdminDashboardStats,
  getDashboard,
  getRestaurant,
  getReservation,
  getUserByIdOrThrow,
  listAdminUsers,
  listAdminReservations,
  listMyReservations,
  listRestaurants,
  login,
  register,
  toggleFavorite,
  updateAdminUser,
  updateProfile,
  updateReservation,
};
