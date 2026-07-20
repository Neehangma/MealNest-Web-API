import { getPasswordRequirementStatus, isPasswordValid } from "@/lib/password-policy";

test("requires every strong-password characteristic", () => {
  expect(isPasswordValid("Strong1!")).toBe(true);
  expect(isPasswordValid("short1!A")).toBe(true);
  expect(isPasswordValid("lowercase1!")).toBe(false);
  expect(isPasswordValid("UPPERCASE1!")).toBe(false);
  expect(isPasswordValid("NoNumber!")).toBe(false);
  expect(isPasswordValid("NoSpecial1")).toBe(false);
  expect(isPasswordValid("NoSpecial1 ")).toBe(false);
});

test("reports each requirement independently", () => {
  const status = getPasswordRequirementStatus("Password1");
  expect(status.find((item) => item.key === "special")?.satisfied).toBe(false);
  expect(status.filter((item) => item.satisfied)).toHaveLength(4);
});
