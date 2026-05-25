"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

// Register component
export default function RegisterForm() {
  // Initialize router for page redirection
  const router = useRouter();
  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    // Prevent page refresh after form submission
    e.preventDefault();
    // Redirect user to login page
    router.push("/auth/login");
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
                type="text"
                placeholder="Enter full name"
                required
              />

              {/* Email input field */}
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter email"
                required
              />

              {/* Password input field */}
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                required
              />

              {/* Confirm Password input field */}
              <label>Confirm Password</label>
              <input
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
              <button type="submit">
                Create Account
              </button>
            </form>

            {/* Login navigation link */}
            <p className="bottom-text">
              Already have an account?{" "}
              <Link href="/auth/login">
                Sign In
              </Link>

            </p>

          </div>
        </div>

      </section>
    </main>
  );
}