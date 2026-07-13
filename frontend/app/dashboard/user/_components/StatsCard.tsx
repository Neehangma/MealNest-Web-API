import Icon, { type IconName } from "./Icon";

export type StatTone = "amber" | "rose" | "green" | "violet";

export default function StatsCard({
  icon,
  value,
  label,
  description,
  tone,
  loading,
  delay = 0,
}: {
  icon: IconName;
  value: string | number;
  label: string;
  description: string;
  tone: StatTone;
  loading?: boolean;
  delay?: number;
}) {
  return (
    <article
      className={`dash-stat-card tone-${tone} dash-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="dash-stat-icon">
        <Icon name={icon} size={22} />
      </div>
      <div className="dash-stat-body">
        {loading ? (
          <span className="dash-skeleton dash-skeleton-value" aria-hidden />
        ) : (
          <strong className="dash-stat-value">{value}</strong>
        )}
        <span className="dash-stat-label">{label}</span>
        <span className="dash-stat-desc">{description}</span>
      </div>
    </article>
  );
}
