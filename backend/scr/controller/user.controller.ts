declare const require: any;
declare const module: any;

const {
  createAdminUserDto,
  createLoginDto,
  createPasswordChangeDto,
  createProfileUpdateDto,
  createRegisterDto,
  createUpdateUserDto,
} = require("../dtos/user.dtos");
const userService = require("../services/user.service");
const { sendSuccess, toSafeUser } = require("../utils/apihelper.utils");

async function register(req, res) {
  const result = await userService.register(createRegisterDto(req.body));
  return sendSuccess(res, 201, {
    message: "Account created successfully. Please log in to continue.",
    user: result.user,
  });
}

async function login(req, res) {
  const result = await userService.login(createLoginDto(req.body));
  return sendSuccess(res, 200, {
    message: "Login successful",
    token: result.token,
    user: result.user,
  });
}

async function current(req, res) {
  return sendSuccess(res, 200, {
    user: await userService.getCurrentUser(req.user._id),
  });
}

async function listUsers(req, res) {
  const result = await userService.listAdminUsers(req.query);
  return sendSuccess(res, 200, {
    data: result.users,
    meta: result.meta,
  });
}

async function getUser(req, res) {
  const user = await userService.getUserByIdOrThrow(req.params.id);
  return sendSuccess(res, 200, {
    data: toSafeUser(user),
  });
}

async function createUser(req, res) {
  const user = await userService.createAdminUser(createAdminUserDto(req.body));
  return sendSuccess(res, 201, {
    message: "User created successfully.",
    data: user,
  });
}

async function updateUser(req, res) {
  const user = await userService.updateAdminUser(req.params.id, createUpdateUserDto(req.body));
  return sendSuccess(res, 200, {
    message: "User updated successfully",
    data: user,
  });
}

async function updateProfile(req, res) {
  const user = await userService.updateProfile(req.user._id, createProfileUpdateDto(req.body));
  return sendSuccess(res, 200, {
    message: "Profile updated successfully",
    user,
  });
}

async function changePassword(req, res) {
  await userService.changePassword(req.user._id, createPasswordChangeDto(req.body));
  return sendSuccess(res, 200, {
    message: "Password changed successfully. Please log in again using your new password.",
  });
}

async function deleteUser(req, res) {
  await userService.deleteAdminUser(req.params.id, req.user._id);
  return sendSuccess(res, 200, {
    message: "User deleted successfully",
  });
}

async function getDashboard(req, res) {
  const dashboard = await userService.getDashboard(req.user._id);
  return sendSuccess(res, 200, dashboard);
}

async function getRestaurants(req, res) {
  const restaurants = await userService.listRestaurants();
  return sendSuccess(res, 200, {
    data: restaurants,
  });
}

async function getRestaurant(req, res) {
  const restaurant = await userService.getRestaurant(req.params.id);
  return sendSuccess(res, 200, {
    data: restaurant,
  });
}

async function toggleFavorite(req, res) {
  const result = await userService.toggleFavorite(req.user._id, req.params.restaurantId);
  return sendSuccess(res, 200, result);
}

async function createReservation(req, res) {
  const result = await userService.createReservation(req.user._id, req.body);
  return sendSuccess(res, 201, {
    message: "Reservation created successfully",
    booking: result.booking,
    emailSent: result.emailSent,
  });
}

async function updateReservation(req, res) {
  const reservation = await userService.updateReservation(
    req.user._id,
    req.params.reservationId,
    req.body
  );
  return sendSuccess(res, 200, {
    message: "Reservation updated successfully",
    data: reservation,
  });
}

async function cancelReservation(req, res) {
  const reservation = await userService.cancelReservation(req.user._id, req.params.reservationId);
  return sendSuccess(res, 200, {
    message: "Reservation cancelled successfully",
    data: reservation,
  });
}

async function listMyReservations(req, res) {
  const bookings = await userService.listMyReservations(req.user._id);
  return sendSuccess(res, 200, { bookings, data: bookings });
}

async function getReservation(req, res) {
  const booking = await userService.getReservation(req.user._id, req.params.reservationId);
  return sendSuccess(res, 200, { booking, data: booking });
}

async function sendReservationConfirmation(req, res) {
  const booking = await userService.sendReservationConfirmation(req.user._id, req.body.bookingId);
  return sendSuccess(res, 200, {
    message: "Booking confirmation email sent successfully",
    emailSent: true,
    booking,
  });
}

async function listAdminReservations(_req, res) {
  const bookings = await userService.listAdminReservations();
  return sendSuccess(res, 200, { data: bookings, total: bookings.length });
}

async function getAdminProfile(req, res) {
  const admin = await userService.getCurrentUser(req.user._id);
  return sendSuccess(res, 200, { admin });
}

async function getAdminDashboardStats(_req, res) {
  const result = await userService.getAdminDashboardStats();
  return sendSuccess(res, 200, result);
}

async function updateAdminProfile(req, res) {
  const payload = createProfileUpdateDto(req.body);
  if (req.file) payload.profilePicture = `/uploads/profiles/${req.file.filename}`;
  const admin = await userService.updateProfile(req.user._id, payload);
  return sendSuccess(res, 200, { message: "Profile updated successfully", admin });
}

module.exports = {
  cancelReservation,
  changePassword,
  createReservation,
  createUser,
  current,
  deleteUser,
  getDashboard,
  getAdminProfile,
  getAdminDashboardStats,
  getRestaurant,
  getReservation,
  getUser,
  getRestaurants,
  listMyReservations,
  listAdminReservations,
  listUsers,
  login,
  register,
  sendReservationConfirmation,
  toggleFavorite,
  updateProfile,
  updateAdminProfile,
  updateReservation,
  updateUser,
};
