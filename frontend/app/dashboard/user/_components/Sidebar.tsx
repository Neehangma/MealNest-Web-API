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
  {
    label: "Dashboard",
    href: "/dashboard/user",
    icon: "grid",
  },
  {
    label: "My Reservations",
    href: "/reservations",
    icon: "calendar",
  },
  {
    label: "Favorites",
    href: "/favorites",
    icon: "heart",
  },
  {
    label: "Reviews",
    href: "/dashboard/user#recent-history",
    icon: "message-square",
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "user",
  },
  {
    label: "Payment Methods",
    href: "/payment-methods",
    icon: "card",
  },
  {
    label: "Settings",
    href: "/profile",
    icon: "settings",
  },
];

export default function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className={`dash-sidebar ${open ? "is-open" : ""}`}>

      {/* Logo */}

      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          🍽️
        </div>

        <div>
          <h2>MealNest</h2>
          <p>Restaurant Reservation</p>
        </div>
      </div>

      {/* User */}

      <div className="sidebar-user">

        <div className="sidebar-avatar">
          U
        </div>

        <div>
          <h4>User Dashboard</h4>
          <span>Welcome Back</span>
        </div>

      </div>

      {/* Navigation */}

      <nav className="sidebar-nav">

        {NAV_ITEMS.map((item) => {

          const active =
            item.href === "/dashboard/user"
              ? pathname === "/dashboard/user"
              : pathname === item.href.split("#")[0];

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={`sidebar-link ${active ? "active" : ""}`}
            >
              <Icon name={item.icon} size={20} />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}

      <form action={logoutAction} className="sidebar-footer">

        <button
          type="submit"
          className="sidebar-link logout"
        >
          <Icon
            name="logout"
            size={20}
          />

          <span>Logout</span>

        </button>

      </form>

    </aside>
  );
}