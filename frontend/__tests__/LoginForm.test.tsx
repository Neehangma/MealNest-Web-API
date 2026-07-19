import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/(auth)/components/LoginForm";
import { handleLoginUser } from "@/lib/actions/auth-action";
import { navigationMocks } from "@/jest.setup";

jest.mock("@/lib/actions/auth-action", () => ({ handleLoginUser: jest.fn() }));
const login = jest.mocked(handleLoginUser);

test("renders required login fields", () => {
  render(<LoginForm />);
  expect(screen.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  expect(screen.getByLabelText("Email")).toBeRequired();
  expect(screen.getByLabelText("Password")).toBeRequired();
});

test("sends the login payload and follows current navigation", async () => {
  login.mockResolvedValue({ success: true, message: "Login successful", data: { success: true, message: "Login successful", token: "token", user: { id: "1", email: "user@example.com", role: "user" } } });
  render(<LoginForm />);
  await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
  await userEvent.type(screen.getByLabelText("Password"), "secret123");
  await userEvent.click(screen.getByRole("button", { name: "Sign In" }));
  await waitFor(() => expect(login).toHaveBeenCalledWith({ email: "user@example.com", password: "secret123" }));
  expect(navigationMocks.push).toHaveBeenCalledWith("/dashboard/user");
});

test("displays the current API error", async () => {
  login.mockResolvedValue({ success: false, message: "Invalid email or password" });
  render(<LoginForm />);
  fireEvent.submit(screen.getByRole("button", { name: "Sign In" }).closest("form")!);
  expect(await screen.findByText("Invalid email or password")).toBeVisible();
});
