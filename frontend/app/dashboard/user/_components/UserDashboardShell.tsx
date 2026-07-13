"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/profile-action";

const headerLinks = [
  { label: "Discover", href: "/dashboard/user" },
  { label: "My Reservations", href: "/dashboard/user/reservations" },
  { label: "Favorites", href: "/dashboard/user/favorites" },
];

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard/user", icon: "⌂" },
  { label: "My Reservations", href: "/dashboard/user/reservations", icon: "▣" },
  { label: "Favorites", href: "/dashboard/user/favorites", icon: "♡" },
  { label: "Profile Settings", href: "/dashboard/user/profile", icon: "○" },
  { label: "Payment Methods", href: "/dashboard/user/payment-methods", icon: "▤" },
];

export default function UserDashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { fullName?: string; profilePicture?: string };
}) {
  const pathname = usePathname();
  const displayName = user.fullName || "MealNest User";
  const avatar = user.profilePicture || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80";
  const isActive = (href: string) =>
    href === "/dashboard/user" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="user-dashboard-layout">
      <header className="customer-nav user-dashboard-header">
        <Link className="customer-brand" href="/dashboard/user">MealNest</Link>
        <nav aria-label="Customer navigation">
          {headerLinks.map((link) => (
            <Link key={link.href} href={link.href} className={isActive(link.href) ? "active" : ""}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="customer-nav-actions">
          <label className="user-dashboard-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Search restaurants" aria-label="Search restaurants" />
          </label>
          <details className="user-dashboard-profile">
            <summary>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt="" />
              <span>{displayName}</span>
            </summary>
            <div>
              <Link href="/dashboard/user/profile">Profile</Link>
              <Link href="/dashboard/user/settings">Settings</Link>
            </div>
          </details>
        </div>
      </header>

      <div className="user-dashboard-body">
        <aside className="user-dashboard-sidebar" aria-label="User dashboard navigation">
          <nav>
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`user-sidebar-link${isActive(link.href) ? " active" : ""}`}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                <span aria-hidden="true">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="user-sidebar-logout">
              <span aria-hidden="true">↪</span>
              Log Out
            </button>
          </form>
        </aside>

        <main className="user-dashboard-content">{children}</main>
      </div>
    </div>
  );
}
