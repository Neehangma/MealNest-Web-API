export const ESEWA_ID_REQUIRED_MESSAGE = "Please enter your eSewa ID.";
export const BANK_ACCOUNT_NUMBER_MESSAGE = "Bank account number must contain between 10 and 16 digits.";

export function isEsewaIdValid(value: string) {
  const normalized = value.trim();
  return /^\d{10}$/.test(normalized) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function sanitizeBankAccountNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16);
}

export function isBankAccountNumberValid(value: string) {
  return /^\d{10,16}$/.test(value);
}

export function maskBankAccountNumber(value: string) {
  return `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}
