"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AnalyticsPoint } from "@/lib/api/admin/dashboard";
import styles from "../../admin.module.css";

export default function UserGrowthChart({ data }: { data: AnalyticsPoint[] }) {
  const empty = data.every((point) => point.count === 0);
  return (
    <article className={styles.analyticsCard}>
      <header><h3>User Growth</h3><p>New customer registrations</p></header>
      {empty ? <div className={styles.analyticsEmpty}>No new users in this period.</div> : (
        <div className={styles.smallChartCanvas} role="img" aria-label="Area chart showing new user registrations">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
              <defs><linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#365b7d" stopOpacity={0.35}/><stop offset="100%" stopColor="#365b7d" stopOpacity={0.03}/></linearGradient></defs>
              <CartesianGrid stroke="#efe3db" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6f625a", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis allowDecimals={false} tick={{ fill: "#6f625a", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [Number(value), "New users"]} />
              <Area type="monotone" dataKey="count" stroke="#365b7d" strokeWidth={2.5} fill="url(#userGrowthFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}
