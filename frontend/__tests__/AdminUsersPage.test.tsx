import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminUsersPage from "@/app/admin/users/page";
import { createAdminUserAction, getAdminUserByIdAction, getAdminUsersAction } from "@/lib/actions/admin/user-action";

jest.mock("@/lib/actions/admin/user-action", () => ({
  createAdminUserAction: jest.fn(),
  deleteAdminUserAction: jest.fn(),
  getAdminUserByIdAction: jest.fn(),
  getAdminUsersAction: jest.fn(),
  updateAdminUserAction: jest.fn(),
}));

const getUsers = jest.mocked(getAdminUsersAction);
const createUser = jest.mocked(createAdminUserAction);
const getUserDetails = jest.mocked(getAdminUserByIdAction);
const createdUser = {
  id: "507f1f77bcf86cd799439011",
  fullName: "Created User",
  email: "created@example.com",
  phoneNumber: "9845698712",
  profilePicture: "",
  role: "user" as const,
  createdAt: "2030-01-01T00:00:00.000Z",
  updatedAt: "2030-01-01T00:00:00.000Z",
};

beforeEach(() => {
  getUsers.mockReset();
  createUser.mockReset();
  getUserDetails.mockReset();
});

test("creates a user, closes the modal, refreshes the table, and shows success", async () => {
  getUsers
    .mockResolvedValueOnce({ success: true, data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } })
    .mockResolvedValueOnce({ success: true, data: [createdUser], meta: { page: 1, limit: 10, total: 1, totalPages: 1 } });
  createUser.mockResolvedValue({ success: true, message: "User created successfully.", data: createdUser });

  render(<AdminUsersPage />);
  await screen.findByText("No users found.");
  await userEvent.click(screen.getByRole("button", { name: "Create User" }));
  await userEvent.type(screen.getByLabelText("Name"), "  Created User  ");
  await userEvent.type(screen.getByLabelText("Email"), "CREATED@example.com");
  await userEvent.type(screen.getByLabelText("Phone"), "9845698712");
  await userEvent.type(screen.getAllByLabelText(/^Password/)[0], "StrongPass1!");
  await userEvent.click(screen.getByRole("button", { name: "Save User" }));

  await waitFor(() => expect(createUser).toHaveBeenCalledWith({ fullName: "Created User", email: "created@example.com", phoneNumber: "9845698712", password: "StrongPass1!", role: "user" }));
  expect(await screen.findByText("User created successfully.")).toBeVisible();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByText("created@example.com")).toBeVisible();
  expect(getUsers).toHaveBeenCalledTimes(2);
});

test("keeps the modal open and shows a serializable action error", async () => {
  getUsers.mockResolvedValue({ success: true, data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
  createUser.mockResolvedValue({ success: false, message: "A user with this email already exists." });

  render(<AdminUsersPage />);
  await screen.findByText("No users found.");
  await userEvent.click(screen.getByRole("button", { name: "Create User" }));
  await userEvent.type(screen.getByLabelText("Name"), "Duplicate User");
  await userEvent.type(screen.getByLabelText("Email"), "duplicate@example.com");
  await userEvent.type(screen.getByLabelText("Phone"), "9845698712");
  await userEvent.type(screen.getAllByLabelText(/^Password/)[0], "StrongPass1!");
  await userEvent.click(screen.getByRole("button", { name: "Save User" }));

  expect(await screen.findByText("A user with this email already exists.")).toBeVisible();
  expect(screen.getByRole("dialog")).toBeVisible();
  expect(screen.getByLabelText("Email")).toHaveValue("duplicate@example.com");
  expect(screen.getAllByLabelText(/^Password/)[0]).toHaveValue("");
});

test("opens the selected database user in a details modal and closes it", async () => {
  getUsers.mockResolvedValue({
    success: true,
    data: [createdUser],
    meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
  });
  getUserDetails.mockResolvedValue({
    success: true,
    data: {
      user: {
        ...createdUser,
        authenticationProvider: null,
        emailVerified: null,
        isActive: true,
        accountStatus: "active",
      },
      activity: {
        totalReservations: 1,
        upcomingReservations: 0,
        completedReservations: 1,
        cancelledReservations: 0,
        totalReviews: 1,
        averageReviewRating: 4,
        totalFavorites: 0,
      },
      favorites: [],
      reservations: [{
        id: "reservation-1",
        restaurantName: "Siam",
        reservationDate: "2030-01-01T00:00:00.000Z",
        date: "2030-01-01",
        time: "7:00 PM",
        guests: 2,
        tableNumber: 3,
        paymentStatus: "simulated_success",
        status: "completed",
        totalAmount: 900,
        createdAt: "2030-01-01T00:00:00.000Z",
      }],
      reviews: [{
        id: "review-1",
        restaurantName: "Siam",
        rating: 4,
        comment: "A very good dinner.",
        status: "published",
        createdAt: "2030-01-02T00:00:00.000Z",
      }],
    },
  });

  render(<AdminUsersPage />);
  await screen.findByText("created@example.com");
  await userEvent.click(screen.getByRole("button", { name: "View user Created User" }));

  expect(getUserDetails).toHaveBeenCalledWith(createdUser.id);
  expect(await screen.findByRole("dialog", { name: "User Details" })).toBeVisible();
  expect(screen.getByText("Total reservations")).toBeVisible();
  expect(screen.getByText("No favourite restaurants")).toBeVisible();

  await userEvent.click(screen.getByRole("button", { name: "Reservations" }));
  expect(screen.getByText("7:00 PM")).toBeVisible();
  expect(screen.getByText("Rs. 900")).toBeVisible();

  await userEvent.click(screen.getByRole("button", { name: "Reviews" }));
  expect(screen.getByText("A very good dinner.")).toBeVisible();

  await userEvent.click(screen.getByRole("button", { name: "Close user details" }));
  expect(screen.queryByRole("dialog", { name: "User Details" })).not.toBeInTheDocument();
});
