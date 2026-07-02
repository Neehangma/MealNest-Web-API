"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { handleLoginUser } from "@/lib/actions/auth-action";
import { getDashboardPathForRole } from "@/lib/auth-routing";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await handleLoginUser({
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    });

    setLoading(false);

    if (!result.success || !result.data) {
      setError(result.message || "Login failed");
      return;
    }

    router.push(getDashboardPathForRole(result.data.user.role));
    router.refresh();
  }

  return (
    <main className="login-wrapper">
      <div className="login-card">
        <section className="auth-image login-image">
          <div className="image-content">
            <h1>Savor the precision of fine dining.</h1>
            <p>
              Experience seamless reservations and curated culinary adventures
              with MealNest.
            </p>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="auth-form-card">
            <h2 className="logo">MealNest</h2>
            <h1>Welcome Back</h1>
            <p>Please enter your details to sign in.</p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="Enter email" required />

              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link href="/ResetPassword">Forgot Password?</Link>
              </div>
              <input id="password" name="password" type="password" placeholder="Enter password" required />

              <div className="checkbox-row">
                <input id="remember" type="checkbox" />
                <label htmlFor="remember">Remember me</label>
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <p className="bottom-text">
              Don&apos;t have an account? <Link href="/register">Create an account</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
