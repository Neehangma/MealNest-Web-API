"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CuisinePoint } from "@/lib/api/admin/dashboard";
import styles from "../../admin.module.css";

const palette = ["#d94a0b", "#e89a43", "#365b7d", "#65966b", "#9a6f57", "#c26f74", "#7a6fa8"];

export default function CuisineDistributionChart({ data }: { data: CuisinePoint[] }) {
  return (
    <article className={styles.analyticsCard}>
      <header><h3>Restaurants by Cuisine</h3><p>Current restaurant distribution</p></header>
      {data.length === 0 ? <div className={styles.analyticsEmpty}>No cuisine data yet.</div> : (
        <>
          <div className={styles.donutCanvas} role="img" aria-label="Doughnut chart showing restaurants grouped by cuisine">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="count" nameKey="cuisine" innerRadius={50} outerRadius={76} paddingAngle={2}>
                  {data.map((point, index) => <Cell key={point.cuisine} fill={palette[index % palette.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => [Number(value), "Restaurants"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className={`${styles.analyticsLegend} ${styles.cuisineLegend}`}>
            {data.map((point, index) => <li key={point.cuisine}><i style={{ background: palette[index % palette.length] }} /><span>{point.cuisine}</span><strong>{point.count}</strong></li>)}
          </ul>
        </>
      )}
    </article>
  );
}
