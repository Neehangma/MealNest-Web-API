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
    role: body.role || "user",
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

module.exports = {
  createRegisterDto,
  createLoginDto,
  createAdminUserDto,
  createUpdateUserDto,
};
