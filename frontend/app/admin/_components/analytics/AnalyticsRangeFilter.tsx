import type { AnalyticsRange } from "@/lib/api/admin/dashboard";
import styles from "../../admin.module.css";

const options: { value: AnalyticsRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "6m", label: "Last 6 months" },
];

export default function AnalyticsRangeFilter({
  value,
  onChange,
}: {
  value: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
}) {
  return (
    <label className={styles.analyticsRange}>
      <span>Analytics range</span>
      <select value={value} onChange={(event) => onChange(event.target.value as AnalyticsRange)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
