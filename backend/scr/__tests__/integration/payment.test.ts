const request = require("supertest");
const app = require("../../server");
const { createTestRestaurant, createTestUser, tokenFor } = require("../helpers");

function payload(restaurant, overrides = {}) {
  return {
    restaurantId: restaurant._id.toString(), restaurantName: restaurant.name,
    customerName: "CW2 Payer", customerPhone: "9800000000",
    date: "2030-08-01", reservationDate: "2030-08-01T13:15:00.000Z", time: "7:00 PM", guests: 2,
    paymentMethod: "esewa", paymentStatus: "simulated_success", totalPaid: 500,
    transactionId: "CW2-PAYMENT-001", ...overrides,
  };
}

describe("payment validation within booking creation", () => {
  test.each(["esewa", "mobile_banking"])("accepts supported %s payment", async (paymentMethod) => {
    const user = await createTestUser();
    const restaurant = await createTestRestaurant();
    const response = await request(app).post("/api/bookings").set("Authorization", `Bearer ${tokenFor(user)}`).send(payload(restaurant, { paymentMethod }));
    expect(response.status).toBe(201);
    expect(response.body.booking).toMatchObject({ paymentMethod, paymentStatus: "simulated_success", transactionId: "CW2-PAYMENT-001" });
  });

  test.each([
    [{ customerName: "" }, "Valid customer payment details are required"],
    [{ customerPhone: "123" }, "Valid customer payment details are required"],
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

