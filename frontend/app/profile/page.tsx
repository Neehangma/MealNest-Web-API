import Image from "next/image";
import Link from "next/link";
import { getUserData } from "@/lib/cookies";

export default async function ProfilePage() {
  const user = await getUserData();
  const name = user?.fullName || "MealNest User";
  const email = user?.email || "user@example.com";
  const phone = user?.phoneNumber || "Not added";

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-header">
          <Link href="/dashboard" className="profile-back">
            Back to Dashboard
          </Link>
          <Image src="/images/Logo.png" alt="MealNest logo" width={62} height={62} priority />
        </div>

        <div className="profile-avatar">{name.slice(0, 2).toUpperCase()}</div>
        <h1>{name}</h1>
        <p>{email}</p>

        <div className="profile-details">
          <div>
            <span>Full Name</span>
            <strong>{name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{email}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{phone}</strong>
          </div>
          <div>
            <span>Role</span>
            <strong>{user?.role || "user"}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
