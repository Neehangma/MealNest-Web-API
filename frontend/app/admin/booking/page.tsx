"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";

interface Booking {
  id: string;
  restaurantName: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  partySize: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  specialRequests?: string;
}

const mockBookings: Booking[] = [
  {
    id: "1",
    restaurantName: "The Golden Truffle",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    date: "Oct 24, 2024",
    time: "7:30 PM",
    partySize: 2,
    status: "confirmed",
    specialRequests: "Anniversary dinner - quiet table preferred",
  },
  {
    id: "2",
    restaurantName: "Sakura Omakase",
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    date: "Oct 25, 2024",
    time: "8:00 PM",
    partySize: 4,
    status: "pending",
  },
  {
    id: "3",
    restaurantName: "La Bella Italia",
    customerName: "Bob Johnson",
    customerEmail: "bob@example.com",
    date: "Oct 26, 2024",
    time: "6:00 PM",
    partySize: 3,
    status: "confirmed",
    specialRequests: "Gluten-free options needed",
  },
  {
    id: "4",
    restaurantName: "El Toro Loco",
    customerName: "Alice Williams",
    customerEmail: "alice@example.com",
    date: "Oct 23, 2024",
    time: "5:00 PM",
    partySize: 2,
    status: "completed",
  },
  {
    id: "5",
    restaurantName: "Dragon Palace",
    customerName: "Charlie Brown",
    customerEmail: "charlie@example.com",
    date: "Oct 27, 2024",
    time: "7:00 PM",
    partySize: 5,
    status: "cancelled",
  },
];

type IconName = "grid" | "users" | "store" | "calendar" | "star" | "profile" | "search" | "bell" | "chevron" | "arrow";

function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg {...props}>
      {name === "grid" && (
        <>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </>
      )}
      {name === "users" && (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )}
      {name === "store" && (
        <>
          <path d="m3 9 2-5h14l2 5" />
          <path d="M5 9v10h14V9" />
          <path d="M8 13h3v6" />
          <path d="M13 13h3" />
          <path d="M3 9h18" />
        </>
      )}
      {name === "calendar" && (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
        </>
      )}
      {name === "star" && <path d="m12 2 3.1 6.3 6.9 1-5 4.8 1.2 6.8L12 17.7 5.8 21 7 14.1 2 9.3l6.9-1L12 2Z" />}
      {name === "profile" && (
        <>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </>
      )}
      {name === "search" && (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </>
      )}
      {name === "bell" && (
        <>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </>
      )}
      {name === "chevron" && <path d="m6 9 6 6 6-6" />}
      {name === "arrow" && (
        <>
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </>
      )}
    </svg>
  );
}

const navItems: { label: string; icon: IconName; active?: boolean; href: string }[] = [
  { label: "Dashboard", icon: "grid", href: "/admin" },
  { label: "Users", icon: "users", href: "/admin/users" },
  { label: "Bookings", icon: "calendar", active: true, href: "/admin/booking" },
  { label: "Restaurants", icon: "store", href: "/admin/restaurant" },
  { label: "Favorites", icon: "star", href: "/admin/favourite" },
  { label: "Profile", icon: "profile", href: "/admin/profile" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "cancelled" | "completed">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (bookingId: string, newStatus: Booking["status"]) => {
    setBookings(bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  const getStatusBadge = (status: Booking["status"]) => {
    const styles = {
      confirmed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
      completed: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className={styles.adminRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandName}>MealNest</span>
          <span className={styles.brandSub}>ADMIN</span>
        </div>

        <nav className={styles.nav} aria-label="Admin navigation">
          {navItems.map((item) => (
            <a key={item.label} className={`${styles.navItem} ${item.active ? styles.navActive : ""}`} href={item.href}>
              <Icon name={item.icon} size={24} />
              <span className={styles.navLabel}>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.search}>
            <Icon name="search" size={22} />
            <input
              className={styles.searchInput}
              placeholder="Search bookings..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.topActions}>
            <button className={`${styles.iconButton} ${styles.notification}`} type="button" aria-label="Notifications">
              <Icon name="bell" size={23} />
              <span className={styles.badge}>3</span>
            </button>
            <div className={styles.profile}>
              <span className={styles.profileAvatar}>A</span>
              <Icon name="chevron" size={18} />
            </div>
          </div>
        </header>

        <section className={styles.content}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings Management</h1>
              <p className="text-gray-600">View and manage all restaurant reservations</p>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Party</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No bookings found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{booking.restaurantName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{booking.customerName}</div>
                          <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{booking.date}</div>
                        <div className="text-sm text-gray-500">{booking.time}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{booking.partySize}</td>
                      <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value as any)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                          </select>
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </p>
          </div>
        </section>
      </main>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Restaurant</label>
                <p className="text-gray-900">{selectedBooking.restaurantName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Customer Name</label>
                  <p className="text-gray-900">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedBooking.customerEmail}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Date</label>
                  <p className="text-gray-900">{selectedBooking.date}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Time</label>
                  <p className="text-gray-900">{selectedBooking.time}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Party Size</label>
                  <p className="text-gray-900">{selectedBooking.partySize}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
              </div>
              {selectedBooking.specialRequests && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Special Requests</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded mt-1">{selectedBooking.specialRequests}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
