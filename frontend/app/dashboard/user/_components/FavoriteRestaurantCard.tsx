"use client";

import Link from "next/link";
import type { FavoriteRestaurant } from "@/lib/api/dashboard";
import Icon from "./Icon";

const FALLBACK_IMAGE = "/images/Register.jpg";

export default function FavoriteRestaurantCard({
  favorite,
  onRemove,
}: {
  favorite: FavoriteRestaurant;
  onRemove: (id: string) => void;
}) {
  return (
    <article className="dash-favorite-card dash-fade-in">
      <Link href={`/restaurants/${favorite._id}`} className="dash-favorite-media">
        <img src={favorite.image || FALLBACK_IMAGE} alt={favorite.name} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
        <span className={`dash-open-badge ${favorite.isOpen ? "is-open" : "is-closed"}`}>
          {favorite.isOpen ? "Open Now" : "Closed"}
        </span>
      </Link>
      <button
        type="button"
        className="dash-favorite-heart"
        aria-label={`Remove ${favorite.name} from favorites`}
        onClick={() => onRemove(favorite._id)}
      >
        <Icon name="heart-filled" size={18} />
      </button>

      <div className="dash-favorite-body">
        <div className="dash-favorite-title">
          <Link href={`/restaurants/${favorite._id}`}>
            <h3>{favorite.name}</h3>
          </Link>
          <span className="dash-rating">
            <Icon name="star" size={14} />
            {favorite.rating}
          </span>
        </div>
        <p className="dash-favorite-cuisine">{favorite.cuisine}</p>
        <p className="dash-favorite-location">
          <Icon name="map-pin" size={14} />
          {favorite.location || "Neighborhood favorite"}
        </p>
        <div className="dash-favorite-footer">
          <Link href={`/restaurants/${favorite._id}`} className="dash-btn dash-btn-outline dash-btn-sm">
            Book Table
            <Icon name="arrow-right" size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
