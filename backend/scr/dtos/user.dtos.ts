function normalizeEmail(email: string): string {
  return String(email || "").trim().toLowerCase();
}

export function createRegisterDto(body: any) {
  return {
    fullName: String(body.fullName || "").trim(),
    email: normalizeEmail(body.email),
    phoneNumber: String(body.phoneNumber || "").trim(),
    password: String(body.password || ""),
  };
}

export function createLoginDto(body: any) {
  return {
    email: normalizeEmail(body.email),
    password: String(body.password || ""),
  };
}

export function createAdminUserDto(body: any) {
  return {
    fullName: String(body.fullName || "").trim(),
    email: normalizeEmail(body.email),
    phoneNumber: String(body.phoneNumber || "").trim(),
    password: String(body.password || ""),
    role: body.role || "user",
  };
}

export function createUpdateUserDto(body: any): any {
  const dto: any = {};

  if (body.fullName !== undefined) dto.fullName = String(body.fullName || "").trim();
  if (body.email !== undefined) dto.email = normalizeEmail(body.email);
  if (body.phoneNumber !== undefined) dto.phoneNumber = String(body.phoneNumber || "").trim();
  if (body.password !== undefined) dto.password = String(body.password || "");
  if (body.role !== undefined) dto.role = body.role;

  return dto;
}
