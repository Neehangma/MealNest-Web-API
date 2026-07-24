import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordForm from "@/app/(auth)/components/ResetPasswordForm";
import { requestPasswordReset } from "@/lib/api/auth";

jest.mock("@/lib/api/auth", () => ({ requestPasswordReset: jest.fn() }));

test("requests a reset link and shows the neutral success message", async () => {
  jest.mocked(requestPasswordReset).mockResolvedValue({
    success: true,
    message: "If an account exists for this email, a password reset link has been sent.",
  });
  const user = userEvent.setup();
  render(<ResetPasswordForm />);
  const input = screen.getByPlaceholderText("Enter email");
  expect(input).toHaveAttribute("type", "email");
  await user.type(input, "customer@example.com");
  await user.click(screen.getByRole("button", { name: "Send Reset Link" }));

  expect(requestPasswordReset).toHaveBeenCalledWith("customer@example.com");
  await waitFor(() => {
    expect(screen.getByRole("status")).toHaveTextContent(
      "If an account exists for this email, a password reset link has been sent."
    );
  });
});
