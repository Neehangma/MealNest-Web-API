import { isOptionalPhoneNumberValid, isPhoneNumberValid, sanitizePhoneNumber } from "@/lib/phone-validation";

test("accepts exactly ten digits", () => {
  expect(isPhoneNumberValid("9800000000")).toBe(true);
  expect(isPhoneNumberValid("980000000")).toBe(false);
  expect(isPhoneNumberValid("98000000000")).toBe(false);
  expect(isPhoneNumberValid("98000 00000")).toBe(false);
});

test("sanitizes typed and pasted phone values", () => {
  expect(sanitizePhoneNumber("98a-000 00000extra")).toBe("9800000000");
  expect(isOptionalPhoneNumberValid("")).toBe(true);
});
