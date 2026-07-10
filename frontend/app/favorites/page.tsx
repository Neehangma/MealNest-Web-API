"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getDashboardData,
  toggleFavorite,
  type FavoriteRestaurant,
} from "@/lib/api/dashboard";
import type { AuthUser } from "@/lib/api/auth";
import { getUserData } from "@/lib/cookies";

export default function FavoritesPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserData().then(setUser);
    getDashboardData()
      .then((response) => setFavorites(response.data.favorites))
      .catch(() => setError("We could not load your favorites right now."))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemoveFavorite(id: string) {
    if (!window.confirm("Remove this restaurant from your favorites?")) return;

    try {
      setError("");
      const result = await toggleFavorite(id);
      setFavorites(result.data.favorites);
    } catch {
      setError("Unable to update favorites right now.");
    }
  }

  return (
    <main className="favorites-page">
      <nav className="favorites-nav">
        <Link href="/dashboard/user" className="favorites-brand">
          <Image src="/images/Logo.png" alt="MealNest" width={40} height={40} />
          <span>MealNest</span>
        </Link>
        <div className="nav-user">
          <span>{user?.fullName || "User"}</span>
        </div>
      </nav>

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
                    src={restaurant.image}
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
                    <span className="price-range">{restaurant.priceRange}</span>
                    <Link href={`/restaurants/${restaurant._id}`} className="book-link">
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
