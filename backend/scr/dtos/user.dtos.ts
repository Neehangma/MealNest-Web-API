export interface RegisterUserDto {
  name?: string;
  fullName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  fullName?: string;
  fullname?: string;
  email?: string;
  currentPassword?: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const normalizeRegisterDto = (data: RegisterUserDto) => ({
  name: (data.name || data.fullName || "").trim(),
  email: data.email?.trim().toLowerCase(),
  password: data.password,
  confirmPassword: data.confirmPassword,
});

export const normalizeUpdateDto = (data: UpdateUserDto) => ({
  name: (data.name || data.fullName || data.fullname)?.trim(),
  email: data.email?.trim().toLowerCase(),
  currentPassword: data.currentPassword,
  newPassword: data.newPassword || data.password,
  confirmPassword: data.confirmPassword,
});
