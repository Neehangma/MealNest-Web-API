"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/profile-action";
import Icon, { type IconName } from "./Icon";

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/user", icon: "grid" },
  { label: "My Reservations", href: "/reservations", icon: "calendar" },
  { label: "Favorites", href: "/favorites", icon: "heart" },
  { label: "Reviews", href: "/dashboard/user#recent-history", icon: "message-square" },
  { label: "Profile", href: "/profile", icon: "user" },
  { label: "Payment Methods", href: "/payment-methods", icon: "card" },
  { label: "Settings", href: "/profile", icon: "settings" },
];

export default function Sidebar({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`dash-sidebar ${open ? "is-open" : ""}`} aria-label="Dashboard navigation">
      <Link href="/dashboard/user" className="dash-sidebar-brand" onClick={onNavigate}>
        MealNest
      </Link>

      <nav className="dash-sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/dashboard/user"
            ? pathname === "/dashboard/user"
            : pathname === item.href.split("#")[0];

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`dash-sidebar-link ${isActive ? "is-active" : ""}`}
              onClick={onNavigate}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction} className="dash-sidebar-logout-form">
        <button type="submit" className="dash-sidebar-link dash-sidebar-logout">
          <Icon name="logout" size={20} />
          <span>Logout</span>
        </button>
      </form>
    </aside>
  );
}
