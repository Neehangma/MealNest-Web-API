const { isOptionalPhoneNumberValid, isPhoneNumberValid } = require("../utils/phone-validation");

test.each([
  ["9800000000", true],
  ["980000000", false],
  ["98000000000", false],
  ["98000 00000", false],
  ["98000-00000", false],
])("validates ten-digit phone number %s", (phoneNumber, expected) => {
  expect(isPhoneNumberValid(phoneNumber)).toBe(expected);
});

test("allows an omitted optional phone number", () => {
  expect(isOptionalPhoneNumberValid(undefined)).toBe(true);
  expect(isOptionalPhoneNumberValid("")).toBe(true);
});
