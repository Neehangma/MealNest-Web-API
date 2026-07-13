"use client";

import Link from "next/link";
import type { ReservationItem } from "@/lib/api/dashboard";
import Icon from "./Icon";
import { formatDisplayDate, statusLabelOf, statusToneOf } from "./helpers";

const FALLBACK_IMAGE = "/images/Register.jpg";

export type EditForm = {
  date: string;
  time: string;
  guests: string;
  specialRequests: string;
};

export default function ReservationCard({
  reservation,
  isEditing,
  editForm,
  onEditFormChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onCancelReservation,
}: {
  reservation: ReservationItem;
  isEditing: boolean;
  editForm: EditForm;
  onEditFormChange: (patch: Partial<EditForm>) => void;
  onStartEdit: (reservation: ReservationItem) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onCancelReservation: (id: string) => void;
}) {
  const tone = statusToneOf(reservation.status);
  const displayDate = reservation.date || formatDisplayDate(reservation.reservationDate);

  return (
    <article className="dash-reservation-card dash-fade-in">
      <div className="dash-reservation-media">
        <img src={reservation.image || FALLBACK_IMAGE} alt={reservation.restaurantName} />
      </div>

      <div className="dash-reservation-info">
        <div className="dash-reservation-heading">
          <div>
            <h3>{reservation.restaurantName}</h3>
            <p className="dash-reservation-cuisine">{reservation.cuisine || "Restaurant"}</p>
          </div>
          <span className={`dash-status-badge tone-${tone}`}>{statusLabelOf(reservation.status)}</span>
        </div>

        {isEditing ? (
          <div className="dash-reservation-edit">
            <label>
              <span>Date</span>
              <input
                type="date"
                value={editForm.date}
                onChange={(event) => onEditFormChange({ date: event.target.value })}
              />
            </label>
            <label>
              <span>Time</span>
              <input
                type="time"
                value={editForm.time}
                onChange={(event) => onEditFormChange({ time: event.target.value })}
              />
            </label>
            <label>
              <span>Guests</span>
              <select
                value={editForm.guests}
                onChange={(event) => onEditFormChange({ guests: event.target.value })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                  <option key={count} value={count}>
                    {count} {count === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </label>
            <div className="dash-reservation-actions">
              <button type="button" className="dash-btn dash-btn-primary" onClick={() => onSaveEdit(reservation._id)}>
                Save Changes
              </button>
              <button type="button" className="dash-btn dash-btn-ghost" onClick={onCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="dash-reservation-meta">
              <span>
                <Icon name="calendar" size={16} />
                {displayDate}
              </span>
              <span>
                <Icon name="clock" size={16} />
                {reservation.time}
              </span>
              <span>
                <Icon name="users" size={16} />
                {reservation.guests} {reservation.guests === 1 ? "Guest" : "Guests"}
              </span>
            </div>

            <div className="dash-reservation-actions">
              <Link
                href={`/dashboard/user/restaurants/${reservation.restaurantId || reservation._id}`}
                className="dash-btn dash-btn-outline"
              >
                View Details
              </Link>
              {tone !== "cancelled" && (
                <>
                  <button
                    type="button"
                    className="dash-btn dash-btn-ghost"
                    onClick={() => onStartEdit(reservation)}
                  >
                    <Icon name="edit" size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn-danger"
                    onClick={() => onCancelReservation(reservation._id)}
                  >
                    <Icon name="x" size={16} />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
