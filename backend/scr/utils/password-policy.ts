const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";

function isPasswordValid(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password)
  );
}

module.exports = { isPasswordValid, PASSWORD_POLICY_MESSAGE };
