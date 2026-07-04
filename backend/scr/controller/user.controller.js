const {
  createAdminUserDto,
  createLoginDto,
  createRegisterDto,
  createUpdateUserDto,
} = require("../dtos/user.dtos.js");
const userService = require("../services/user.service.js");
const { sendSuccess, toSafeUser } = require("../utils/apihelper.utils.js");

async function register(req, res) {
  const result = await userService.register(createRegisterDto(req.body));
  return sendSuccess(res, 201, {
    message: "Account created successfully",
    token: result.token,
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
    message: "User created successfully",
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

async function deleteUser(req, res) {
  await userService.deleteAdminUser(req.params.id, req.user._id);
  return sendSuccess(res, 200, {
    message: "User deleted successfully",
  });
}

module.exports = {
  createUser,
  current,
  deleteUser,
  getUser,
  listUsers,
  login,
  register,
  updateUser,
};
