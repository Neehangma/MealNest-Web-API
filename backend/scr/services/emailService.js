const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function valueOrFallback(value) {
  return value === undefined || value === null || String(value).trim() === ""
    ? "Not provided"
    : String(value);
}

function escapeHtml(value) {
  return valueOrFallback(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPaymentMethod(method) {
  if (method === "esewa") return "eSewa";
  if (method === "mobile_banking") return "Mobile Banking";
  return valueOrFallback(method);
}

function formatStatus(status) {
  const labels = {
    confirmed: "Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
    completed: "Completed",
    simulated_success: "Simulated Success",
  };
  return labels[status] || valueOrFallback(status);
}

function detailRow(label, value, options = {}) {
  const border = options.total ? "border-top:1px solid #ead5c8;" : "";
  const padding = options.total ? "14px 0 0" : "10px 0";
  const fontSize = options.total ? "font-size:17px;" : "";
  return `<tr><td style="padding:${padding};color:#6c5b50;${border}">${escapeHtml(label)}</td><td style="padding:${padding};text-align:right;font-weight:700;${fontSize}${border}">${escapeHtml(value)}</td></tr>`;
}

async function sendBookingConfirmationEmail({ recipientEmail, customerName, booking }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Booking email is not configured");
  }

  const confirmedBooking = booking || {};
  const displayName = customerName || confirmedBooking.customerName;
  const partySize = confirmedBooking.partySize ?? confirmedBooking.guests;
  const totalValue = confirmedBooking.totalAmount ?? confirmedBooking.totalPaid;
  const totalAmount = Number(totalValue);
  const partySizeDisplay = partySize === undefined || partySize === null || String(partySize).trim() === "" ? "Not provided" : `${partySize} guests`;
  const totalDisplay = totalValue === undefined || totalValue === null || !Number.isFinite(totalAmount) ? "Not provided" : `Rs. ${totalAmount.toLocaleString("en-NP")}`;
  const bookingReference = valueOrFallback(confirmedBooking.bookingReference);
  const subjectReference = bookingReference.replace(/[\r\n]/g, " ");

  const rows = [
    detailRow("Booking Reference", bookingReference),
    detailRow("Restaurant", confirmedBooking.restaurantName),
    detailRow("Location", confirmedBooking.restaurantLocation || confirmedBooking.location),
    detailRow("Address", confirmedBooking.restaurantAddress),
    detailRow("Date", confirmedBooking.date),
    detailRow("Time", confirmedBooking.time),
    detailRow("Party Size", partySizeDisplay),
    detailRow("Customer Name", confirmedBooking.customerName),
    detailRow("Email", confirmedBooking.customerEmail),
    detailRow("Phone", confirmedBooking.customerPhone),
    detailRow("Payment Method", formatPaymentMethod(confirmedBooking.paymentMethod)),
    detailRow("Payment Status", formatStatus(confirmedBooking.paymentStatus)),
    detailRow("Booking Status", formatStatus(confirmedBooking.status)),
    detailRow("Special Notes", confirmedBooking.specialRequests),
    detailRow("Total Paid", totalDisplay, { total: true }),
  ].join("");

  return transporter.sendMail({
    from: `"MealNest" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `MealNest Booking Confirmed - ${subjectReference}`,
    html: `
      <div style="margin:0;padding:32px 16px;background:#f8f1eb;font-family:Arial,sans-serif;color:#231814;">
        <div style="max-width:640px;margin:0 auto;padding:36px;background:#fffaf6;border:1px solid #ead5c8;border-radius:16px;">
          <div style="width:64px;height:64px;margin:0 auto 24px;border-radius:50%;background:#b85a00;color:#fff;font-size:36px;line-height:64px;text-align:center;">&#10003;</div>
          <h1 style="margin:0 0 12px;text-align:center;font-family:Georgia,serif;font-size:30px;">Booking Confirmed!</h1>
          <p>Hello <strong>${escapeHtml(displayName)}</strong>,</p>
          <p>Your table has been reserved successfully.</p>

          <div style="margin-top:28px;padding:24px;background:#fff;border:1px solid #ead5c8;border-radius:12px;">
            <h2 style="margin:0 0 18px;font-family:Georgia,serif;font-size:20px;">Booking Details</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
          </div>

          <p style="margin:28px 0 4px;text-align:center;">We look forward to hosting you!</p>
          <p style="margin:0;text-align:center;font-weight:700;color:#b85a00;">MealNest Team</p>
        </div>
      </div>
    `,
  });
}

module.exports = {
  formatPaymentMethod,
  formatStatus,
  sendBookingConfirmationEmail,
};
