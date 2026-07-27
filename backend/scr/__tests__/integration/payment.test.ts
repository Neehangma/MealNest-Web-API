const request = require("supertest");
const app = require("../../server");
const { createTestRestaurant, createTestUser, tokenFor } = require("../helpers");

function payload(restaurant, overrides = {}) {
  return {
    restaurantId: restaurant._id.toString(), restaurantName: restaurant.name,
    customerName: "CW2 Payer", customerPhone: "9800000000",
    date: "2030-08-01", reservationDate: "2030-08-01T13:15:00.000Z", time: "7:00 PM", guests: 2,
    paymentMethod: "esewa", paymentStatus: "simulated_success", totalPaid: 500,
    transactionId: "CW2-PAYMENT-001", esewaId: "9800000000", ...overrides,
  };
}

describe("payment validation within booking creation", () => {
  test.each(["esewa", "mobile_banking"])("accepts supported %s payment", async (paymentMethod) => {
    const user = await createTestUser();
    const restaurant = await createTestRestaurant();
    const paymentDetails = paymentMethod === "esewa" ? { esewaId: "9800000000" } : { esewaId: undefined, bankAccountNumber: "123456789012" };
    const response = await request(app).post("/api/bookings").set("Authorization", `Bearer ${tokenFor(user)}`).send(payload(restaurant, { paymentMethod, ...paymentDetails }));
    expect(response.status).toBe(201);
    expect(response.body.booking).toMatchObject({ paymentMethod, paymentStatus: "simulated_success", transactionId: "CW2-PAYMENT-001" });
    expect(JSON.stringify(response.body)).not.toContain("123456789012");
  });

  test("accepts a standard checkout time while still validating table capacity", async () => {
    const user = await createTestUser();
    const restaurant = await createTestRestaurant({ availableTimeSlots: ["7:00 PM"] });
    restaurant.availableTimeSlots = ["7:00 PM"];
    await restaurant.save();

    const response = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send(payload(restaurant, { time: "6:30 PM" }));

    expect(response.status).toBe(201);
    expect(response.body.booking).toMatchObject({
      time: "6:30 PM",
      status: "confirmed",
    });
  });

  test.each([
    [{ esewaId: "" }, "eSewa ID must contain exactly 10 digits."],
    [{ paymentMethod: "mobile_banking", bankAccountNumber: "1234" }, "Bank account number must contain between 10 and 16 digits."],
    [{ customerPhone: "123" }, "Phone number must contain exactly 10 digits."],
    [{ totalPaid: -1 }, "Invalid payment amount"],
    [{ paymentMethod: "cash" }, "Payment method must be eSewa or Mobile Banking"],
    [{ paymentStatus: "failed" }, "Payment must succeed before creating a reservation"],
  ])("rejects invalid payment data", async (overrides, message) => {
    const user = await createTestUser();
    const restaurant = await createTestRestaurant();
    const response = await request(app).post("/api/bookings").set("Authorization", `Bearer ${tokenFor(user)}`).send(payload(restaurant, overrides));
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(message);
  });
});
