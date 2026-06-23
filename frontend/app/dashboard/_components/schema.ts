export type ProfileUpdateFormData = {
  name: string;
  email: string;
  image?: File;
};

export type PasswordUpdateFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
