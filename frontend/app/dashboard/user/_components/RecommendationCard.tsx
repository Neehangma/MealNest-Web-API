"use client";

import Link from "next/link";
import type { RestaurantItem } from "@/lib/api/dashboard";
import Icon from "./Icon";

const FALLBACK_IMAGE = "/images/Register.jpg";

export default function RecommendationCard({
  restaurant,
  isFavorite,
  onToggleFavorite,
}: {
  restaurant: RestaurantItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <article className="dash-recommend-card dash-fade-in">
      <Link href={`/restaurants/${restaurant._id}`} className="dash-recommend-media">
        <img src={restaurant.image || FALLBACK_IMAGE} alt={restaurant.name} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
      </Link>
      <button
        type="button"
        className={`dash-favorite-heart ${isFavorite ? "is-active" : ""}`}
        aria-label={isFavorite ? `Remove ${restaurant.name} from favorites` : `Add ${restaurant.name} to favorites`}
        aria-pressed={isFavorite}
        onClick={() => onToggleFavorite(restaurant._id)}
      >
        <Icon name={isFavorite ? "heart-filled" : "heart"} size={18} />
      </button>

      <div className="dash-recommend-body">
        <div className="dash-favorite-title">
          <Link href={`/restaurants/${restaurant._id}`}>
            <h3>{restaurant.name}</h3>
          </Link>
          <span className="dash-rating">
            <Icon name="star" size={14} />
            {restaurant.rating}
          </span>
        </div>
        <p className="dash-favorite-cuisine">{restaurant.cuisine}</p>
        <p className="dash-favorite-location">
          <Icon name="map-pin" size={14} />
          {restaurant.location}
        </p>

        <div className="dash-recommend-info">
          <span className="dash-price">{restaurant.priceRange || "$$"}</span>
          <span className={`dash-open-pill ${restaurant.isOpen ? "is-open" : "is-closed"}`}>
            {restaurant.isOpen ? "Open Now" : "Closed"}
          </span>
        </div>

        {restaurant.hours && (
          <p className="dash-recommend-hours">
            <Icon name="clock" size={14} />
            {restaurant.hours}
          </p>
        )}

        <Link href={`/restaurants/${restaurant._id}`} className="dash-btn dash-btn-primary dash-btn-block">
          Reserve Now
        </Link>
      </div>
    </article>
  );
}
