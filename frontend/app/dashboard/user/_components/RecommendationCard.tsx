"use client";

import Link from "next/link";
import type { RestaurantItem } from "@/lib/api/dashboard";
import Icon from "./Icon";
import { getStableRestaurantPrice } from "@/lib/restaurant-price";
import { getRestaurantImage, RESTAURANT_FALLBACK_IMAGE } from "@/lib/restaurant-image";


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
      <Link href={`/dashboard/user/restaurants/${restaurant._id}`} className="dash-recommend-media">
        <img src={getRestaurantImage(restaurant.image)} alt={restaurant.name} onError={(event) => { event.currentTarget.src = RESTAURANT_FALLBACK_IMAGE; }} />
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
          <Link href={`/dashboard/user/restaurants/${restaurant._id}`}>
            <h3>{restaurant.name}</h3>
          </Link>
        </div>
        <p className="dash-favorite-cuisine">{restaurant.cuisine}</p>
        <p className="dash-favorite-location">
          <Icon name="map-pin" size={14} />
          {restaurant.location}
        </p>

        {restaurant.description && <p className="dash-restaurant-description">{restaurant.description}</p>}

        <div className="dash-recommend-info">
          <span className={`dash-open-pill ${restaurant.isOpen ? "is-open" : "is-closed"}`}>
            {restaurant.isOpen ? "Open Now" : "Closed"}
          </span>
          <span className="dash-price">Rs. {getStableRestaurantPrice(restaurant)}</span>
        </div>

        {restaurant.hours && (
          <p className="dash-recommend-hours">
            <Icon name="clock" size={14} />
            {restaurant.hours}
          </p>
        )}

        <Link href={`/dashboard/user/restaurants/${restaurant._id}`} className="dash-btn dash-btn-primary dash-btn-block">
          View Details
        </Link>
      </div>
    </article>
  );
}
