export type RegisterFormData = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};
