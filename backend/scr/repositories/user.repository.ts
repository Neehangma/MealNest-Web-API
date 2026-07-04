import User from "../models/user.model";
import { parsePagination } from "../utils/apihelper.utils";

export function findByEmail(email: string, includePassword: boolean = false) {
  const query = User.findOne({ email });
  return includePassword ? query.select("+password") : query;
}

export function findById(id: string) {
  return User.findById(id);
}

export function createUser(payload: any) {
  return User.create(payload);
}

export async function listUsers(queryParams: any) {
  const { page, limit, skip } = parsePagination(queryParams);
  const search = String(queryParams.search || "").trim();

  let filter: any = {};
  if (search) {
    filter = {
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
  }

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function deleteUser(id: string) {
  return User.findByIdAndDelete(id);
}
