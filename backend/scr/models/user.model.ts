import mongoose, { Schema, model } from "mongoose";
import { User } from "../types/user.type";

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const user = ret as unknown as Record<string, unknown>;
    user.id = user._id?.toString();
    delete user._id;
    delete user.password;
    return user;
  },
});

export const UserModel =
  mongoose.models.User || model<User>("User", userSchema);
