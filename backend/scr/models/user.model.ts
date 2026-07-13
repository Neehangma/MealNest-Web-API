declare const require: any;
declare const module: any;

const mongoose = require("mongoose");
const { ALLOWED_ROLES } = require("../config/constant");

const reservationSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },
    cuisine: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    reservationDate: {
      type: Date,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    guests: {
      type: Number,
      default: 2,
    },
    status: {
      type: String,
      enum: ["confirmed", "pending", "completed", "cancelled"],
      default: "confirmed",
    },
    specialRequests: {
      type: String,
      default: "",
    },
    bookingReference: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    restaurantAddress: {
      type: String,
      default: "",
    },
    customerName: {
      type: String,
      default: "",
      trim: true,
    },
    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },
    customerEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ["esewa", "mobile_banking"],
    },
    paymentStatus: {
      type: String,
      enum: ["simulated_success"],
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ALLOWED_ROLES,
      default: "user",
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    }],
    reservations: [reservationSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
