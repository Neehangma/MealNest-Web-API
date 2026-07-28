/** @jest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewPasswordForm from "@/app/(auth)/components/NewPasswordForm";
import { resetPassword } from "@/lib/api/auth";

jest.mock("@/lib/api/auth", () => ({ resetPassword: jest.fn() }));

test("validates matching strong passwords before submitting", async () => {
  const user = userEvent.setup();
  render(<NewPasswordForm token="reset-token" />);

  await user.type(screen.getByLabelText("New Password"), "NewSecret2@");
  await user.type(screen.getByLabelText("Confirm New Password"), "Different3#");
  await user.click(screen.getByRole("button", { name: "Change Password" }));

  expect(screen.getByRole("alert")).toHaveTextContent(
    "New password and confirm password do not match."
  );
  expect(resetPassword).not.toHaveBeenCalled();
});

test("shows the invalid-link state returned by the backend", async () => {
  jest.mocked(resetPassword).mockRejectedValue(
    new Error("This password reset link is invalid or has expired.")
  );
  const user = userEvent.setup();
  render(<NewPasswordForm token="expired-token" />);

  await user.type(screen.getByLabelText("New Password"), "NewSecret2@");
  await user.type(screen.getByLabelText("Confirm New Password"), "NewSecret2@");
  await user.click(screen.getByRole("button", { name: "Change Password" }));

  await waitFor(() => {
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This password reset link is invalid or has expired."
    );
  });
  expect(screen.getByRole("link", { name: "Request a New Link" })).toHaveAttribute(
    "href",
    "/ResetPassword"
  );
});
