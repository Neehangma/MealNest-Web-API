const { isPasswordValid } = require("../utils/password-policy");

test.each([
  ["Strong1!", true],
  ["weakpassword", false],
  ["NOLOWERCASE1!", false],
  ["NoNumber!", false],
  ["NoSpecial1", false],
  ["NoSpecial1 ", false],
  ["Short1!", false],
])("validates the shared password policy for %s", (password, expected) => {
  expect(isPasswordValid(password)).toBe(expected);
});
