"use client";

import { changePasswordAction } from "@/lib/actions/profile-action";
import { useActionState, useRef, useEffect } from "react";
import Link from "next/link";
import PasswordInput from "@/app/_components/PasswordInput";

type IconName = "lock" | "chevron";

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  return (
    <svg {...props}>
      {name === "lock" && (
        <>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
      )}
      {name === "chevron" && <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

const emptyState = {
  success: false,
  message: "",
};

export default function ChangePasswordClient() {
  const [passwordState, passwordFormAction, isChangingPassword] = useActionState(changePasswordAction, emptyState);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (passwordState.success) {
      passwordFormRef.current?.reset();
    }
  }, [passwordState.success]);

  return (
    <div className="change-password-page">
      <main className="change-password-main">
        <section className="change-password-heading">
          <Link href="/profile" className="change-password-back">
            <Icon name="chevron" size={18} />
            Back to Profile
          </Link>
          <h1>Change Password</h1>
          <p>Update your password to keep your account secure.</p>
        </section>

        <div className="change-password-content">
          <div className="change-password-card">
            <form ref={passwordFormRef} action={passwordFormAction} className="change-password-form">
              <label>
                <span>Current Password</span>
                <PasswordInput
                  name="currentPassword"
                  required
                  placeholder="Enter your current password"
                />
              </label>
              <label>
                <span>New Password</span>
                <PasswordInput
                  name="newPassword"
                  minLength={6}
                  required
                  placeholder="Enter your new password"
                />
                <small>Password must be at least 6 characters</small>
              </label>
              <label>
                <span>Confirm Password</span>
                <PasswordInput
                  name="confirmPassword"
                  minLength={6}
                  required
                  placeholder="Confirm your new password"
                />
              </label>
              {passwordState.message && (
                <p className={`change-password-message ${passwordState.success ? "success" : "error"}`}>
                  {passwordState.message}
                </p>
              )}
              <button type="submit" className="change-password-submit-button" disabled={isChangingPassword}>
                {isChangingPassword ? "Changing Password..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="customer-footer change-password-footer">
        <div>
          <h2>MealNest</h2>
          <p>Premium dining logistics and reservations for the modern connoisseur.</p>
        </div>
        <nav aria-label="Platform links">
          <h3>Platform</h3>
          <a href="#">About Us</a>
          <a href="#">Press</a>
          <a href="#">Careers</a>
        </nav>
        <nav aria-label="Support links">
          <h3>Support</h3>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </nav>
        <div>
          <h3>Connect</h3>
          <div className="social-row">
            <Icon name="lock" />
            <Icon name="lock" />
            <Icon name="lock" />
          </div>
          <p>&copy; 2024 MealNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
