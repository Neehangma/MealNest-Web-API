"use server";
import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/contexts/AuthContext";
export async function setTokenCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    })
}
export async function getTokenCookie() {
    const cookieStore = await cookies();
    return cookieStore.get("auth_token")?.value;
}
export async function storeUserData(userData: AuthUser) {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "user_data",
        value: JSON.stringify(userData), // change object into string
        sameSite: "lax",
        path: "/",
    })
}
export async function getUserData() {
    const cookieStore = await cookies();
    const userDataCookie = cookieStore.get("user_data")?.value;
    return userDataCookie ? (JSON.parse(userDataCookie) as AuthUser) : null; // change string into object
}

export async function clearAuthCookies() {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("user_data");
}
