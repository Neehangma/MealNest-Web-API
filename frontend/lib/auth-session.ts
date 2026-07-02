import { getCurrentUser } from "@/lib/api/auth";
import { getTokenCookie } from "@/lib/cookies";

export async function getAuthenticatedUser() {
  const token = await getTokenCookie();

  if (!token) return null;

  try {
    const response = await getCurrentUser(token);
    return response.user;
  } catch {
    return null;
  }
}
