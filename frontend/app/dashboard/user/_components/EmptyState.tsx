import Link from "next/link";
import Icon, { type IconName } from "./Icon";

export default function EmptyState({
  icon = "utensils",
  title,
  message,
  actionLabel,
  actionHref,
}: {
  icon?: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="dash-empty-state dash-fade-in">
      <div className="dash-empty-illustration" aria-hidden>
        <span className="dash-empty-ring" />
        <Icon name={icon} size={38} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="dash-btn dash-btn-primary">
          <Icon name="plus" size={16} />
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
