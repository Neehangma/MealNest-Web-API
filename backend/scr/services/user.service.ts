import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/constant";
import { LoginUserDto, normalizeRegisterDto, RegisterUserDto } from "../dtos/user.dtos";
import { HttpException } from "../exceptions/http-exception";
import { userRepository } from "../repositories/user.repository";

const signToken = (payload: { id: string; email: string; role: string }) => {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.jwtSecret, options);
};

export const userService = {
  register: async (data: RegisterUserDto) => {
    const userData = normalizeRegisterDto(data);

    if (!userData.name || !userData.email || !userData.password) {
      throw new HttpException(400, "Name, email and password are required");
    }

    if (userData.password.length < 6) {
      throw new HttpException(400, "Password must be at least 6 characters");
    }

    if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
      throw new HttpException(400, "Passwords do not match");
    }

    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new HttpException(409, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(userData.password, env.bcryptSaltRounds);
    const user = await userRepository.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    });

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { user: user.toJSON(), token };
  },

  login: async (data: LoginUserDto) => {
    const email = data.email?.trim().toLowerCase();

    if (!email || !data.password) {
      throw new HttpException(400, "Email and password are required");
    }

    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new HttpException(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(401, "Invalid email or password");
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { user: user.toJSON(), token };
  },
};
