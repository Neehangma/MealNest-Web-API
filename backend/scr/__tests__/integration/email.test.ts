const request = require("supertest");
const app = require("../../server");
const emailService = require("../../services/emailService");
const User = require("../../models/user.model");
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
    expect(response.body.emailError).toBeUndefined();
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

  test("keeps a paid booking confirmed when confirmation email fails", async () => {
    emailService.sendBookingConfirmationEmail.mockRejectedValueOnce(
      Object.assign(new Error("SMTP unavailable"), {
        code: "ETIMEDOUT",
        command: "CONN",
      }),
    );
    const user = await createTestUser({ email: "saved-booking@example.com" });
    const restaurant = await createTestRestaurant({ name: "Saved Booking Restaurant" });
    const token = tokenFor(user);

    const response = await request(app).post("/api/bookings").set("Authorization", `Bearer ${token}`).send({
      restaurantId: restaurant._id.toString(), restaurantName: restaurant.name,
      customerName: "Saved Booking User", customerPhone: "9800000000", esewaId: "9800000000",
      date: "2030-09-03", reservationDate: "2030-09-03T13:15:00.000Z", time: "7:00 PM", guests: 2,
      paymentMethod: "esewa", paymentStatus: "simulated_success", totalPaid: 700,
    });

    expect(response.status).toBe(201);
    expect(response.body.emailSent).toBe(false);
    expect(response.body.emailError).toBe(
      "Confirmation email could not be sent",
    );
    expect(response.body.booking).toMatchObject({
      status: "confirmed",
      paymentStatus: "simulated_success",
      totalPaid: 700,
    });
    expect(response.body.booking._id).toBeTruthy();
    expect(emailService.sendBookingConfirmationEmail).toHaveBeenCalledTimes(1);
  });

  test("confirms the booking without calling SMTP when the user email is missing", async () => {
    const user = await createTestUser({ email: "legacy-email@example.com" });
    await User.collection.updateOne(
      { _id: user._id },
      { $unset: { email: "" } },
    );
    const restaurant = await createTestRestaurant({
      name: "Missing Email Restaurant",
    });

    const response = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({
        restaurantId: restaurant._id.toString(),
        restaurantName: restaurant.name,
        customerPhone: "9800000000",
        esewaId: "9800000000",
        date: "2030-09-04",
        reservationDate: "2030-09-04T13:15:00.000Z",
        time: "7:00 PM",
        guests: 2,
        paymentMethod: "esewa",
        paymentStatus: "simulated_success",
        totalPaid: 500,
        transactionId: "CW2-MISSING-EMAIL",
      });

    expect(response.status).toBe(201);
    expect(response.body.booking.status).toBe("confirmed");
    expect(response.body.emailSent).toBe(false);
    expect(response.body.emailError).toBe(
      "Confirmation email could not be sent",
    );
    expect(emailService.sendBookingConfirmationEmail).not.toHaveBeenCalled();
  });
});

