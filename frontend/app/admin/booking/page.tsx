"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import styles from "../admin.module.css";
import {
  completeAdminBookingAction,
  getAdminRestaurantBookingsAction,
  getGroupedAdminBookingsAction,
} from "@/lib/actions/admin/booking-action";
import type {
  AdminBooking,
  GroupedAdminBooking,
  GroupedBookingsResponse,
} from "@/lib/api/admin/booking";
import { getRestaurantImage } from "@/lib/restaurant-image";
import RestaurantBookingsModal from "../_components/RestaurantBookingsModal";

type StatusFilter = "all" | AdminBooking["status"];
type SortOption = "highest" | "lowest" | "newest" | "oldest";

const emptySummary: GroupedBookingsResponse["summary"] = {
  totalRestaurants: 0,
  totalBookings: 0,
  pending: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0,
  usersBooked: 0,
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminBookingsPage() {
  const [groups, setGroups] = useState<GroupedAdminBooking[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [summary, setSummary] = useState(emptySummary);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cuisine, setCuisine] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [selectedGroup, setSelectedGroup] = useState<GroupedAdminBooking | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<AdminBooking[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingId, setCompletingId] = useState("");

  const loadGroups = useCallback(async () => {
    try {
      const response = await getGroupedAdminBookingsAction({
        page,
        limit: meta.limit,
        search: debouncedSearch || undefined,
        cuisine: cuisine === "all" ? undefined : cuisine,
        status: status === "all" ? undefined : status,
        sort,
      });
      setError("");
      setGroups(response.data);
      setMeta(response.meta);
      setSummary(response.summary);
      setCuisines(response.cuisines);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load grouped bookings");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [page, meta.limit, debouncedSearch, cuisine, status, sort]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    getGroupedAdminBookingsAction({
      page,
      limit: meta.limit,
      search: debouncedSearch || undefined,
      cuisine: cuisine === "all" ? undefined : cuisine,
      status: status === "all" ? undefined : status,
      sort,
    }).then((response) => {
      if (!active) return;
      setError("");
      setGroups(response.data);
      setMeta(response.meta);
      setSummary(response.summary);
      setCuisines(response.cuisines);
    }).catch((reason) => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : "Unable to load grouped bookings");
      setGroups([]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [page, meta.limit, debouncedSearch, cuisine, status, sort]);

  async function openRestaurantBookings(group: GroupedAdminBooking) {
    setSelectedGroup(group);
    setSelectedBookings([]);
    setDetailsError("");
    setDetailsLoading(true);
    try {
      const response = await getAdminRestaurantBookingsAction(group.restaurantId);
      setSelectedBookings(response.bookings);
    } catch (reason) {
      setDetailsError(reason instanceof Error ? reason.message : "Unable to load restaurant bookings");
    } finally {
      setDetailsLoading(false);
    }
  }

  async function markCompleted(booking: AdminBooking) {
    try {
      setCompletingId(booking._id);
      setDetailsError("");
      const response = await completeAdminBookingAction(booking._id);
      setSelectedBookings((current) =>
        current.map((item) => item._id === booking._id ? { ...item, ...response.data } : item)
      );
      await loadGroups();
      setSelectedGroup((current) => current ? {
        ...current,
        statusCounts: {
          ...current.statusCounts,
          confirmed: Math.max(0, current.statusCounts.confirmed - 1),
          completed: current.statusCounts.completed + 1,
        },
      } : current);
    } catch (reason) {
      setDetailsError(reason instanceof Error ? reason.message : "Unable to complete this booking.");
    } finally {
      setCompletingId("");
    }
  }

  return (
    <div className={styles.adminRoot}>
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.search}>
            <span aria-hidden>⌕</span>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search by restaurant name..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </header>

        <section className={styles.content}>
          <div className={styles.pageHeading}>
            <div>
              <p className={styles.eyebrow}>Reservation directory</p>
              <h1>Bookings Management</h1>
              <p className={styles.subtitle}>Bookings grouped by their unique MealNest restaurant.</p>
            </div>
          </div>

          <div className={styles.statsGrid}>
            {[
              ["Total Bookings", summary.totalBookings],
              ["Confirmed", summary.confirmed],
              ["Cancelled", summary.cancelled],
              ["Users Booked", summary.usersBooked],
            ].map(([label, value]) => (
              <article key={label} className={`${styles.card} ${styles.statCard}`}>
                <div><p className={styles.statLabel}>{label}</p><p className={styles.statValue}>{value}</p></div>
              </article>
            ))}
          </div>

          <section className={`${styles.card} ${styles.panel}`}>
            <div className={styles.groupedBookingFilters}>
              <select aria-label="Filter by cuisine" value={cuisine} onChange={(event) => { setCuisine(event.target.value); setPage(1); }}>
                <option value="all">All cuisines</option>
                {cuisines.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select aria-label="Filter by booking status" value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); setPage(1); }}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select aria-label="Sort grouped bookings" value={sort} onChange={(event) => { setSort(event.target.value as SortOption); setPage(1); }}>
                <option value="newest">Newest booking</option>
                <option value="oldest">Oldest booking</option>
                <option value="highest">Highest booking count</option>
                <option value="lowest">Lowest booking count</option>
              </select>
            </div>

            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Restaurant Bookings</h2>
                <p className={styles.tableMeta}>Showing {groups.length} of {meta.total} restaurants</p>
              </div>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}
            <div className={styles.tableWrap}>
              <table className={styles.usersTable}>
                <thead>
                  <tr>
                    <th>Restaurant</th><th>Total Bookings</th><th>Pending</th><th>Confirmed</th>
                    <th>Completed</th><th>Cancelled</th><th>Latest Booking</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8}><div className={styles.emptyState}>Loading restaurant bookings...</div></td></tr>
                  ) : error ? (
                    <tr><td colSpan={8}><div className={styles.emptyState}>Bookings could not be loaded.</div></td></tr>
                  ) : groups.length === 0 ? (
                    <tr><td colSpan={8}><div className={styles.emptyState}>No grouped bookings found.</div></td></tr>
                  ) : groups.map((group) => (
                    <tr key={group.restaurantId}>
                      <td>
                        <div className={styles.bookingRestaurantCell}>
                          <Image unoptimized src={getRestaurantImage(group.restaurantImage)} alt={group.restaurantName} width={58} height={44} className={styles.restaurantThumbnail} />
                          <div><strong>{group.restaurantName}</strong><small>{group.cuisine || "Cuisine unavailable"}</small></div>
                        </div>
                      </td>
                      <td><strong>{group.totalBookings} {group.totalBookings === 1 ? "booking" : "bookings"}</strong></td>
                      <td>{group.statusCounts.pending}</td>
                      <td>{group.statusCounts.confirmed}</td>
                      <td>{group.statusCounts.completed}</td>
                      <td>{group.statusCounts.cancelled}</td>
                      <td>{formatDate(group.latestBookingDate)}</td>
                      <td>
                        <button type="button" className={styles.compactViewBookingsButton} onClick={() => void openRestaurantBookings(group)}>
                          View Bookings
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <button className={styles.pageButton} type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
              <span>Page {meta.page || 1} of {meta.totalPages || 1}</span>
              <button className={styles.pageButton} type="button" disabled={loading || meta.totalPages === 0 || page >= meta.totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
            </div>
          </section>
        </section>
      </main>

      <RestaurantBookingsModal
        group={selectedGroup}
        bookings={selectedBookings}
        loading={detailsLoading}
        error={detailsError}
        completingId={completingId}
        onClose={() => setSelectedGroup(null)}
        onComplete={markCompleted}
      />
    </div>
  );
}
