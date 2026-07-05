import { getAuthenticatedUser } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import ProfileSettingsClient from "./ProfileSettingsClient";

const fallbackAvatar =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80";

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "user") {
    redirect("/login");
  }

  return (
    <ProfileSettingsClient
      user={{
        fullName: user.fullName || "MealNest User",
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        profilePicture: user.profilePicture || fallbackAvatar,
        location: user.location || "",
        bio: user.bio || "",
      }}
    />
  );
}
