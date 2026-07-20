export const PHONE_VALIDATION_MESSAGE = "Phone number must contain exactly 10 digits.";

export function sanitizePhoneNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function isPhoneNumberValid(value: string) {
  return /^\d{10}$/.test(value);
}

export function isOptionalPhoneNumberValid(value: string) {
  return value === "" || isPhoneNumberValid(value);
}
