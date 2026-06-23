"use client";

import { handleUpdateUser } from "@/lib/actions/auth-action";
import { useState } from "react";

export default function PasswordUpdateForm() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      setIsSubmitting(false);
      setMessage("New password and confirmation do not match");
      return;
    }

    const result = await handleUpdateUser(formData);

    setIsSubmitting(false);
    setMessage(result.success ? "Password changed successfully" : result.message);
    if (result.success) {
      event.currentTarget.reset();
    }
  };

  return (
    <section className="dashboard-card">
      <div className="dashboard-heading">
        <p>Security</p>
        <h1>Change Password</h1>
      </div>

      <form className="dashboard-form" onSubmit={handleSubmit}>
        <label>Current Password</label>
        <input name="currentPassword" type="password" placeholder="Enter current password" required />

        <label>New Password</label>
        <input name="newPassword" type="password" placeholder="Enter new password" minLength={6} required />

        <label>Confirm Password</label>
        <input name="confirmPassword" type="password" placeholder="Confirm new password" minLength={6} required />

        {message && (
          <p className={`form-message${message.includes("successfully") ? "" : " error"}`}>
            {message}
          </p>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </section>
  );
}
