const nodemailer = require("nodemailer");
const BOOKING_EMAIL_TEST_RECIPIENT = "mealnest67@gmail.com";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test" && typeof transporter.verify === "function") {
  transporter.verify()
    .then(() => console.log("Email service is ready"))
    .catch((error) => {
      console.error("Email service configuration failed:", error instanceof Error ? error.message : "Unknown error");
    });
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function valueOrFallback(value, fallback = "Not available") {
  return hasValue(value) ? String(value) : fallback;
}

function escapeHtml(value) {
  return valueOrFallback(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function formatPaymentMethod(method) {
  if (method === "esewa") return "eSewa";
  if (method === "mobile_banking") return "Mobile Banking";
  return valueOrFallback(method);
}

function formatStatus(status) {
  const labels = { confirmed: "Confirmed", pending: "Pending", cancelled: "Cancelled", completed: "Completed", simulated_success: "Successful" };
  return labels[status] || valueOrFallback(status);
}

function formatDate(value, includeTime = false) {
  if (!hasValue(value)) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "Asia/Kathmandu",
  }).format(date);
}

function publicImageUrl(image) {
  if (!hasValue(image)) return "";
  try {
    const url = new URL(String(image));
    if (!["http:", "https:"].includes(url.protocol) || ["localhost", "127.0.0.1"].includes(url.hostname)) return "";
    return url.toString();
  } catch { return ""; }
}

function detailCell(label, value, fallback = "Not available") {
  return `<td width="50%" valign="top" style="width:50%;padding:13px 16px;border-bottom:1px solid #ead8ca;">
    <div style="margin-bottom:6px;color:#897568;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">${escapeHtml(label)}</div>
    <div style="color:#2b1d17;font-size:14px;line-height:1.45;overflow-wrap:anywhere;">${escapeHtml(valueOrFallback(value, fallback))}</div>
  </td>`;
}

function detailRow(leftLabel, leftValue, rightLabel, rightValue, rightFallback) {
  return `<tr>${detailCell(leftLabel, leftValue)}${detailCell(rightLabel, rightValue, rightFallback)}</tr>`;
}

async function sendBookingConfirmationEmail({ customerName, booking }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) throw new Error("Booking email is not configured");

  const confirmed = booking || {};
  const displayName = valueOrFallback(customerName || confirmed.customerName, "Guest");
  const restaurantName = valueOrFallback(confirmed.restaurantName);
  const reference = valueOrFallback(confirmed.bookingReference);
  const guests = hasValue(confirmed.partySize ?? confirmed.guests) ? `${confirmed.partySize ?? confirmed.guests} Guests` : "Not available";
  const totalNumber = Number(confirmed.totalAmount ?? confirmed.totalPaid);
  const total = Number.isFinite(totalNumber) ? `Rs. ${totalNumber.toLocaleString("en-NP")}` : "Not available";
  const imageUrl = publicImageUrl(confirmed.image || confirmed.restaurant?.image);
  const cuisineLocation = [confirmed.cuisine || confirmed.restaurant?.cuisine, confirmed.restaurantLocation || confirmed.location || confirmed.restaurant?.location].filter(hasValue).join(" • ");
  const imageBlock = imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(restaurantName)}" width="640" style="display:block;width:100%;max-width:640px;height:auto;max-height:280px;object-fit:cover;border:0;"/>` : "";

  const rows = [
    detailRow("Address", confirmed.restaurantAddress || confirmed.restaurant?.address, "Restaurant Phone", confirmed.restaurantPhone || confirmed.restaurant?.phone),
    detailRow("Reservation Date", formatDate(confirmed.reservationDate || confirmed.date), "Reservation Time", confirmed.time),
    detailRow("Guests", guests, "Customer", displayName),
    detailRow("Payment Method", formatPaymentMethod(confirmed.paymentMethod), "Payment Status", formatStatus(confirmed.paymentStatus)),
    detailRow("Booking Reference", reference, "Transaction ID", confirmed.transactionId || reference),
    detailRow("Special Request", confirmed.specialRequests || "None", "Booking Status", formatStatus(confirmed.status)),
    detailRow("Booked On", formatDate(confirmed.createdAt, true), "Total Paid", total),
  ].join("");

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: BOOKING_EMAIL_TEST_RECIPIENT,
    subject: `Booking Confirmed – ${restaurantName.replace(/[\r\n]/g, " ")} – ${reference.replace(/[\r\n]/g, " ")}`,
    html: `<!doctype html><html><body style="margin:0;padding:0;background:#eee6df;font-family:Arial,sans-serif;color:#2b1d17;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#eee6df;"><tr><td align="center" style="padding:28px 12px;">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;overflow:hidden;background:#fffaf6;border:1px solid #e3c9b7;border-radius:18px;">
          <tr><td style="padding:24px 30px;background:#a9510a;color:#fff;"><div style="font-family:Georgia,serif;font-size:28px;font-weight:700;">MealNest</div><div style="margin-top:4px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;">Restaurant Reservations</div></td></tr>
          ${imageBlock ? `<tr><td>${imageBlock}</td></tr>` : ""}
          <tr><td style="padding:30px 30px 12px;text-align:center;"><div style="width:58px;height:58px;margin:0 auto 16px;border-radius:50%;background:#e7f6eb;color:#18703e;font-size:32px;font-weight:700;line-height:58px;">&#10003;</div><h1 style="margin:0;color:#2b1d17;font-family:Georgia,serif;font-size:30px;">Booking Confirmed</h1><p style="margin:12px 0 0;color:#6e5d53;line-height:1.6;">Hello <strong>${escapeHtml(displayName)}</strong>, your reservation has been successfully confirmed.</p></td></tr>
          <tr><td style="padding:18px 30px 8px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#fff;border:1px solid #ead8ca;border-radius:13px;"><tr><td style="padding:22px 20px 8px;"><table role="presentation" width="100%"><tr><td><h2 style="margin:0;color:#2b1d17;font-family:Georgia,serif;font-size:24px;">${escapeHtml(restaurantName)}</h2><p style="margin:6px 0 0;color:#79685e;font-size:14px;">${escapeHtml(cuisineLocation || "Restaurant reservation")}</p></td><td align="right" valign="top"><span style="display:inline-block;padding:7px 12px;border-radius:999px;background:#e4f5e9;color:#176b3c;font-size:12px;font-weight:700;">${escapeHtml(formatStatus(confirmed.status))}</span></td></tr></table></td></tr><tr><td style="padding:4px 4px 12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows}</table></td></tr></table></td></tr>
          <tr><td style="padding:24px 34px 34px;text-align:center;color:#65544b;font-size:14px;line-height:1.6;">Please keep this email as your booking reference.<br/><strong style="color:#a9510a;">We look forward to hosting you!</strong></td></tr>
        </table>
      </td></tr></table>
    </body></html>`,
  });
}

module.exports = { formatPaymentMethod, formatStatus, sendBookingConfirmationEmail };
