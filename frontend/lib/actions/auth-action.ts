"use server"; // server side api call
import { login, register, updateUser, whoami } from "@/lib/api/auth";
import { LoginFormData, RegisterFormData } from "@/app/(auth)/components/schema";
import { clearAuthCookies, getTokenCookie, setTokenCookie, storeUserData } from "@/lib/cookies";

const getActionErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

export const handleRegisterUser = async (data: RegisterFormData) => {
    try{
        // how to handle data from component and how to send to component
        const result = await register(data);
        if(result.success){
            return { success: true, message: result.message, data: result.data }; 
        }else{
            return { success: false, message: result.message || 'Registration failed' };    
        }
    }catch (error: unknown){
        return { success: false, message: getActionErrorMessage(error, "Registration failed") };    
    }
}
export const handleLoginUser = async (data: LoginFormData) => {
    try{
        // how to handle data from component and how to send to component
        const result = await login(data);
        // set cookie
        const user = result.data.user;
        const token = result.data.token;
        await setTokenCookie(token);
        await storeUserData(user);

        if(result.success){
            return { success: true, message: result.message, data: result.data }; 
        }else{
            return { success: false, message: result.message || 'Login failed' };    
        }
    }catch (error: unknown){
        return { success: false, message: getActionErrorMessage(error, "Login failed") };    
    }
}

export const handleWhoami = async () => {
    try {
        const token = await getTokenCookie();
        if (!token) {
            return { success: false, message: "Authentication is required" };
        }

        const result = await whoami(token);
        if (result.success) {
            await storeUserData(result.data.user);
            return { success: true, message: result.message, data: result.data };
        }

        return { success: false, message: result.message || "Failed to load user profile" };
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Failed to load user profile") };
    }
}

export const handleUpdateUser = async (data: FormData) => {
    try {
        const token = await getTokenCookie();
        if (!token) {
            return { success: false, message: "Authentication is required" };
        }

        const result = await updateUser(data, token);
        if (result.success) {
            await storeUserData(result.data.user);
            return { success: true, message: result.message, data: result.data };
        }

        return { success: false, message: result.message || "Profile update failed" };
    } catch (error: unknown) {
        return { success: false, message: getActionErrorMessage(error, "Profile update failed") };
    }
}

export const handleLogoutUser = async () => {
    await clearAuthCookies();
    return { success: true };
}
