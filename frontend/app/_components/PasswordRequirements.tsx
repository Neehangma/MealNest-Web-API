import { getPasswordRequirementStatus, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";

export default function PasswordRequirements({ password }: { password: string }) {
  const requirements = getPasswordRequirementStatus(password);
  const isInvalid = password.length > 0 && requirements.some((requirement) => !requirement.satisfied);

  return (
    <div className="password-requirements" aria-live="polite">
      <ul aria-label="Password requirements">
        {requirements.map((requirement) => (
          <li key={requirement.key} className={requirement.satisfied ? "satisfied" : "unsatisfied"}>
            <span aria-hidden="true">{requirement.satisfied ? "✓" : "○"}</span>
            {requirement.label}
          </li>
        ))}
      </ul>
      {isInvalid && <p className="password-policy-error">{PASSWORD_POLICY_MESSAGE}</p>}
    </div>
  );
}
