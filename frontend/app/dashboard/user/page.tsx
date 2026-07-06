import { getAuthenticatedUser } from "@/lib/auth-session";
import { getDashboardPathForRole } from "@/lib/auth-routing";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function UserDashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "user") {
    redirect(getDashboardPathForRole(user.role));
  }

  return <DashboardClient user={user} />;
}
