"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/app/dashboard/user/_components/Sidebar";
import DashboardHeader from "@/app/dashboard/user/_components/DashboardHeader";
import { getUserData } from "@/lib/cookies";
import type { AuthUser } from "@/lib/api/auth";
import Chatbot from "@/components/chatbot/Chatbot";

const USER_ROUTES = ["/dashboard/user", "/discover", "/reservations", "/favorites", "/profile", "/payment-methods", "/change-password", "/restaurants", "/payment-checkout", "/booking-confirmation"];

const UserDashboardContext = createContext({ searchQuery: "", setSearchQuery: (_value: string) => {} });

export function useUserDashboardShell() {
  return useContext(UserDashboardContext);
}

export default function UserDashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const isUserRoute = USER_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  useEffect(() => {
    if (isUserRoute) void getUserData().then(setUser);
  }, [isUserRoute]);

  useEffect(() => {
    const handleUserUpdate = (event: Event) => {
      setUser((event as CustomEvent<AuthUser>).detail);
    };
    window.addEventListener("mealnest:user-updated", handleUserUpdate);
    return () => window.removeEventListener("mealnest:user-updated", handleUserUpdate);
  }, []);

  if (!isUserRoute) return children;

  return <UserDashboardContext.Provider value={{ searchQuery, setSearchQuery }}>
    <div className="user-dashboard-shell">
      <DashboardHeader user={user || {}} searchQuery={searchQuery} onSearchChange={setSearchQuery} onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && <button type="button" className="dash-sidebar-backdrop" aria-label="Close dashboard navigation" onClick={() => setSidebarOpen(false)} />}
      <div className="user-dashboard-content">{children}</div>
      {/* MealNest AI chatbot is mounted only for authenticated user routes. */}
      {user?.role === "user" && <Chatbot />}
    </div>
  </UserDashboardContext.Provider>;
}
