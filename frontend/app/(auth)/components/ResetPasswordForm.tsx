"use client";

import { FormEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/api/auth";

const NEUTRAL_SUCCESS_MESSAGE =
  "If an account exists for this email, a password reset link has been sent.";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setMessage(NEUTRAL_SUCCESS_MESSAGE);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-wrapper">
      <section className="auth-form-card">
        <h1>Reset Password</h1>
        <p>Enter your email address to request a password reset.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            name="email"
            type="email"
            placeholder="Enter email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {message && <p className="form-success" role="status">{message}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </section>
    </main>
  );
}
