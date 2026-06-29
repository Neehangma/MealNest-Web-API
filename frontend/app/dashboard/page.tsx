import { getUserData } from "@/lib/cookies";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getUserData();

  return <DashboardClient user={user} />;
}
