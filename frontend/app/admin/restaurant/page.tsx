"use client";

import { useState } from "react";
import styles from "../admin.module.css";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  priceRange: string;
  status: "active" | "inactive" | "pending";
  image: string;
}

const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "The Golden Truffle",
    cuisine: "French",
    location: "Upper East Side",
    rating: 4.8,
    priceRange: "$$$",
    status: "active",
    image: "/images/Register.jpg",
  },
  {
    id: "2",
    name: "Sakura Omakase",
    cuisine: "Japanese",
    location: "Tribeca",
    rating: 4.9,
    priceRange: "$$$$",
    status: "active",
    image: "/images/Login.jpg",
  },
  {
    id: "3",
    name: "La Bella Italia",
    cuisine: "Italian",
    location: "SoHo",
    rating: 4.6,
    priceRange: "$$",
    status: "active",
    image: "/images/Register.jpg",
  },
  {
    id: "4",
    name: "El Toro Loco",
    cuisine: "Spanish",
    location: "Chelsea",
    rating: 4.5,
    priceRange: "$$",
    status: "inactive",
    image: "/images/Login.jpg",
  },
  {
    id: "5",
    name: "Dragon Palace",
    cuisine: "Chinese",
    location: "Chinatown",
    rating: 4.4,
    priceRange: "$",
    status: "active",
    image: "/images/Register.jpg",
  },
  {
    id: "6",
    name: "Le Petit Bistro",
    cuisine: "French",
    location: "West Village",
    rating: 4.7,
    priceRange: "$$$",
    status: "pending",
    image: "/images/Login.jpg",
  },
];

type IconName = "grid" | "users" | "store" | "calendar" | "star" | "profile" | "search" | "bell" | "chevron" | "arrow" | "plus" | "edit" | "trash";

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
      {name === "plus" && (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      )}
      {name === "edit" && (
        <>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </>
      )}
      {name === "trash" && (
        <>
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </>
      )}
    </svg>
  );
}

const navItems: { label: string; icon: IconName; active?: boolean; href: string }[] = [
  { label: "Dashboard", icon: "grid", href: "/admin" },
  { label: "Users", icon: "users", href: "/admin/users" },
  { label: "Bookings", icon: "calendar", href: "/admin/booking" },
  { label: "Restaurants", icon: "store", active: true, href: "/admin/restaurant" },
  { label: "Favorites", icon: "star", href: "/admin/favourite" },
  { label: "Profile", icon: "profile", href: "/admin/profile" },
];

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "pending">("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || restaurant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (restaurantId: string, newStatus: Restaurant["status"]) => {
    setRestaurants(restaurants.map((restaurant) =>
      restaurant.id === restaurantId ? { ...restaurant, status: newStatus } : restaurant
    ));
  };

  const handleDelete = (restaurantId: string) => {
    if (confirm("Are you sure you want to delete this restaurant?")) {
      setRestaurants(restaurants.filter((restaurant) => restaurant.id !== restaurantId));
    }
  };

  const getStatusBadge = (status: Restaurant["status"]) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700",
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
              placeholder="Search restaurants..."
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurants Management</h1>
              <p className="text-gray-600">View and manage all restaurant listings</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Icon name="plus" size={20} />
              Add Restaurant
            </button>
          </div>

          <div className="mb-6 flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cuisine</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No restaurants found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredRestaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
                            <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                              {restaurant.name.charAt(0)}
                            </div>
                          </div>
                          <div className="font-medium text-gray-900">{restaurant.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{restaurant.cuisine}</td>
                      <td className="px-6 py-4 text-gray-900">{restaurant.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-gray-900">{restaurant.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{restaurant.priceRange}</td>
                      <td className="px-6 py-4">{getStatusBadge(restaurant.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <select
                            value={restaurant.status}
                            onChange={(e) => handleStatusChange(restaurant.id, e.target.value as any)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                          </select>
                          <button
                            onClick={() => setSelectedRestaurant(restaurant)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(restaurant.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            <Icon name="trash" size={16} />
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
              Showing {filteredRestaurants.length} of {restaurants.length} restaurants
            </p>
          </div>
        </section>
      </main>

      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Restaurant Details</h2>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="w-full h-40 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-4xl">
                {selectedRestaurant.name.charAt(0)}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Name</label>
                <p className="text-gray-900">{selectedRestaurant.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Cuisine</label>
                  <p className="text-gray-900">{selectedRestaurant.cuisine}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Location</label>
                  <p className="text-gray-900">{selectedRestaurant.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Rating</label>
                  <p className="text-gray-900">★ {selectedRestaurant.rating}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Price Range</label>
                  <p className="text-gray-900">{selectedRestaurant.priceRange}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <div className="mt-1">{getStatusBadge(selectedRestaurant.status)}</div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Restaurant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
