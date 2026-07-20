import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangePasswordClient from "@/app/change-password/ChangePasswordClient";

jest.mock("@/lib/actions/profile-action", () => ({
  changePasswordAction: jest.fn(),
}));

test("password visibility controls work independently", async () => {
  render(<ChangePasswordClient />);
  const current = screen.getByPlaceholderText("Enter your current password");
  const next = screen.getByPlaceholderText("Enter your new password");
  const confirmation = screen.getByPlaceholderText("Confirm your new password");

  expect(current).toHaveAttribute("type", "password");
  expect(next).toHaveAttribute("type", "password");
  expect(confirmation).toHaveAttribute("type", "password");

  await userEvent.click(screen.getAllByRole("button", { name: "Show password" })[0]);
  expect(current).toHaveAttribute("type", "text");
  expect(next).toHaveAttribute("type", "password");
  expect(confirmation).toHaveAttribute("type", "password");
  await userEvent.click(screen.getByRole("button", { name: "Hide password" }));
  expect(current).toHaveAttribute("type", "password");
});

test("blocks matching-current and mismatched confirmation values", async () => {
  render(<ChangePasswordClient />);
  const current = screen.getByPlaceholderText("Enter your current password");
  const next = screen.getByPlaceholderText("Enter your new password");
  const confirmation = screen.getByPlaceholderText("Confirm your new password");
  const submit = screen.getByRole("button", { name: "Change Password" });

  await userEvent.type(current, "Current1!");
  await userEvent.type(next, "Current1!");
  await userEvent.type(confirmation, "Different2@");
  expect(screen.getByText("New password must be different from the current password.")).toBeVisible();
  expect(screen.getByText("New password and confirm password do not match.")).toBeVisible();
  expect(submit).toBeDisabled();

  await userEvent.clear(next);
  await userEvent.type(next, "NewStrong2@");
  await userEvent.clear(confirmation);
  await userEvent.type(confirmation, "NewStrong2@");
  expect(screen.queryByText("New password must be different from the current password.")).not.toBeInTheDocument();
  expect(screen.queryByText("New password and confirm password do not match.")).not.toBeInTheDocument();
  expect(submit).toBeEnabled();
});
