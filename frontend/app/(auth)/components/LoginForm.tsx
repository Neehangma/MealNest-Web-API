"use client";

// Import Next.js Link for page navigation
import { handleLoginUser } from "@/lib/actions/auth-action";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Login component
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const result = await handleLoginUser({
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    });

    setIsSubmitting(false);
    if (result.success) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    setMessage(result.message);
  };

  return (
    <main className="login-wrapper">
      {/* Main login card container */}
      <div className="login-card">
        {/* Left section with background image and text */}
        <section className="auth-image login-image">
          <div className="image-content">
            <h1>Savor the precision of fine dining.</h1>
            <p>
              Experience seamless reservations and curated culinary adventures
              with MealNest.
            </p>
          </div>
        </section>

        {/* Right section containing login form */}
        <section className="auth-form-section">
          <div className="auth-form-card">
            <h2 className="logo">MealNest</h2>
            <h1>Welcome Back</h1>
            <p>Please enter your details to sign in.</p>
            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="Enter email"
                required
              />
              <div className="label-row">
                <label>Password</label>
                <Link href="/ResetPassword">Forgot Password?</Link>
              </div>
              <input
                name="password"
                type="password"
                placeholder="Enter password"
                required
              />

              <div className="checkbox-row">
                <input type="checkbox"/>
                <span>Remember me</span>
              </div>
              {message && <p className="form-message error">{message}</p>}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Navigation link */}
            <p className="bottom-text">
              Don&apos;t have an account?{" "}
              <Link href="/register">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
