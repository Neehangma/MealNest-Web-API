declare const require: any;
declare const module: any;

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { ALLOWED_ROLES, BCRYPT_SALT_ROUNDS, JWT_EXPIRES_IN, JWT_SECRET } = require("../config/constant");
const { HttpException } = require("../exceptions/http-exception");
const reviewRepository = require("../repositories/review.repository");
const userRepository = require("../repositories/user.repository");
const {
  sendBookingCancellationEmail,
  sendBookingConfirmationEmail,
  sendPasswordResetEmail,
  sendReservationUpdatedEmail,
} = require("./emailService");

const { isValidObjectId, toSafeUser } = require("../utils/apihelper.utils");
const { isPhoneNumberValid, isOptionalPhoneNumberValid, PHONE_VALIDATION_MESSAGE } = require("../utils/phone-validation");

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
    tableNumber: reservation.tableNumber,
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
      availableTimeSlots: populatedRestaurant.availableTimeSlots || [],
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

function maskEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  const [local, domain] = email.split("@");
  if (!local || !domain) return "invalid";
  return `${local.slice(0, 2)}***@${domain}`;
}

function createToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function reservationMoment(dateValue, timeValue) {
  const dateText = String(dateValue || "").slice(0, 10);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateText)
    ? new Date(`${dateText}T00:00:00`)
    : new Date(dateValue);
  const match = String(timeValue || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match || Number.isNaN(date.getTime())) return date;
  let hours = Number(match[1]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  date.setHours(hours, Number(match[2]), 0, 0);
  return date;
}

async function validateReservationAvailability({
  restaurant,
  date,
  time,
  guests,
  excludeReservationId,
  enforceConfiguredTime = true,
}) {
  if (!restaurant || restaurant.isOpen === false || restaurant.isActive === false) {
    throw new HttpException(400, "This restaurant is not currently accepting reservations.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(reservationMoment(date, time).getTime())) {
    throw new HttpException(400, "Enter a valid reservation date and time.");
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    throw new HttpException(400, "Guest count must be between 1 and 20.");
  }
  if (
    enforceConfiguredTime &&
    restaurant.availableTimeSlots?.length &&
    !restaurant.availableTimeSlots.includes(time)
  ) {
    throw new HttpException(409, "The selected reservation time is unavailable.");
  }

  const suitableTables = (restaurant.tables || []).filter(
    (table) => table.isAvailable !== false && table.capacity >= guests
  );
  if (restaurant.tables?.length && suitableTables.length === 0) {
    throw new HttpException(409, "No table is available for this party size.");
  }
  if (suitableTables.length) {
    const activeBookings = await userRepository.countActiveReservationsForSlot(
      restaurant._id,
      date,
      time,
      excludeReservationId
    );
    if (activeBookings >= suitableTables.length) {
      throw new HttpException(409, "The selected reservation time is fully booked.");
    }
    return suitableTables[activeBookings]?.tableNumber;
  }
  return undefined;
}

const PASSWORD_RESET_EXPIRY_MS = 15 * 60 * 1000;

function hashPasswordResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function requestPasswordReset(payload) {
  const user = await userRepository.findByEmail(payload.email);
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = hashPasswordResetToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
  await user.save();

  try {
    await sendPasswordResetEmail({
      recipientEmail: user.email,
      customerName: user.fullName,
      resetToken,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    console.error("Password reset email failed:", error instanceof Error ? error.message : "Unknown error");
  }
}

async function resetPassword(token, payload) {
  const hashedToken = hashPasswordResetToken(String(token || ""));
  const user = await userRepository.findByValidPasswordResetToken(hashedToken);

  if (!user) {
    throw new HttpException(400, "This password reset link is invalid or has expired.");
  }

  user.password = await bcrypt.hash(payload.newPassword, BCRYPT_SALT_ROUNDS);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
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

async function getAdminUserDetails(id) {
  if (!isValidObjectId(id)) {
    throw new HttpException(400, "Invalid user id");
  }

  const { user, reservations, reviews } = await userRepository.getAdminUserDetails(id);
  if (!user) {
    throw new HttpException(404, "User not found");
  }

  const now = new Date();
  const ratingTotal = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);

  return {
    user: {
      ...toSafeUser(user),
      authenticationProvider: user.authenticationProvider || user.provider || null,
      emailVerified: typeof user.emailVerified === "boolean" ? user.emailVerified : null,
      isActive: typeof user.isActive === "boolean" ? user.isActive : true,
      accountStatus: user.isActive === false ? "inactive" : "active",
    },
    activity: {
      totalReservations: reservations.length,
      upcomingReservations: reservations.filter((reservation) =>
        ["confirmed", "pending"].includes(reservation.status) &&
        new Date(reservation.reservationDate) >= now
      ).length,
      completedReservations: reservations.filter((reservation) => reservation.status === "completed").length,
      cancelledReservations: reservations.filter((reservation) => reservation.status === "cancelled").length,
      totalReviews: reviews.length,
      averageReviewRating: reviews.length ? Number((ratingTotal / reviews.length).toFixed(1)) : 0,
      totalFavorites: Array.isArray(user.favorites) ? user.favorites.length : 0,
    },
    favorites: (user.favorites || []).map((restaurant) => ({
      id: restaurant._id?.toString(),
      name: restaurant.name,
      cuisine: restaurant.cuisine || "",
      image: restaurant.image || "",
    })),
    reservations: reservations.map((reservation) => ({
      id: reservation._id.toString(),
      restaurantName: reservation.restaurant?.name || reservation.restaurantName || "Restaurant",
      reservationDate: reservation.reservationDate,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      tableNumber: reservation.tableNumber ?? null,
      paymentStatus: reservation.paymentStatus || "",
      status: reservation.status,
      totalAmount: Number(reservation.totalPaid || 0),
      createdAt: reservation.createdAt,
    })),
    reviews: reviews.map((review) => ({
      id: review._id.toString(),
      restaurantName: review.restaurantId?.name || "Restaurant",
      rating: review.rating,
      comment: review.comment,
      status: review.status || "published",
      createdAt: review.createdAt,
    })),
  };
}

async function createAdminUser(payload) {
  if (!ALLOWED_ROLES.includes(payload.role)) {
    throw new HttpException(400, "Role must be either 'user' or 'admin'");
  }

  const existingUser = await userRepository.findByEmail(payload.email);
  if (existingUser) {
    throw new HttpException(409, "A user with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(payload.password, BCRYPT_SALT_ROUNDS);
  let user;
  try {
    user = await userRepository.createUser({
      ...payload,
      password: hashedPassword,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new HttpException(409, "A user with this email already exists.");
    }
    throw error;
  }

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
  if (!isOptionalPhoneNumberValid(payload.phoneNumber)) throw new HttpException(400, PHONE_VALIDATION_MESSAGE);

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
    throw new HttpException(401, "Current password is incorrect.");
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

  if (!isPhoneNumberValid(String(payload.customerPhone || ""))) throw new HttpException(400, PHONE_VALIDATION_MESSAGE);

  if (payload.paymentMethod === "esewa") {
    const esewaId = String(payload.esewaId || "").trim();
    const validEsewaId = /^\d{10}$/.test(esewaId);
    if (!validEsewaId) throw new HttpException(400, "eSewa ID must contain exactly 10 digits.");
  }

  if (payload.paymentMethod === "mobile_banking" && !/^\d{10,16}$/.test(String(payload.bankAccountNumber || ""))) {
    throw new HttpException(400, "Bank account number must contain between 10 and 16 digits.");
  }

  if (!Number.isFinite(Number(payload.totalPaid)) || Number(payload.totalPaid) < 0) {
    throw new HttpException(400, "Invalid payment amount");
  }

  const existingReservation = await userRepository.findReservationByTransactionId(
    userId,
    payload.transactionId,
  );
  if (existingReservation) {
    const existingUser = await userRepository.findById(userId);
    return {
      booking: formatReservationItem(existingReservation),
      emailSent: null,
      emailRecipient: String(existingUser?.email || "").trim().toLowerCase(),
    };
  }

  const restaurant = await userRepository.getRestaurantById(payload.restaurantId);
  if (!restaurant) throw new HttpException(404, "Restaurant not found");
  const date = String(payload.date || payload.reservationDate || "").slice(0, 10);
  const guests = Number(payload.guests);
  const allocatedTableNumber = await validateReservationAvailability({
    restaurant,
    date,
    time: String(payload.time || ""),
    guests,
    // Checkout historically offers the application's standard half-hour slots.
    // Capacity is still checked here; configured restaurant slots are enforced
    // when an existing reservation is modified.
    enforceConfiguredTime: false,
  });
  const requestedTableNumber = Number(payload.tableNumber);
  const tableNumber = allocatedTableNumber ?? (
    Number.isInteger(requestedTableNumber) && requestedTableNumber > 0
      ? requestedTableNumber
      : undefined
  );
  const reservationPayload = {
    ...payload,
    date,
    reservationDate: date,
    guests,
    tableNumber,
    status: "confirmed",
  };
  delete reservationPayload.esewaId;
  delete reservationPayload.bankAccountNumber;
  const reservation = await userRepository.createReservation(userId, reservationPayload);
  if (!reservation) {
    throw new HttpException(404, "User not found");
  }

  const reservationWithDetails = await userRepository.getReservationWithDetails(reservation._id, userId) || reservation;
  const booking = formatReservationItem(reservationWithDetails);
  const user = await userRepository.findById(userId);
  booking.customerName = String(payload.customerName || "").trim() || booking.customerName || user?.fullName?.trim() || user?.name?.trim() || "Guest";
  booking.customerEmail = user?.email || "";
  booking.customerPhone = user?.phoneNumber?.trim() || String(payload.customerPhone || "").trim();
  let emailSent = null;
  let emailError;

  const authenticatedEmail = String(user?.email || "").trim().toLowerCase();
  const confirmationRecipient = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const validConfirmationRecipient = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    confirmationRecipient,
  );
  if (!validConfirmationRecipient) {
    emailSent = false;
    emailError = "Confirmation email could not be sent";
    console.warn(`Booking ${reservation.bookingReference} saved; confirmation recipient is invalid.`);
  } else if (booking.status === "confirmed" && booking.paymentStatus === "simulated_success") {
    if (process.env.NODE_ENV !== "production") {
      console.log("Booking confirmation email queued", {
        bookingId: reservation._id.toString(),
        userId: userId.toString(),
        recipient: maskEmail(confirmationRecipient),
      });
    }
    sendBookingConfirmationEmail({
        recipientEmail: confirmationRecipient,
        customerName: booking.customerName,
        booking: {
          ...booking,
          customerName: booking.customerName,
          customerEmail: authenticatedEmail,
          customerPhone: booking.customerPhone || "",
        },
      })
      .then((emailResult) => {
        if (process.env.NODE_ENV !== "production") {
          console.log("Booking confirmation email sent", {
            bookingId: reservation._id.toString(),
            recipient: maskEmail(confirmationRecipient),
            messageId: emailResult?.messageId || "available",
          });
        }
      })
      .catch((error) => {
        console.warn("Booking remains confirmed although its email could not be sent", {
          bookingId: reservation._id.toString(),
          userId: userId.toString(),
          recipient: maskEmail(confirmationRecipient),
          code: error?.code || "UNKNOWN",
          message: error?.message || "Email delivery failed",
        });
      });
  }

  return {
    booking,
    emailSent,
    emailRecipient: confirmationRecipient,
    emailError,
  };
}

async function updateReservation(userId, reservationId, payload) {
  if (!isValidObjectId(reservationId)) throw new HttpException(400, "Invalid reservation id");
  const current = await userRepository.getReservationWithDetails(reservationId, userId);
  if (!current) {
    throw new HttpException(404, "Reservation not found");
  }
  if (!["pending", "confirmed"].includes(current.status)) {
    throw new HttpException(400, "Only upcoming pending or confirmed bookings can be modified.");
  }
  const currentMoment = reservationMoment(current.date || current.reservationDate, current.time);
  if (currentMoment.getTime() - Date.now() < 2 * 60 * 60 * 1000) {
    throw new HttpException(400, "Bookings cannot be modified after they start or within 2 hours of the reservation.");
  }

  const date = String(payload.date || current.date || current.reservationDate).slice(0, 10);
  const time = String(payload.time || current.time);
  const guests = payload.guests === undefined ? current.guests : Number(payload.guests);
  if (reservationMoment(date, time).getTime() - Date.now() < 2 * 60 * 60 * 1000) {
    throw new HttpException(400, "The new reservation time must be at least 2 hours from now.");
  }
  const restaurant = current.restaurant;
  const tableNumber = await validateReservationAvailability({
    restaurant,
    date,
    time,
    guests,
    excludeReservationId: current._id,
  });

  const reservation = await userRepository.updateReservation(userId, reservationId, {
    date,
    reservationDate: date,
    time,
    guests,
    tableNumber,
  });
  const updated = await userRepository.getReservationWithDetails(reservation._id, userId) || reservation;
  const user = await userRepository.findById(userId);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(user?.email || ""))) {
    try {
      await sendReservationUpdatedEmail({
        recipientEmail: user.email,
        customerName: user.fullName,
        booking: formatReservationItem(updated),
      });
    } catch (error) {
      console.error(`Reservation update email failed for ${reservation.bookingReference}: ${error.message}`);
    }
  }

  return formatReservationItem(updated);
}

async function cancelReservation(userId, reservationId) {
  if (!isValidObjectId(reservationId)) throw new HttpException(400, "Invalid reservation id");
  const reservation = await userRepository.cancelReservation(userId, reservationId);
  if (!reservation) {
    throw new HttpException(404, "Reservation not found");
  }
  if (reservation.cancellationDenied) {
    throw new HttpException(400, "This booking can no longer be cancelled");
  }

  const cancelled = await userRepository.getReservationWithDetails(reservation._id, userId) || reservation;
  const user = await userRepository.findById(userId);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(user?.email || ""))) {
    try {
      await sendBookingCancellationEmail({
        recipientEmail: user.email,
        customerName: user.fullName,
        booking: formatReservationItem(cancelled),
      });
    } catch (error) {
      console.error(`Booking cancellation email failed for ${reservation.bookingReference}: ${error.message}`);
    }
  }

  return formatReservationItem(cancelled);
}

async function completeAdminReservation(reservationId) {
  if (!isValidObjectId(reservationId)) throw new HttpException(400, "Invalid reservation id");
  const reservation = await userRepository.completeAdminReservation(reservationId);
  if (!reservation) throw new HttpException(404, "Reservation not found");
  if (reservation.completionDenied) {
    throw new HttpException(400, "Only confirmed bookings can be marked as completed.");
  }
  if (reservationMoment(reservation.date || reservation.reservationDate, reservation.time).getTime() > Date.now()) {
    throw new HttpException(400, "A booking can only be completed after its reservation time.");
  }
  reservation.status = "completed";
  await reservation.save();
  return formatReservationItem(reservation);
}

async function listMyReservations(userId) {
  const reservations = await userRepository.listUserReservations(userId);
  if (!reservations) throw new HttpException(404, "User not found");
  const reviews = await reviewRepository.findByReservationIds(
    reservations.map((reservation) => reservation._id),
    userId,
  );
  const reviewsByReservation = new Map(reviews.map((review) => [
    review.reservationId.toString(),
    {
      _id: review._id.toString(),
      id: review._id.toString(),
      restaurantId: review.restaurantId.toString(),
      reservationId: review.reservationId.toString(),
      userId: review.userId.toString(),
      userName: review.userName,
      userProfileImage: review.userProfileImage || "",
      rating: review.rating,
      comment: review.comment,
      status: review.status || "published",
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    },
  ]));
  return reservations.map((reservation) => ({
    ...formatReservationItem(reservation),
    review: reviewsByReservation.get(reservation._id.toString()),
  }));
}

async function getReservation(userId, reservationId) {
  if (!isValidObjectId(reservationId)) throw new HttpException(400, "Invalid reservation id");
  const reservation = await userRepository.getReservationWithDetails(reservationId, userId);
  if (!reservation) throw new HttpException(404, "Reservation not found");
  return formatReservationItem(reservation);
}

async function sendReservationConfirmation(userId, reservationId) {
  if (!isValidObjectId(reservationId)) throw new HttpException(400, "Invalid reservation id");
  const reservation = await userRepository.getReservationWithDetails(reservationId, userId);
  if (!reservation) throw new HttpException(404, "Reservation not found");

  const booking = formatReservationItem(reservation);
  if (booking.status !== "confirmed" || booking.paymentStatus !== "simulated_success") {
    throw new HttpException(400, "Only confirmed paid bookings can receive a confirmation email");
  }

  const user = await userRepository.findById(userId);
  const authenticatedEmail = String(user?.email || "").trim().toLowerCase();
  const confirmationRecipient = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(confirmationRecipient)) {
    throw new HttpException(500, "Booking confirmation recipient is not configured");
  }

  booking.customerName = user?.fullName?.trim() || "Guest";
  booking.customerEmail = authenticatedEmail;
  booking.customerPhone = user?.phoneNumber?.trim() || "";
  await sendBookingConfirmationEmail({
    recipientEmail: confirmationRecipient,
    customerName: booking.customerName,
    booking,
  });
  return booking;
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

async function listGroupedAdminReservations(query) {
  const status = String(query.status || "").toLowerCase();
  const sort = String(query.sort || "newest").toLowerCase();
  const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
  const allowedSorts = ["highest", "lowest", "newest", "oldest"];
  if (status && !allowedStatuses.includes(status)) {
    throw new HttpException(400, "Booking status filter is invalid.");
  }
  if (!allowedSorts.includes(sort)) {
    throw new HttpException(400, "Booking sort option is invalid.");
  }

  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);
  const search = String(query.search || "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cuisine = String(query.cuisine || "").trim();
  const { result, cuisines } = await userRepository.listGroupedAdminReservations({
    status,
    sort,
    search,
    cuisine,
    skip: (page - 1) * limit,
    limit,
  });
  const totals = result.totals[0] || {
    totalRestaurants: 0,
    totalBookings: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    usersBooked: 0,
  };

  return {
    data: result.data,
    meta: {
      page,
      limit,
      total: totals.totalRestaurants,
      totalPages: Math.ceil(totals.totalRestaurants / limit),
    },
    summary: totals,
    cuisines,
  };
}

async function listAdminReservationsByRestaurant(restaurantId) {
  if (!isValidObjectId(restaurantId)) throw new HttpException(400, "Invalid restaurant id");
  const result = await userRepository.listAdminReservationsByRestaurant(restaurantId);
  if (!result) throw new HttpException(404, "Restaurant not found");
  return {
    restaurant: {
      id: result.restaurant._id.toString(),
      name: result.restaurant.name,
      cuisine: result.restaurant.cuisine || "",
      image: result.restaurant.image || "",
    },
    totalBookings: result.reservations.length,
    bookings: result.reservations.map((reservation) => ({
      ...formatReservationItem(reservation),
      customer: reservation.user ? {
        _id: reservation.user._id?.toString(),
        fullName: reservation.user.fullName,
        email: reservation.user.email,
        phoneNumber: reservation.user.phoneNumber,
      } : null,
    })),
  };
}

async function getAdminRestaurantDetails(restaurantId) {
  if (!isValidObjectId(restaurantId)) throw new HttpException(400, "Invalid restaurant id");
  const result = await userRepository.getAdminRestaurantDetails(restaurantId);
  if (!result) throw new HttpException(404, "Restaurant not found");

  const restaurant = result.restaurant;
  const restaurantData = restaurant.toObject();
  const hoursMatch = String(restaurant.hours || "").match(/:\s*(.+?)\s*-\s*(.+)$/);
  const ratingTotal = result.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  const statusCount = (status) => result.bookings.filter((booking) => booking.status === status).length;
  const explicitMenu = Array.isArray(restaurantData.menu) ? restaurantData.menu : [];
  const menu = explicitMenu.length ? explicitMenu : (restaurant.features || []).map((name) => ({
    category: "Featured items",
    name,
    description: "",
    price: null,
    isAvailable: true,
    type: "food",
  }));

  return {
    restaurant: {
      ...restaurantData,
      _id: restaurant._id.toString(),
      email: restaurantData.email || "",
      openingTime: hoursMatch?.[1] || "",
      closingTime: hoursMatch?.[2] || "",
      totalTables: Array.isArray(restaurant.tables) ? restaurant.tables.length : 0,
      capacity: (restaurant.tables || []).reduce((sum, table) => sum + Number(table.capacity || 0), 0),
      menu,
    },
    activity: {
      totalBookings: result.bookings.length,
      pendingBookings: statusCount("pending"),
      confirmedBookings: statusCount("confirmed"),
      completedBookings: statusCount("completed"),
      cancelledBookings: statusCount("cancelled"),
      totalReviews: result.reviews.length,
      averageRating: result.reviews.length ? Number((ratingTotal / result.reviews.length).toFixed(1)) : 0,
      totalFavorites: result.favoriteCount,
    },
    bookings: result.bookings.slice(0, 10).map((booking) => ({
      ...formatReservationItem(booking),
      customer: booking.user ? {
        id: booking.user._id?.toString(),
        name: booking.user.fullName,
        email: booking.user.email,
      } : null,
    })),
    reviews: result.reviews.slice(0, 10).map((review) => ({
      id: review._id.toString(),
      customerName: review.userId?.fullName || review.userName || "MealNest user",
      rating: review.rating,
      comment: review.comment,
      status: review.status || "published",
      createdAt: review.createdAt,
    })),
  };
}

async function getAdminDashboardStats() {
  const result = await userRepository.getAdminDashboardStats();
  const activities = [
    ...result.recentUsers.map((user) => ({ type: "user", title: "User registered", text: `${user.fullName || "A user"} joined MealNest.`, createdAt: user.createdAt })),
    ...result.recentRestaurants.map((restaurant) => ({ type: "restaurant", title: "Restaurant updated", text: `${restaurant.name} was updated.`, createdAt: restaurant.updatedAt })),
    ...result.recentBookings.map((booking) => ({ type: "booking", title: "Booking created", text: `${booking.user?.fullName || "A user"} booked ${booking.restaurant?.name || booking.restaurantName || "a restaurant"}.`, createdAt: booking.createdAt })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
  return { stats: { totalUsers: result.totalUsers, totalRestaurants: result.totalRestaurants, totalBookings: result.totalBookings, totalRevenue: result.totalRevenue }, activities };
}

async function getAdminAnalytics(range = "7d") {
  if (!["7d", "30d", "6m"].includes(range)) {
    throw new HttpException(400, "Analytics range must be one of: 7d, 30d, 6m.");
  }
  return userRepository.getAdminAnalytics(range);
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
  getAdminAnalytics,
  getAdminUserDetails,
  getAdminRestaurantDetails,
  completeAdminReservation,
  getDashboard,
  getRestaurant,
  getReservation,
  getUserByIdOrThrow,
  listAdminUsers,
  listAdminReservations,
  listAdminReservationsByRestaurant,
  listGroupedAdminReservations,
  listMyReservations,
  listRestaurants,
  login,
  register,
  requestPasswordReset,
  resetPassword,
  sendReservationConfirmation,
  toggleFavorite,
  updateAdminUser,
  updateProfile,
  updateReservation,
};
