import Link from "next/link";
import Icon, { type IconName } from "./Icon";

type QuickAction = {
  label: string;
  description: string;
  href: string;
  icon: IconName;
  tone: string;
};

const ACTIONS: QuickAction[] = [
  {
    label: "Book a Table",
    description: "Find and reserve your next spot",
    href: "/dashboard/user#recommended",
    icon: "calendar",
    tone: "amber",
  },
  {
    label: "Browse Restaurants",
    description: "Explore places near you",
    href: "/dashboard/user#recommended",
    icon: "compass",
    tone: "green",
  },
  {
    label: "Update Profile",
    description: "Manage your account details",
    href: "/profile",
    icon: "user",
    tone: "violet",
  },
  {
    label: "Reservation History",
    description: "Review your past dining",
    href: "/dashboard/user#recent-history",
    icon: "clock",
    tone: "rose",
  },
];

export default function QuickActions() {
  return (
    <div className="dash-quick-actions">
      {ACTIONS.map((action) => (
        <Link key={action.label} href={action.href} className={`dash-quick-card tone-${action.tone}`}>
          <span className="dash-quick-icon">
            <Icon name={action.icon} size={20} />
          </span>
          <span className="dash-quick-text">
            <strong>{action.label}</strong>
            <small>{action.description}</small>
          </span>
          <Icon name="chevron" size={18} />
        </Link>
      ))}
    </div>
  );
}
