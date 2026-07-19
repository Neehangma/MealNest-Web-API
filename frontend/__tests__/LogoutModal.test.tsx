import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutProvider, { useLogout } from "@/app/_components/LogoutProvider";

jest.mock("@/lib/actions/profile-action", () => ({ logoutAction: jest.fn() }));
function Trigger() { const { requestLogout } = useLogout(); return <button onClick={(event) => requestLogout(event.currentTarget)}>Open logout</button>; }

test("opens and cancels the logout confirmation", async () => {
  render(<LogoutProvider><Trigger /></LogoutProvider>);
  await userEvent.click(screen.getByRole("button", { name: "Open logout" }));
  expect(screen.getByRole("dialog", { name: "Confirm Logout" })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
