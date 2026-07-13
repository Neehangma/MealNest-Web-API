import { getAuthenticatedUser } from "@/lib/auth-session";
import { getDashboardPathForRole } from "@/lib/auth-routing";
import { redirect } from "next/navigation";

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user) redirect("/login");
  if (user.role !== "user") redirect(getDashboardPathForRole(user.role));

  return children;
}
