import { getAuthenticatedUser } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import PaymentMethodsClient from "./PaymentMethodsClient";

export default async function PaymentMethodsPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "user") {
    redirect("/login");
  }

  return <PaymentMethodsClient />;
}
