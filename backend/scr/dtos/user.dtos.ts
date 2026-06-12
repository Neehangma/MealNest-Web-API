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

export const normalizeRegisterDto = (data: RegisterUserDto) => ({
  name: (data.name || data.fullName || "").trim(),
  email: data.email?.trim().toLowerCase(),
  password: data.password,
  confirmPassword: data.confirmPassword,
});
