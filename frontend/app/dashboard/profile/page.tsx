import Link from "next/link";
import { getUserData } from "@/lib/cookies";
import UpdateForm from "../_components/UpdateForm";

export default async function ProfilePage() {
  const user = await getUserData();

  return (
    <main className="meal-dashboard profile-settings-page">
      <header className="meal-dashboard-nav">
        <Link href="/" className="meal-dashboard-logo">
          MealNest
        </Link>

        <nav aria-label="Primary navigation" className="meal-dashboard-links">
          <Link href="/">Discover</Link>
          <Link href="/dashboard">Reservations</Link>
          <Link href="/dashboard">Favorites</Link>
        </nav>

        <div className="meal-dashboard-tools">
          <button type="button" aria-label="Search">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&w=120&q=80"
            alt="User avatar"
          />
        </div>
      </header>

      <UpdateForm user={user} />

      <footer className="meal-dashboard-footer">
        <div>
          <h2>MealNest</h2>
          <p>Premium dining logistics and reservations for the modern connoisseur.</p>
        </div>
        <nav aria-label="Platform links">
          <h3>Platform</h3>
          <Link href="/">About Us</Link>
          <Link href="/">Press</Link>
          <Link href="/">Careers</Link>
        </nav>
        <nav aria-label="Support links">
          <h3>Support</h3>
          <Link href="/">Privacy Policy</Link>
          <Link href="/">Terms of Service</Link>
          <Link href="/">Contact</Link>
        </nav>
        <div>
          <h3>Connect</h3>
          <div className="meal-social-links">
            <Link href="/" aria-label="Visit MealNest region page">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3c3 3 3 15 0 18" />
                <path d="M12 3c-3 3-3 15 0 18" />
              </svg>
            </Link>
            <Link href="/" aria-label="Visit MealNest website">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
            <Link href="/" aria-label="Share MealNest">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.6 10.5 6.8-4" />
                <path d="m8.6 13.5 6.8 4" />
              </svg>
            </Link>
          </div>
          <p>&copy; 2024 MealNest. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
