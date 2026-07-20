"use server";

import { LoginFormData, RegisterFormData } from "@/app/(auth)/components/schema";
import { login, register } from "@/lib/api/auth";
import { clearAuthCookies, setTokenCookie, storeUserData } from "@/lib/cookies";
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const handleRegisterUser = async (data: RegisterFormData) => {
  if (!isPasswordValid(data.password)) {
    return { success: false, message: PASSWORD_POLICY_MESSAGE };
  }

  try {
    const result = await register(data);

    if (result.user.role !== "user") {
      await clearAuthCookies();
      return {
        success: false,
        message: "Unauthorized role",
      };
    }

    await clearAuthCookies();
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
      message: getErrorMessage(error, "Registration failed"),
    };
  }
};

export const handleLoginUser = async (data: LoginFormData) => {
  try {
    const result = await login(data);

    if (result.user.role !== "user" && result.user.role !== "admin") {
      await clearAuthCookies();
      return {
        success: false,
        message: "Unauthorized role",
      };
    }

    await clearAuthCookies();
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
