import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminShell from "@/app/admin/_components/AdminShell";

const requestLogout = jest.fn();
jest.mock("@/app/_components/LogoutProvider", () => ({ useLogout: () => ({ requestLogout }) }));
jest.mock("next/navigation", () => ({ usePathname: () => "/admin/users" }));

test("renders admin identity, navigation, children, and logout action", async () => {
  render(<AdminShell initialAdmin={{ id: "admin", email: "admin@example.com", fullName: "Site Admin", role: "admin" }}><p>Admin child</p></AdminShell>);
  expect(screen.getByText("Admin child")).toBeVisible();
  const navigation = screen.getByRole("navigation", { name: "Admin navigation" });
  expect(navigation).toHaveTextContent("DashboardUsersRestaurantsBookingsSettings");
  expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByText("Site Admin")).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Logout" }));
  expect(requestLogout).toHaveBeenCalledTimes(1);
});

test("opens and closes the mobile navigation overlay", async () => {
  render(<AdminShell initialAdmin={{ id: "admin", email: "admin@example.com", role: "admin" }}>content</AdminShell>);
  const open = screen.getByRole("button", { name: "Open admin navigation" });
  expect(open).toHaveAttribute("aria-expanded", "false");
  await userEvent.click(open);
  expect(screen.getByRole("button", { name: "Close admin navigation" })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Close admin navigation" }));
  expect(screen.queryByRole("button", { name: "Close admin navigation" })).not.toBeInTheDocument();
});
