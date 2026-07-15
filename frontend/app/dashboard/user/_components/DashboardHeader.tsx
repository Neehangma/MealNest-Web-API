"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLogout } from "@/app/_components/LogoutProvider";
import Icon from "./Icon";

type HeaderUser = {
  fullName?: string;
  email?: string;
  profilePicture?: string;
};

const NAV_LINKS = [
  { label: "Discover", href: "/dashboard/user/discover" },
  { label: "My Reservations", href: "/dashboard/user/reservations" },
  { label: "Favorites", href: "/dashboard/user/favorites" },
];

export default function DashboardHeader({
  user,
  onToggleSidebar,
  searchQuery = "",
  onSearchChange,
}: {
  user: HeaderUser;
  onToggleSidebar?: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}) {
  const displayName = user?.fullName || "MealNest User";
  const pathname = usePathname();
  const avatar = user?.profilePicture;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { requestLogout } = useLogout();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="dash-header">
      <div className="dash-header-left">
        <button
          type="button"
          className="dash-header-menu-btn"
          aria-label="Toggle navigation"
          onClick={onToggleSidebar}
        >
          <span />
          <span />
          <span />
        </button>
        <Link href="/dashboard/user" className="dash-header-brand">
          <Image src="/images/Logo.png" alt="MealNest logo" width={40} height={40} priority />
          <span>MealNest</span>
        </Link>
      </div>

      <nav className="dash-header-nav" aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <Link key={link.label} href={link.href} className={pathname === link.href || pathname.startsWith(`${link.href}/`) ? "is-active" : ""} aria-current={pathname === link.href || pathname.startsWith(`${link.href}/`) ? "page" : undefined}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="dash-header-actions">
        <div className="dash-header-search">
          <Icon name="search" size={18} />
          <input type="search" value={searchQuery} onChange={(event) => onSearchChange?.(event.target.value)} placeholder="Search restaurants" aria-label="Search restaurants" />
        </div>

        <div className="dash-profile" ref={menuRef}>
          <button
            type="button"
            className="dash-profile-trigger"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {avatar ? (
              <img src={avatar} alt={`${displayName} profile`} className="dash-avatar" />
            ) : (
              <span className="dash-avatar dash-avatar-fallback" aria-hidden>
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="dash-profile-name">{displayName.split(" ")[0]}</span>
            <Icon name="chevron-down" size={16} />
          </button>

          {menuOpen && (
            <div className="dash-profile-menu" role="menu">
              <div className="dash-profile-menu-head">
                <strong>{displayName}</strong>
                {user?.email && <small>{user.email}</small>}
              </div>
              <Link href="/dashboard/user/profile" role="menuitem" onClick={() => setMenuOpen(false)}>
                <Icon name="user" size={18} />
                <span>My Profile</span>
              </Link>
              <Link href="/dashboard/user/reservations" role="menuitem" onClick={() => setMenuOpen(false)}>
                <Icon name="calendar" size={18} />
                <span>My Reservations</span>
              </Link>
              <Link href="/dashboard/user/payment-methods" role="menuitem" onClick={() => setMenuOpen(false)}>
                <Icon name="card" size={18} />
                <span>Payment Methods</span>
              </Link>
              <button
                type="button"
                role="menuitem"
                className="dash-profile-menu-logout"
                onClick={(event) => {
                  setMenuOpen(false);
                  requestLogout(event.currentTarget);
                }}
              >
                <Icon name="logout" size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
