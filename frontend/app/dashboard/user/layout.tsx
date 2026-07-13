import { getAuthenticatedUser } from "@/lib/auth-session";
import { getDashboardPathForRole } from "@/lib/auth-routing";
import { redirect } from "next/navigation";
import UserDashboardShell from "./_components/UserDashboardShell";

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user) redirect("/login");
  if (user.role !== "user") redirect(getDashboardPathForRole(user.role));

  return (
    <UserDashboardShell
      user={{ fullName: user.fullName, profilePicture: user.profilePicture }}
    >
      {children}
    </UserDashboardShell>
  );
}
