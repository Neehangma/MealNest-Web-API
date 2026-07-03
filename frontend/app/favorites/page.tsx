"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getUserData } from "@/lib/cookies";
import { useEffect } from "react";

interface FavoriteRestaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  priceRange: string;
  image: string;
  isOpen: boolean;
}

const mockFavorites: FavoriteRestaurant[] = [
  {
    id: "1",
    name: "The Golden Truffle",
    cuisine: "French",
    location: "Upper East Side",
    rating: 4.8,
    priceRange: "$$$",
    image: "/images/Register.jpg",
    isOpen: true,
  },
  {
    id: "2",
    name: "Sakura Omakase",
    cuisine: "Japanese",
    location: "Tribeca",
    rating: 4.9,
    priceRange: "$$$$",
    image: "/images/Login.jpg",
    isOpen: true,
  },
  {
    id: "3",
    name: "La Bella Italia",
    cuisine: "Italian",
    location: "SoHo",
    rating: 4.6,
    priceRange: "$$",
    image: "/images/Register.jpg",
    isOpen: true,
  },
];

export default function FavoritesPage() {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>(mockFavorites);

  useEffect(() => {
    getUserData().then(setUser);
  }, []);

  const handleRemoveFavorite = (id: string) => {
    if (confirm("Remove this restaurant from your favorites?")) {
      setFavorites(favorites.filter((fav) => fav.id !== id));
    }
  };

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

        {favorites.length === 0 ? (
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
              <div key={restaurant.id} className="favorite-card">
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
                    className="remove-favorite"
                    onClick={() => handleRemoveFavorite(restaurant.id)}
                    aria-label="Remove from favorites"
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
                    <Link href={`/restaurants/${restaurant.id}`} className="book-link">
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
