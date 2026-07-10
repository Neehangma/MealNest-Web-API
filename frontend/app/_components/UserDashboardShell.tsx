"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/app/dashboard/user/_components/Sidebar";

const USER_ROUTES = ["/dashboard/user", "/reservations", "/favorites", "/profile", "/payment-methods", "/change-password"];

export default function UserDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isUserRoute = USER_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (!isUserRoute) return children;

  return <div className="user-dashboard-shell">
    <button type="button" className="user-sidebar-toggle" aria-label="Open dashboard navigation" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(true)}><span /><span /><span /></button>
    <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
    {sidebarOpen && <button type="button" className="dash-sidebar-backdrop" aria-label="Close dashboard navigation" onClick={() => setSidebarOpen(false)} />}
    <div className="user-dashboard-content">{children}</div>
  </div>;
}
