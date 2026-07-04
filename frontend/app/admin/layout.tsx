import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDashboardPathForRole } from "@/lib/auth-routing";
import { getAuthenticatedUser } from "@/lib/auth-session";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "MealNest Admin",
  description: "MealNest system management dashboard",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/login");
  }

  return <div className={styles.adminShell}>{children}</div>;
}
