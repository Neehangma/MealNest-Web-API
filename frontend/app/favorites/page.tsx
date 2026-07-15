"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FavoriteRestaurant } from "@/lib/api/dashboard";
import { getFavoritesAction, toggleFavoriteAction } from "@/lib/actions/dashboard-action";
import { getStableRestaurantPrice } from "@/lib/restaurant-price";
import { getRestaurantImage } from "@/lib/restaurant-image";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getFavoritesAction()
      .then(setFavorites)
      .catch(() => setError("We could not load your favorites right now."))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemoveFavorite(id: string) {
    if (!window.confirm("Remove this restaurant from your favorites?")) return;

    try {
      setError("");
      setFavorites(await toggleFavoriteAction(id));
    } catch {
      setError("Unable to update favorites right now.");
    }
  }

  return (
    <main className="favorites-page">
      <div className="favorites-container">
        <div className="favorites-header">
          <div>
            <h1>My Favorites</h1>
            <p>Your saved restaurants for quick access</p>
          </div>
          <Link href="/" className="browse-button">
            Browse Restaurants
          </Link>
        </div>

        {error && <p className="profile-action-message error">{error}</p>}

        {loading ? (
          <p>Loading favorites...</p>
        ) : favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">♡</div>
            <h2>No favorites yet</h2>
            <p>Start saving restaurants you love by clicking the heart icon on any restaurant page.</p>
            <Link href="/" className="explore-button">
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((restaurant) => (
              <div key={restaurant._id} className="favorite-card">
                <div className="favorite-image">
                  <Image
                    src={getRestaurantImage(restaurant.image)}
                    alt={restaurant.name}
                    fill
                    className="favorite-img"
                  />
                  <div className={`status-badge ${restaurant.isOpen ? "open" : "closed"}`}>
                    {restaurant.isOpen ? "Open Now" : "Closed"}
                  </div>
                  <button
                    type="button"
                    className="remove-favorite"
                    onClick={() => void handleRemoveFavorite(restaurant._id)}
                    aria-label={`Remove ${restaurant.name} from favorites`}
                  >
                    ✕
                  </button>
                </div>
                <div className="favorite-content">
                  <div className="favorite-header">
                    <h3>{restaurant.name}</h3>
                    <div className="rating">★ {restaurant.rating}</div>
                  </div>
                  <p className="cuisine">{restaurant.cuisine}</p>
                  <p className="location">{restaurant.location}</p>
                  <div className="favorite-footer">
                    <span className="price-range">Rs. {getStableRestaurantPrice(restaurant)}</span>
                    <Link href={`/dashboard/user/restaurants/${restaurant._id}`} className="book-link">
                      Book Table →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
