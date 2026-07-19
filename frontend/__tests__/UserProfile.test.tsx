import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileSettingsClient from "@/app/profile/ProfileSettingsClient";

jest.mock("@/lib/actions/profile-action", () => ({ updateProfileAction: jest.fn(), logoutAction: jest.fn() }));
jest.mock("@/app/_components/LogoutProvider", () => ({ useLogout: () => ({ requestLogout: jest.fn() }) }));

test("displays profile data and opens the existing update confirmation", async () => {
  render(<ProfileSettingsClient user={{ fullName: "Dawa Sherpa", email: "dawa@example.com", phoneNumber: "9845698712", profilePicture: "/avatar.jpg", location: "Kathmandu", bio: "Food lover" }} />);
  expect(screen.getByDisplayValue("Dawa Sherpa")).toBeVisible();
  expect(screen.getByDisplayValue("dawa@example.com")).toBeVisible();
  await userEvent.clear(screen.getByLabelText("Full Name"));
  await userEvent.type(screen.getByLabelText("Full Name"), "Dawa S");
  await userEvent.click(screen.getByRole("button", { name: "Update Profile" }));
  expect(screen.getByRole("heading", { name: "Confirm Profile Update" })).toBeVisible();
});
