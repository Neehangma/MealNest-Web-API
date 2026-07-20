"use client";

import { changePasswordAction } from "@/lib/actions/profile-action";
import { useActionState, useRef, useEffect, useState } from "react";
import Link from "next/link";
import PasswordInput from "@/app/_components/PasswordInput";
import PasswordRequirements from "@/app/_components/PasswordRequirements";
import { isPasswordValid } from "@/lib/password-policy";
import { useRouter } from "next/navigation";

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
  const { replace } = useRouter();
  const [passwordState, passwordFormAction, isChangingPassword] = useActionState(changePasswordAction, emptyState);
  const passwordFormRef = useRef<HTMLFormElement>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    if (passwordState.success) {
      const resetTimer = window.setTimeout(() => {
        passwordFormRef.current?.reset();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        for (const key of ["auth_token", "token", "user", "user_data"]) {
          window.localStorage.removeItem(key);
          window.sessionStorage.removeItem(key);
        }
        replace("/login");
      }, 1500);

      return () => window.clearTimeout(resetTimer);
    }
  }, [passwordState.success, replace]);

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
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </label>
              <label>
                <span>New Password</span>
                <PasswordInput
                  name="newPassword"
                  minLength={8}
                  required
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
                <PasswordRequirements password={newPassword} />
                {newPassword && currentPassword === newPassword && <small className="password-match-error">New password must be different from the current password.</small>}
              </label>
              <label>
                <span>Confirm Password</span>
                <PasswordInput
                  name="confirmPassword"
                  minLength={8}
                  required
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                {confirmPassword && newPassword !== confirmPassword && <small className="password-match-error">New password and confirm password do not match.</small>}
              </label>
              {passwordState.message && (
                <p className={`change-password-message ${passwordState.success ? "success" : "error"}`}>
                  {passwordState.message}
                </p>
              )}
              <button type="submit" className="change-password-submit-button" disabled={isChangingPassword || !currentPassword || !isPasswordValid(newPassword) || currentPassword === newPassword || newPassword !== confirmPassword}>
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
