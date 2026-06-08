// Import Next.js Link for page navigation
import Link from "next/link";

// Login component
export default function LoginForm() {
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
            <form>
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
              />
              <div className="label-row">
                <label>Password</label>
                <a href="#">Forgot Password?</a>
              </div>
              <input
                type="password"
                placeholder="Enter password"
              />

              <div className="checkbox-row">
                <input type="checkbox"/>
                <span>Remember me</span>
              </div>
              <button type="submit">
                Sign In
              </button>
            </form>

            {/* Navigation link */}
            <p className="bottom-text">
              Don't have an account?{" "}
              <Link href="/auth/register">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}