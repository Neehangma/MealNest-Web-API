"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/lib/actions/profile-action";
import Icon from "./Icon";

type HeaderUser = {
  fullName?: string;
  email?: string;
  profilePicture?: string;
};

const NAV_LINKS = [
  { label: "Discover", href: "/dashboard/user" },
  { label: "My Reservations", href: "/reservations" },
  { label: "Favorites", href: "/favorites" },
];

export default function DashboardHeader({
  user,
  onToggleSidebar,
}: {
  user: HeaderUser;
  onToggleSidebar?: () => void;
}) {
  const displayName = user?.fullName || "MealNest User";
  const avatar = user?.profilePicture;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          MealNest
        </Link>
      </div>

      <nav className="dash-header-nav" aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <Link key={link.label} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="dash-header-actions">
        <div className="dash-header-search">
          <Icon name="search" size={18} />
          <input type="search" placeholder="Search restaurants" aria-label="Search restaurants" />
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
              <Link href="/profile" role="menuitem" onClick={() => setMenuOpen(false)}>
                <Icon name="user" size={18} />
                <span>My Profile</span>
              </Link>
              <Link href="/reservations" role="menuitem" onClick={() => setMenuOpen(false)}>
                <Icon name="calendar" size={18} />
                <span>My Reservations</span>
              </Link>
              <Link href="/payment-methods" role="menuitem" onClick={() => setMenuOpen(false)}>
                <Icon name="card" size={18} />
                <span>Payment Methods</span>
              </Link>
              <form action={logoutAction}>
                <button type="submit" role="menuitem" className="dash-profile-menu-logout">
                  <Icon name="logout" size={18} />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
