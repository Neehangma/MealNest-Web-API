const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  restaurantName: { type: String, default: "" },
  cuisine: { type: String, default: "" },
  image: { type: String, default: "" },
  location: { type: String, default: "" },
  restaurantAddress: { type: String, default: "" },
  reservationDate: { type: Date, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ["confirmed", "pending", "completed", "cancelled"], default: "confirmed" },
  paymentMethod: { type: String, enum: ["esewa", "mobile_banking"] },
  paymentStatus: { type: String, enum: ["simulated_success"] },
  transactionId: { type: String, default: "" },
  bookingReference: { type: String, required: true, unique: true },
  specialRequests: { type: String, default: "" },
  totalPaid: { type: Number, default: 0, min: 0 },
  legacyId: { type: String, unique: true, sparse: true },
}, { timestamps: true });

module.exports = mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);
