const mongoose = require("mongoose");

function sendSuccess(res, status, payload) {
  return res.status(status).json({
    success: true,
    ...payload,
  });
}

function sendError(res, status, message, details) {
  return res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function toSafeUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName || "",
    email: user.email,
    phoneNumber: user.phoneNumber || "",
    profilePicture: user.profilePicture || "",
    role: user.role || "user",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = {
  asyncHandler,
  isValidObjectId,
  parsePagination,
  sendError,
  sendSuccess,
  toSafeUser,
};
