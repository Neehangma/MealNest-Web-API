import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserDashboardShell from "@/app/_components/UserDashboardShell";
import { getUserData } from "@/lib/cookies";

let pathname = "/dashboard/user";
jest.mock("next/navigation", () => ({ usePathname: () => pathname }));
jest.mock("@/lib/cookies", () => ({ getUserData: jest.fn() }));
jest.mock("@/app/dashboard/user/_components/DashboardHeader", () => ({ user, onToggleSidebar }: { user: { fullName?: string }; onToggleSidebar: () => void }) => <header><span>{user.fullName || "Guest"}</span><button onClick={onToggleSidebar}>Open navigation</button></header>);
jest.mock("@/app/dashboard/user/_components/Sidebar", () => ({ open, onNavigate }: { open: boolean; onNavigate: () => void }) => <aside data-open={open}><button onClick={onNavigate}>Navigate</button></aside>);

beforeEach(() => jest.mocked(getUserData).mockClear());

test("loads the user, renders shell children, and controls mobile navigation", async () => {
  jest.mocked(getUserData).mockResolvedValue({ id: "1", email: "user@example.com", fullName: "MealNest User", role: "user" });
  render(<UserDashboardShell><p>Protected content</p></UserDashboardShell>);
  expect(screen.getByText("Protected content")).toBeVisible();
  await waitFor(() => expect(screen.getByText("MealNest User")).toBeVisible());
  await userEvent.click(screen.getByRole("button", { name: "Open navigation" }));
  expect(screen.getByRole("button", { name: "Close dashboard navigation" })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Close dashboard navigation" }));
  expect(screen.queryByRole("button", { name: "Close dashboard navigation" })).not.toBeInTheDocument();
});

test("leaves public routes unwrapped and does not load auth storage", () => {
  pathname = "/login";
  render(<UserDashboardShell><p>Public content</p></UserDashboardShell>);
  expect(screen.getByText("Public content")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Open navigation" })).not.toBeInTheDocument();
  expect(getUserData).not.toHaveBeenCalled();
  pathname = "/dashboard/user";
});
