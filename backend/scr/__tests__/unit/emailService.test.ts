const sendMail = jest.fn();
const createTransport = jest.fn(() => ({ sendMail }));

jest.unmock("../../services/emailService");
jest.mock("nodemailer", () => ({ createTransport }));

describe("booking email service", () => {
  let emailService;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock("nodemailer", () => ({ createTransport }));
    process.env.EMAIL_USER = " mailer@example.com ";
    process.env.EMAIL_PASSWORD = " test-only-password ";
    process.env.EMAIL_FROM_NAME = "MealNest Tests";
    process.env.EMAIL_FROM = " MealNest Tests <mailer@example.com> ";
    process.env.ADMIN_EMAIL = " admin@example.com ";
    process.env.EMAIL_HOST = " smtp.gmail.com ";
    process.env.EMAIL_PORT = " 465 ";
    process.env.EMAIL_SECURE = " true ";
    process.env.FRONTEND_URL = "http://localhost:3000";
    sendMail.mockReset();
    createTransport.mockClear();
    emailService = require("../../services/emailService");
  });

  afterEach(() => {
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
    delete process.env.EMAIL_FROM_NAME;
    delete process.env.ADMIN_EMAIL;
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_PORT;
    delete process.env.EMAIL_SECURE;
    delete process.env.EMAIL_FROM;
    delete process.env.FRONTEND_URL;
  });

  test("creates the configured SMTP transporter without exposing credentials in output", () => {
    expect(createTransport).toHaveBeenCalledWith({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: "mailer@example.com", pass: "test-only-password" },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  });

  test.each([
    ["esewa", "eSewa"], ["mobile_banking", "Mobile Banking"], ["cash", "cash"], [undefined, "Not available"],
  ])("formats payment method %p", (input, expected) => expect(emailService.formatPaymentMethod(input)).toBe(expected));

  test.each([
    ["confirmed", "Confirmed"], ["pending", "Pending"], ["cancelled", "Cancelled"],
    ["completed", "Completed"], ["simulated_success", "Successful"], ["custom", "custom"],
  ])("formats status %p", (input, expected) => expect(emailService.formatStatus(input)).toBe(expected));

  test("rejects missing mail configuration before sending", async () => {
    delete process.env.EMAIL_USER;
    jest.resetModules();
    jest.doMock("nodemailer", () => ({ createTransport }));
    emailService = require("../../services/emailService");
    await expect(emailService.sendBookingConfirmationEmail({ recipientEmail: "user@example.com", booking: {} })).rejects.toThrow("Booking email is not configured");
    expect(sendMail).not.toHaveBeenCalled();
  });

  test("sends a complete escaped confirmation to the fixed testing recipient", async () => {
    sendMail.mockResolvedValue({ messageId: "test-message" });
    const booking = {
      restaurantName: "Bistro <One>", bookingReference: "MN-123", cuisine: "Italian",
      restaurantLocation: "Kathmandu", restaurantAddress: "Test Street", restaurantPhone: "9800000000",
      reservationDate: "2030-01-01T12:00:00Z", time: "7:00 PM", partySize: 4,
      paymentMethod: "mobile_banking", paymentStatus: "simulated_success", status: "confirmed",
      transactionId: "TX-1", specialRequests: "Window & quiet", totalAmount: 1250,
      createdAt: "2030-01-01T10:00:00Z", image: "https://images.example.com/table.jpg",
    };
    await expect(emailService.sendBookingConfirmationEmail({ recipientEmail: " USER@Example.com ", customerName: "Dawa <Sherpa>", booking })).resolves.toEqual({ messageId: "test-message" });
    expect(sendMail).toHaveBeenCalledTimes(1);
    const message = sendMail.mock.calls[0][0];
    expect(message).toMatchObject({
      from: "MealNest Tests <mailer@example.com>",
      to: "user@example.com",
      bcc: "admin@example.com",
    });
    expect(message.subject).toContain("Bistro <One>");
    expect(message.html).toContain("Dawa &lt;Sherpa&gt;");
    expect(message.html).toContain("Bistro &lt;One&gt;");
    expect(message.html).toContain("Mobile Banking");
    expect(message.html).toContain("4 Guests");
    expect(message.html).toContain("Table");
    expect(message.html).toContain("https://images.example.com/table.jpg");
    expect(message.html).not.toContain("test-only-password");
  });

  test("uses safe fallbacks and omits unsafe local images", async () => {
    sendMail.mockResolvedValue({ messageId: "fallback" });
    await emailService.sendBookingConfirmationEmail({ recipientEmail: "guest@example.com", booking: { restaurantName: "Cafe\nInjected", bookingReference: "REF\rX", image: "http://localhost/private.jpg", totalPaid: "invalid", date: "invalid-date" } });
    const message = sendMail.mock.calls[0][0];
    expect(message.subject).not.toContain("\n");
    expect(message.subject).not.toContain("\r");
    expect(message.html).not.toContain("private.jpg");
    expect(message.html).toContain("Guest");
    expect(message.html).toContain("Not available");
    expect(message.html).toContain("invalid-date");
  });

  test("propagates transporter failures", async () => {
    sendMail.mockRejectedValue(new Error("SMTP unavailable"));
    await expect(emailService.sendBookingConfirmationEmail({ recipientEmail: "user@example.com", booking: { restaurantName: "Bistro", bookingReference: "REF" } })).rejects.toThrow("SMTP unavailable");
  });

  test("retries one pre-connection Gmail DNS timeout", async () => {
    const dnsError = Object.assign(new Error("queryA ETIMEOUT smtp.gmail.com"), {
      code: "EDNS",
      command: "CONN",
      response: "queryA ETIMEOUT smtp.gmail.com",
    });
    sendMail
      .mockRejectedValueOnce(dnsError)
      .mockResolvedValueOnce({ messageId: "retried-message" });

    await expect(
      emailService.sendBookingConfirmationEmail({
        recipientEmail: "user@example.com",
        booking: { restaurantName: "Bistro", bookingReference: "REF" },
      }),
    ).resolves.toEqual({ messageId: "retried-message" });
    expect(sendMail).toHaveBeenCalledTimes(2);
  });

  test("sends a reset link to the requested user without exposing secrets", async () => {
    sendMail.mockResolvedValue({ messageId: "reset-message" });
    await emailService.sendPasswordResetEmail({
      recipientEmail: " USER@example.com ",
      customerName: "Dawa <Sherpa>",
      resetToken: "secure-reset-token",
    });

    const message = sendMail.mock.calls[0][0];
    expect(message).toMatchObject({
      from: "MealNest Tests <mailer@example.com>",
      to: "user@example.com",
      subject: "Reset your MealNest password",
    });
    expect(message.html).toContain("http://localhost:3000/reset-password/secure-reset-token");
    expect(message.html).toContain("Dawa &lt;Sherpa&gt;");
    expect(message.html).not.toContain("test-only-password");
  });

  test.each([
    ["sendBookingCancellationEmail", "MealNest booking cancelled", "Booking Cancelled"],
    ["sendReservationUpdatedEmail", "MealNest reservation updated", "Reservation Updated"],
  ])("sends %s to the authenticated user's email", async (method, subject, heading) => {
    sendMail.mockResolvedValue({ messageId: "reservation-change" });
    await emailService[method]({
      recipientEmail: " USER@example.com ",
      customerName: "Dawa",
      booking: {
        restaurantName: "Tavola",
        reservationDate: "2030-07-25",
        time: "7:00 PM",
        guests: 4,
        status: method === "sendBookingCancellationEmail" ? "cancelled" : "confirmed",
        bookingReference: "MN-CHANGE",
      },
    });

    const message = sendMail.mock.calls[0][0];
    expect(message.to).toBe("user@example.com");
    expect(message.subject).toContain(subject);
    expect(message.html).toContain(heading);
    expect(message.html).toContain("MN-CHANGE");
  });
});
