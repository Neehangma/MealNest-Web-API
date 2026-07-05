import { getAuthenticatedUser } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import ChangePasswordClient from "./ChangePasswordClient";

export default async function ChangePasswordPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "user") {
    redirect("/login");
  }

  return <ChangePasswordClient />;
}
