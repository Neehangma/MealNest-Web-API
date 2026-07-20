export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";

export const PASSWORD_REQUIREMENTS = [
  { key: "length", label: "At least 8 characters", test: (password: string) => password.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (password: string) => /[A-Z]/.test(password) },
  { key: "lowercase", label: "One lowercase letter", test: (password: string) => /[a-z]/.test(password) },
  { key: "number", label: "One number", test: (password: string) => /[0-9]/.test(password) },
  { key: "special", label: "One special character", test: (password: string) => /[^A-Za-z0-9\s]/.test(password) },
] as const;

export function getPasswordRequirementStatus(password: string) {
  return PASSWORD_REQUIREMENTS.map((requirement) => ({
    key: requirement.key,
    label: requirement.label,
    satisfied: requirement.test(password),
  }));
}

export function isPasswordValid(password: string) {
  return PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(password));
}
