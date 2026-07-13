"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/profile-action";
import Icon, { type IconName } from "./Icon";

const NAV_ITEMS: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Dashboard", href: "/dashboard/user", icon: "grid" },
  { label: "My Reservations", href: "/reservations", icon: "calendar" },
  { label: "Favorites", href: "/favorites", icon: "heart" },
  { label: "Profile", href: "/profile", icon: "user" },
  { label: "Payment Methods", href: "/payment-methods", icon: "card" },
  { label: "Settings", href: "/change-password", icon: "settings" },
];

export default function Sidebar({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className={`dash-sidebar ${open ? "is-open" : ""}`} aria-label="User dashboard navigation">
      <nav className="dash-sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <Link key={item.label} href={item.href} onClick={onNavigate} className={`dash-sidebar-link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined}>
            <Icon name={item.icon} size={20} /><span>{item.label}</span>
          </Link>;
        })}
      </nav>
      <form action={logoutAction} className="dash-sidebar-logout-form">
        <button type="submit" className="dash-sidebar-link dash-sidebar-logout"><Icon name="logout" size={20} /><span>Log Out</span></button>
      </form>
    </aside>
  );
}
