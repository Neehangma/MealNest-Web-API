"use server";

import { LoginFormData, RegisterFormData } from "@/app/(auth)/components/schema";
import { login, register } from "@/lib/api/auth";
import { setTokenCookie, storeUserData } from "@/lib/cookies";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const handleRegisterUser = async (data: RegisterFormData) => {
  try {
    const result = await register(data);

    return {
      success: true,
      message: result.message,
      data: result,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Registration failed"),
    };
  }
};

export const handleLoginUser = async (data: LoginFormData) => {
  try {
    const result = await login(data);
    await setTokenCookie(result.token);
    await storeUserData(result.user);

    return {
      success: true,
      message: result.message,
      data: result,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: getErrorMessage(error, "Login failed"),
    };
  }
};
