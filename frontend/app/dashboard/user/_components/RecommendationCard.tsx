"use client";

import Link from "next/link";
import type { RestaurantItem } from "@/lib/api/dashboard";
import Icon from "./Icon";
import { getStableRestaurantPrice } from "@/lib/restaurant-price";

const FALLBACK_IMAGE = "/images/Register.jpg";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

const getImageUrl = (image?: string) => {
  if (!image) return FALLBACK_IMAGE;
  if (image.startsWith("http") || image.startsWith("data:")) return image;
  if (image.startsWith("/images/")) return image;
  return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

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
        <img src={getImageUrl(restaurant.image)} alt={restaurant.name} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
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
