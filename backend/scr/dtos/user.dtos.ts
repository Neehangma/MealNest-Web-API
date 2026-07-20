function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createRegisterDto(body) {
  return {
    fullName: String(body.fullName || "").trim(),
    email: normalizeEmail(body.email),
    phoneNumber: String(body.phoneNumber || "").trim(),
    password: String(body.password || ""),
  };
}

function createLoginDto(body) {
  return {
    email: normalizeEmail(body.email),
    password: String(body.password || ""),
  };
}

function createAdminUserDto(body) {
  return {
    fullName: String(body.fullName || "").trim(),
    email: normalizeEmail(body.email),
    phoneNumber: String(body.phoneNumber || "").trim(),
    password: String(body.password || ""),
    role: String(body.role || "user").trim().toLowerCase(),
  };
}

function createUpdateUserDto(body) {
  const dto = {};

  if (body.fullName !== undefined) dto.fullName = String(body.fullName || "").trim();
  if (body.email !== undefined) dto.email = normalizeEmail(body.email);
  if (body.phoneNumber !== undefined) dto.phoneNumber = String(body.phoneNumber || "").trim();
  if (body.password !== undefined) dto.password = String(body.password || "");
  if (body.role !== undefined) dto.role = body.role;

  return dto;
}

function createProfileUpdateDto(body) {
  const dto = {};

  if (body.fullName !== undefined) dto.fullName = String(body.fullName || "").trim();
  if (body.email !== undefined) dto.email = normalizeEmail(body.email);
  if (body.phoneNumber !== undefined) dto.phoneNumber = String(body.phoneNumber || "").trim();
  if (body.profilePicture !== undefined) dto.profilePicture = String(body.profilePicture || "");
  if (body.location !== undefined) dto.location = String(body.location || "").trim();
  if (body.bio !== undefined) dto.bio = String(body.bio || "").trim();

  return dto;
}

function createPasswordChangeDto(body) {
  return {
    currentPassword: String(body.currentPassword || ""),
    newPassword: String(body.newPassword || ""),
    confirmPassword: String(body.confirmPassword || ""),
  };
}

module.exports = {
  createRegisterDto,
  createLoginDto,
  createAdminUserDto,
  createUpdateUserDto,
  createProfileUpdateDto,
  createPasswordChangeDto,
};
