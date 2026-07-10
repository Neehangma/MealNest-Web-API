"use client";

import Link from "next/link";
import type { ReservationItem } from "@/lib/api/dashboard";
import Icon from "./Icon";
import { formatDisplayDate, statusLabelOf, statusToneOf } from "./helpers";

const FALLBACK_IMAGE = "/images/Register.jpg";

export default function ReservationHistory({ items }: { items: ReservationItem[] }) {
  return (
    <div className="dash-history-list">
      {items.map((item) => {
        const tone = statusToneOf(item.status);
        return (
          <article className="dash-history-row dash-fade-in" key={item._id}>
            <div className="dash-history-media">
              <img src={item.image || FALLBACK_IMAGE} alt={item.restaurantName} />
            </div>
            <div className="dash-history-info">
              <div className="dash-history-top">
                <h4>{item.restaurantName}</h4>
                <span className={`dash-status-dot tone-${tone}`}>{statusLabelOf(item.status)}</span>
              </div>
              <div className="dash-history-meta">
                <span>
                  <Icon name="calendar" size={14} />
                  {item.date || formatDisplayDate(item.reservationDate)}
                </span>
                <span>
                  <Icon name="users" size={14} />
                  {item.guests} {item.guests === 1 ? "Guest" : "Guests"}
                </span>
              </div>
            </div>
            <Link
              href={`/restaurants/${item.restaurantId || item._id}`}
              className="dash-btn dash-btn-outline dash-btn-sm"
            >
              View Details
            </Link>
          </article>
        );
      })}
    </div>
  );
}
