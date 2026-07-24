"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import PasswordInput from "@/app/_components/PasswordInput";
import PasswordRequirements from "@/app/_components/PasswordRequirements";
import { resetPassword } from "@/lib/api/auth";
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";

const INVALID_LINK_MESSAGE = "This password reset link is invalid or has expired.";
const SUCCESS_MESSAGE = "Password changed successfully. You can now log in with your new password.";

export default function NewPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [invalidLink, setInvalidLink] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required.");
      return;
    }
    if (!isPasswordValid(newPassword)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, { newPassword, confirmPassword });
      setSuccess(result.message || SUCCESS_MESSAGE);
      window.setTimeout(() => router.replace("/login"), 1500);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : INVALID_LINK_MESSAGE;
      const isInvalid = message === INVALID_LINK_MESSAGE;
      setInvalidLink(isInvalid);
      setError(isInvalid ? INVALID_LINK_MESSAGE : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-wrapper">
      <section className="auth-form-card">
        <h1>Choose a New Password</h1>
        <p>Enter and confirm your new MealNest password.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password">New Password</label>
          <PasswordInput
            id="new-password"
            name="newPassword"
            placeholder="Enter new password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <PasswordRequirements password={newPassword} />

          <label htmlFor="confirm-new-password">Confirm New Password</label>
          <PasswordInput
            id="confirm-new-password"
            name="confirmPassword"
            placeholder="Confirm new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="form-success" role="status">{success}</p>}

          <div className="reset-password-actions">
            {!invalidLink && (
              <button type="submit" disabled={loading || Boolean(success)}>
                {loading ? "Changing Password..." : "Change Password"}
              </button>
            )}
            {invalidLink && (
              <Link className="reset-password-link" href="/ResetPassword">
                Request a New Link
              </Link>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
