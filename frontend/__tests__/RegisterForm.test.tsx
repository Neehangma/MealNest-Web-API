import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/app/(auth)/components/RegisterForm";
import { handleRegisterUser } from "@/lib/actions/auth-action";
import { navigationMocks } from "@/jest.setup";

jest.mock("@/lib/actions/auth-action", () => ({ handleRegisterUser: jest.fn() }));
const register = jest.mocked(handleRegisterUser);

async function fill(password = "Secret123!", confirmation = password) {
  await userEvent.type(screen.getByLabelText("Full Name"), "Dawa Sherpa");
  await userEvent.type(screen.getByLabelText("Email Address"), "dawa@example.com");
  await userEvent.type(screen.getByLabelText("Phone Number"), "9845698712");
  await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.type(screen.getByLabelText("Confirm Password"), confirmation);
  await userEvent.click(screen.getByLabelText(/I agree/));
  await userEvent.click(screen.getByRole("button", { name: "Create Account" }));
}

test("renders registration fields and validates password confirmation", async () => {
  render(<RegisterForm />);
  expect(screen.getByRole("heading", { name: "Create Account" })).toBeVisible();
  expect(screen.getAllByRole("button", { name: "Show password" })).toHaveLength(2);
  await fill("Secret123!", "Different123!");
  expect(screen.getAllByRole("button", { name: "Show password" })).toHaveLength(2);
  expect(await screen.findByText("Passwords do not match.")).toBeVisible();
  expect(register).not.toHaveBeenCalled();
});

test("shows success, clears the form, and redirects to login without authenticating", async () => {
  register.mockResolvedValue({ success: true, message: "Account created successfully. Please log in to continue." });
  render(<RegisterForm />);
  await fill();
  await waitFor(() => expect(register).toHaveBeenCalledWith({ fullName: "Dawa Sherpa", email: "dawa@example.com", phoneNumber: "9845698712", password: "Secret123!" }));
  expect(screen.getByRole("status")).toHaveTextContent("Account created successfully. Please log in to continue.");
  expect(screen.getByLabelText("Full Name")).toHaveValue("");
  expect(screen.getByLabelText("Password")).toHaveValue("");
  await waitFor(() => expect(navigationMocks.push).toHaveBeenCalledWith("/login"), { timeout: 2500 });
  expect(navigationMocks.push).not.toHaveBeenCalledWith("/dashboard/user");
});
