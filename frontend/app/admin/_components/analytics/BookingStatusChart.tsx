"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { BookingStatusPoint } from "@/lib/api/admin/dashboard";
import styles from "../../admin.module.css";

const colors: Record<BookingStatusPoint["status"], string> = {
  pending: "#e6a23c",
  confirmed: "#d94a0b",
  completed: "#34945f",
  cancelled: "#8b7569",
};

export default function BookingStatusChart({ data }: { data: BookingStatusPoint[] }) {
  const visible = data.filter((point) => point.count > 0);
  return (
    <article className={`${styles.analyticsCard} ${styles.bookingStatusCard}`}>
      <header><h3>Booking Status</h3><p>All reservation statuses</p></header>
      {visible.length === 0 ? <div className={styles.analyticsEmpty}>No booking statuses yet.</div> : (
        <>
          <div className={styles.donutCanvas} role="img" aria-label="Doughnut chart showing booking totals by status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={visible} dataKey="count" nameKey="status" innerRadius={52} outerRadius={78} paddingAngle={2}>
                  {visible.map((point) => <Cell key={point.status} fill={colors[point.status]} />)}
                </Pie>
                <Tooltip formatter={(value) => [Number(value), "Bookings"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className={styles.analyticsLegend}>
            {data.map((point) => <li key={point.status}><i style={{ background: colors[point.status] }} /><span>{point.status}</span><strong>{point.count}</strong></li>)}
          </ul>
        </>
      )}
    </article>
  );
}
