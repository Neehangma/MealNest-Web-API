const request = require("supertest");
const app = require("../../server");
const emailService = require("../../services/emailService");
const { createTestRestaurant, createTestUser, tokenFor } = require("../helpers");

describe("booking confirmation email integration", () => {
  test("calls the mocked email service after successful booking creation", async () => {
    const user = await createTestUser({ fullName: "CW2 Email User", email: "email-user@example.com" });
    const restaurant = await createTestRestaurant({ name: "CW2 Email Restaurant" });
    const response = await request(app).post("/api/bookings").set("Authorization", `Bearer ${tokenFor(user)}`).send({
      restaurantId: restaurant._id.toString(), restaurantName: restaurant.name,
      customerName: "CW2 Email User", customerPhone: "9800000000", esewaId: "9800000000",
      date: "2030-09-01", reservationDate: "2030-09-01T13:15:00.000Z", time: "7:00 PM", guests: 2,
      paymentMethod: "esewa", paymentStatus: "simulated_success", totalPaid: 500,
    });

    expect(response.status).toBe(201);
    expect(response.body.emailSent).toBe(true);
    expect(emailService.sendBookingConfirmationEmail).toHaveBeenCalledWith(expect.objectContaining({
      recipientEmail: "email-user@example.com",
      customerName: "CW2 Email User",
      booking: expect.objectContaining({ restaurantName: "CW2 Email Restaurant", time: "7:00 PM", guests: 2, paymentMethod: "esewa", paymentStatus: "simulated_success" }),
    }));
  });

  test("resends through the authenticated existing endpoint without real email", async () => {
    const user = await createTestUser({ email: "resend@example.com" });
    const restaurant = await createTestRestaurant();
    const token = tokenFor(user);
    const created = await request(app).post("/api/bookings").set("Authorization", `Bearer ${token}`).send({
      restaurantId: restaurant._id.toString(), restaurantName: restaurant.name,
      customerName: "CW2 User", customerPhone: "9800000000", esewaId: "9800000000",
      date: "2030-09-02", reservationDate: "2030-09-02T13:15:00.000Z", time: "7:00 PM", guests: 2,
      paymentMethod: "mobile_banking", paymentStatus: "simulated_success", totalPaid: 600, bankAccountNumber: "123456789012",
    });
    jest.clearAllMocks();
    const resent = await request(app).post("/api/email/send-confirmation").set("Authorization", `Bearer ${token}`).send({ bookingId: created.body.booking._id });
    expect(resent.status).toBe(200);
    expect(resent.body.emailSent).toBe(true);
    expect(emailService.sendBookingConfirmationEmail).toHaveBeenCalledTimes(1);
  });
});

