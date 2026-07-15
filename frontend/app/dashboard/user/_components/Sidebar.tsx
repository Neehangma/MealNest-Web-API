"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/app/_components/LogoutProvider";
import Icon, { type IconName } from "./Icon";

const NAV_ITEMS: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Dashboard", href: "/dashboard/user", icon: "grid" },
  { label: "My Reservations", href: "/dashboard/user/reservations", icon: "calendar" },
  { label: "Favorites", href: "/dashboard/user/favorites", icon: "heart" },
  { label: "Profile Settings", href: "/dashboard/user/profile", icon: "user" },
  { label: "Payment Methods", href: "/dashboard/user/payment-methods", icon: "card" },
];

export default function Sidebar({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { requestLogout } = useLogout();
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
      <div className="dash-sidebar-logout-form">
        <button type="button" className="dash-sidebar-link dash-sidebar-logout" onClick={(event) => requestLogout(event.currentTarget)}><Icon name="logout" size={20} /><span>Log Out</span></button>
      </div>
    </aside>
  );
}
