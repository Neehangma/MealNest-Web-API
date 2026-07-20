"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { handleRegisterUser } from "@/lib/actions/auth-action";
import PasswordInput from "@/app/_components/PasswordInput";
import PasswordRequirements from "@/app/_components/PasswordRequirements";
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";
import { isOptionalPhoneNumberValid, PHONE_VALIDATION_MESSAGE, sanitizePhoneNumber } from "@/lib/phone-validation";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [success, setSuccess] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const phoneNumber = String(formData.get("phoneNumber") || "");

    if (!isOptionalPhoneNumberValid(phoneNumber)) {
      setError(PHONE_VALIDATION_MESSAGE);
      return;
    }

    if (!isPasswordValid(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await handleRegisterUser({
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      phoneNumber,
      password,
    });
    setLoading(false);

    if (!result.success) {
      if (process.env.NODE_ENV === "development") {
        console.error("Registration failed", { message: result.message || "Unknown registration error" });
      }
      setError(result.message || "Registration failed");
      return;
    }

    setSuccess(result.message || "Account created successfully. Please log in to continue.");
    formRef.current?.reset();
    setPassword("");
    setConfirmPassword("");
    setPhoneNumber("");
    window.setTimeout(() => router.push("/login"), 1500);
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

            <form ref={formRef} onSubmit={handleSubmit}>
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" name="fullName" type="text" placeholder="Enter full name" required />

              <label htmlFor="registerEmail">Email Address</label>
              <input id="registerEmail" name="email" type="email" placeholder="Enter email" required />

              <label htmlFor="phoneNumber">Phone Number</label>
              <input id="phoneNumber" name="phoneNumber" type="tel" inputMode="numeric" maxLength={10} className={phoneNumber && !isOptionalPhoneNumberValid(phoneNumber) ? "phone-input-invalid" : ""} value={phoneNumber} onChange={(event) => setPhoneNumber(sanitizePhoneNumber(event.target.value))} placeholder="Enter phone number" />
              {phoneNumber && !isOptionalPhoneNumberValid(phoneNumber) && <p className="phone-validation-error">{PHONE_VALIDATION_MESSAGE}</p>}

              <label htmlFor="registerPassword">Password</label>
              <PasswordInput id="registerPassword" name="password" placeholder="Enter password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
              <PasswordRequirements password={password} />

              <label htmlFor="confirmPassword">Confirm Password</label>
              <PasswordInput id="confirmPassword" name="confirmPassword" placeholder="Confirm password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              {confirmPassword && password !== confirmPassword && <p className="password-match-error">Passwords do not match.</p>}

              <div className="checkbox-row">
                <input id="terms" type="checkbox" required />
                <label htmlFor="terms">I agree to Terms and Privacy Policy</label>
              </div>

              {error && <p className="form-error">{error}</p>}
              {success && <p className="form-success" role="status">{success}</p>}

              <button type="submit" disabled={loading || !isOptionalPhoneNumberValid(phoneNumber) || !isPasswordValid(password) || password !== confirmPassword}>
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
