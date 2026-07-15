import Link from "next/link";
import { getAdminDashboardStatsAction } from "@/lib/actions/admin/dashboard-action";
import type { AdminActivity } from "@/lib/api/admin/dashboard";
import styles from "./admin.module.css";

type IconName = "grid" | "users" | "store" | "calendar" | "settings" | "arrow";

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
    "aria-hidden": true,
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
      {name === "settings" && (
        <>
          <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.4 7A2 2 0 1 1 7.2 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 20 7.2l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z" />
        </>
      )}
      {name === "arrow" && (
        <>
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </>
      )}
    </svg>
  );
}

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return new Date(value).toLocaleDateString();
}

export default async function AdminDashboardPage() {
  let dashboard: Awaited<ReturnType<typeof getAdminDashboardStatsAction>> | null = null;
  let loadError = false;
  try { dashboard = await getAdminDashboardStatsAction(); } catch { loadError = true; }
  const stats = [
    { label: "Total Users", value: dashboard?.stats.totalUsers ?? "—", trend: "Accounts stored in MongoDB", icon: "users" as const, tone: styles.orange },
    { label: "Restaurants", value: dashboard?.stats.totalRestaurants ?? "—", trend: "Restaurants stored in MongoDB", icon: "store" as const, tone: styles.blue },
    { label: "Bookings", value: dashboard?.stats.totalBookings ?? "—", trend: "Total reservations created", icon: "calendar" as const, tone: styles.green },
  ];
  const activities = dashboard?.activities || [];

  return (
    <div className={styles.adminRoot}>
      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.heroRow}>
            <div>
              <h2 className={styles.title}>System Overview</h2>
              <p className={styles.subtitle}>Admin-only tools for users, restaurants, and bookings.</p>
            </div>
            <Link className={styles.dateButton} href="/admin/users">
              <Icon name="arrow" size={18} />
              Manage Users
            </Link>
          </div>

          {loadError && <div className={styles.errorBanner}>Unable to load dashboard statistics.</div>}

          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <article className={`${styles.card} ${styles.statCard}`} key={stat.label}>
                <div className={`${styles.statIcon} ${stat.tone}`}>
                  <Icon name={stat.icon} size={35} />
                </div>
                <div>
                  <p className={styles.statLabel}>{stat.label}</p>
                  <p className={styles.statValue}>{stat.value}</p>
                  <p className={styles.trend}>{stat.trend}</p>
                </div>
              </article>
            ))}
          </div>

          <section className={`${styles.card} ${styles.panel}`}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Recent Admin Activity</h2>
                <p className={styles.tableMeta}>Operational events across MealNest.</p>
              </div>
            </div>
            <div className={styles.activityGrid}>
              {activities.length === 0 ? <div className={styles.emptyState}>{loadError ? "Recent activity is unavailable." : "No recent activity yet."}</div> : activities.map((activity: AdminActivity, index) => (
                <article className={styles.activityItem} key={`${activity.type}-${activity.createdAt}-${index}`}>
                  <div className={`${styles.activityIcon} ${styles.orange}`}>
                    <Icon name={activity.type === "user" ? "users" : activity.type === "restaurant" ? "store" : "calendar"} size={22} />
                  </div>
                  <div>
                    <p className={styles.activityTitle}>{activity.title}</p>
                    <p className={styles.activityText}>{activity.text}</p>
                    <p className={styles.activityTime}>{relativeTime(activity.createdAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
