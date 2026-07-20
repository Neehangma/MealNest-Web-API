"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { handleRegisterUser } from "@/lib/actions/auth-action";
import PasswordInput from "@/app/_components/PasswordInput";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await handleRegisterUser({
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      phoneNumber: String(formData.get("phoneNumber") || ""),
      password,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.message || "Registration failed");
      return;
    }

    router.push("/dashboard/user");
    router.refresh();
  }

  return (
    <main className="register-wrapper">
      <section className="register-card">
        <div className="register-left">
          <h2 className="logo-light">MealNest</h2>
          <div className="image-content">
            <span>Premium Dining Reservations</span>
            <h1>Reserve your perfect table with ease.</h1>
            <p>Discover restaurants, book tables and enjoy smooth dining experiences.</p>
          </div>
        </div>

        <div className="register-right">
          <div className="auth-form-card">
            <h1>Create Account</h1>
            <p>Join MealNest and start booking your favorite restaurants.</p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" name="fullName" type="text" placeholder="Enter full name" required />

              <label htmlFor="registerEmail">Email Address</label>
              <input id="registerEmail" name="email" type="email" placeholder="Enter email" required />

              <label htmlFor="phoneNumber">Phone Number</label>
              <input id="phoneNumber" name="phoneNumber" type="tel" placeholder="Enter phone number" />

              <label htmlFor="registerPassword">Password</label>
              <PasswordInput id="registerPassword" name="password" placeholder="Enter password" required minLength={6} />

              <label htmlFor="confirmPassword">Confirm Password</label>
              <PasswordInput id="confirmPassword" name="confirmPassword" placeholder="Confirm password" required minLength={6} />

              <div className="checkbox-row">
                <input id="terms" type="checkbox" required />
                <label htmlFor="terms">I agree to Terms and Privacy Policy</label>
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <p className="bottom-text">
              Already have an account? <Link href="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
