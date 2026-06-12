import { UserModel } from "../models/user.model";

export const userRepository = {
  create: (data: { name: string; email: string; password: string }) => {
    return UserModel.create(data);
  },

  findByEmail: (email: string, includePassword = false) => {
    const query = UserModel.findOne({ email });
    return includePassword ? query.select("+password") : query;
  },

  findById: (id: string) => {
    return UserModel.findById(id);
  },
};
