import { getAuthenticatedUser } from "@/lib/auth-session";
import { getDashboardPathForRole } from "@/lib/auth-routing";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  redirect(getDashboardPathForRole(user.role));
}
