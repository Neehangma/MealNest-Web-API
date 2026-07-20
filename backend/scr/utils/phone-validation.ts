const PHONE_VALIDATION_MESSAGE = "Phone number must contain exactly 10 digits.";

function isPhoneNumberValid(value) {
  return typeof value === "string" && /^\d{10}$/.test(value);
}

function isOptionalPhoneNumberValid(value) {
  return value === undefined || value === "" || isPhoneNumberValid(value);
}

module.exports = { isPhoneNumberValid, isOptionalPhoneNumberValid, PHONE_VALIDATION_MESSAGE };
