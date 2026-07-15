"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLogout } from "@/app/_components/LogoutProvider";
import styles from "../admin.module.css";

type IconName = "dashboard" | "users" | "restaurants" | "bookings" | "settings" | "logout" | "menu";
const links: { label: string; href: string; icon: IconName }[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Users", href: "/admin/users", icon: "users" },
  { label: "Restaurants", href: "/admin/restaurants", icon: "restaurants" },
  { label: "Bookings", href: "/admin/bookings", icon: "bookings" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

function Icon({ name }: { name: IconName }) {
  return <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === "dashboard" && <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>}
    {name === "users" && <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>}
    {name === "restaurants" && <><path d="M3 9h18l-2-5H5L3 9Z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>}
    {name === "bookings" && <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>}
    {name === "settings" && <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.4 7l2.8-2.8.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>}
    {name === "logout" && <><path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>}
    {name === "menu" && <><path d="M4 6h16M4 12h16M4 18h16"/></>}
  </svg>;
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { requestLogout } = useLogout();
  const [open, setOpen] = useState(false);
  const active = (href: string) => href === "/admin/dashboard"
    ? pathname === "/admin" || pathname === href
    : pathname === href || pathname.startsWith(`${href}/`) || (href === "/admin/bookings" && pathname.startsWith("/admin/booking"));

  return <div className={styles.sharedAdminLayout}>
    <button type="button" className={styles.adminMobileMenu} aria-label="Open admin navigation" aria-expanded={open} onClick={() => setOpen(true)}><Icon name="menu" /></button>
    {open && <button type="button" className={styles.adminSidebarOverlay} aria-label="Close admin navigation" onClick={() => setOpen(false)} />}
    <aside className={`${styles.sharedAdminSidebar} ${open ? styles.sharedAdminSidebarOpen : ""}`}>
      <div className={styles.sharedAdminBrand}><Image src="/images/Logo.png" alt="MealNest" width={58} height={58}/><div><strong>MealNest</strong><span>SYSTEM MANAGEMENT</span></div></div>
      <nav className={styles.sharedAdminNav} aria-label="Admin navigation">{links.map((link) => <Link key={link.href} href={link.href} className={`${styles.sharedAdminNavItem} ${active(link.href) ? styles.sharedAdminNavActive : ""}`} aria-current={active(link.href) ? "page" : undefined} onClick={() => setOpen(false)}><Icon name={link.icon}/><span>{link.label}</span></Link>)}</nav>
      <footer className={styles.sharedAdminFooter}><button type="button" className={styles.sharedAdminLogout} onClick={(event) => { setOpen(false); requestLogout(event.currentTarget); }}><Icon name="logout"/><span>Logout</span></button></footer>
    </aside>
    <div className={styles.sharedAdminMain}>{children}</div>
  </div>;
}
