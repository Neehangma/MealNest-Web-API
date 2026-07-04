const mongoose = require("mongoose");
const { ALLOWED_ROLES } = require("../config/constant");

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
    role: {
      type: String,
      enum: ALLOWED_ROLES,
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
