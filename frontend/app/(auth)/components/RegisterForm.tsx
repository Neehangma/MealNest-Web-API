"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { handleRegisterUser } from "@/lib/actions/auth-action";
import { useState } from "react";

// Register component
export default function RegisterForm() {
  // Initialize router for page redirection
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent page refresh after form submission
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await handleRegisterUser({
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      confirmPassword: String(formData.get("confirmPassword") || ""),
    });

    setIsSubmitting(false);
    if (result.success) {
      router.push("/login");
      return;
    }

    setMessage(result.message);
  };

  return (
    <main className="register-wrapper">

      {/* Main registration container */}
      <section className="register-card">

        {/* Left section with image and promotional content */}
        <div className="register-left">
          <h2 className="logo-light">
            MealNest
          </h2>
          <div className="image-content">
            <span>
              Premium Dining Reservations
            </span>
            <h1>
              Reserve your perfect table with ease.
            </h1>
            <p>
              Discover restaurants, book tables and enjoy smooth dining experiences.
            </p>
          </div>
        </div>

        {/* Right section containing registration form */}
        <div className="register-right">
          <div className="auth-form-card">
            <h1>Create Account</h1>
            <p>
              Join MealNest and start booking your favorite restaurants.
            </p>

            {/* Registration form with submit event */}
            <form onSubmit={handleSubmit}>
              <label>Full Name</label>
              <input
                name="name"
                type="text"
                placeholder="Enter full name"
                required
              />

              {/* Email input field */}
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="Enter email"
                required
              />

              {/* Password input field */}
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter password"
                required
              />

              {/* Confirm Password input field */}
              <label>Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                required
              />

              {/* Terms and conditions checkbox */}
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  required
                />
                <span>
                  I agree to Terms and Privacy Policy
                </span>
              </div>

              {/* Registration button */}
              {message && <p className="form-message error">{message}</p>}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </form>

            {/* Login navigation link */}
            <p className="bottom-text">
              Already have an account?{" "}
              <Link href="/login">
                Sign In
              </Link>

            </p>

          </div>
        </div>

      </section>
    </main>
  );
}
