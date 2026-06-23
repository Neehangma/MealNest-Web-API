import { Types } from "mongoose";

export interface User {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  image?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, "password"> & {
  id: string;
};

export interface AuthRequestUser {
  id: string;
  email: string;
  role: "user" | "admin";
}
