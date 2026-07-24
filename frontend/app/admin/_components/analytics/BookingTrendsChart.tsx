"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalyticsPoint } from "@/lib/api/admin/dashboard";
import styles from "../../admin.module.css";

export default function BookingTrendsChart({ data }: { data: AnalyticsPoint[] }) {
  const empty = data.every((point) => point.count === 0);
  return (
    <article className={`${styles.analyticsCard} ${styles.bookingTrendsCard}`}>
      <header><h3>Booking Trends</h3><p>Reservations created over time</p></header>
      {empty ? <div className={styles.analyticsEmpty}>No bookings in this period.</div> : (
        <div className={styles.chartCanvas} role="img" aria-label="Line chart showing booking trends">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#efe3db" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6f625a", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={20} />
              <YAxis allowDecimals={false} tick={{ fill: "#6f625a", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [Number(value), "Bookings"]} contentStyle={{ border: "1px solid #ead8ca", borderRadius: 8 }} />
              <Line type="monotone" dataKey="count" stroke="#d94a0b" strokeWidth={3} dot={{ r: 3, fill: "#d94a0b" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}
