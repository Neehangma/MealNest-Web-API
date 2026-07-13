"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  priceRange: string;
  image: string;
  isOpen: boolean;
}

const mockRestaurants: Restaurant[] = [
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
  {
    id: "4",
    name: "El Toro Loco",
    cuisine: "Spanish",
    location: "Chelsea",
    rating: 4.5,
    priceRange: "$$",
    image: "/images/Login.jpg",
    isOpen: false,
  },
  {
    id: "5",
    name: "Dragon Palace",
    cuisine: "Chinese",
    location: "Chinatown",
    rating: 4.4,
    priceRange: "$",
    image: "/images/Register.jpg",
    isOpen: true,
  },
  {
    id: "6",
    name: "Le Petit Bistro",
    cuisine: "French",
    location: "West Village",
    rating: 4.7,
    priceRange: "$$$",
    image: "/images/Login.jpg",
    isOpen: true,
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [filteredRestaurants, setFilteredRestaurants] = useState(mockRestaurants);

  const cuisines = ["All", "French", "Japanese", "Italian", "Spanish", "Chinese"];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterRestaurants(query, selectedCuisine);
  };

  const handleCuisineChange = (cuisine: string) => {
    setSelectedCuisine(cuisine);
    filterRestaurants(searchQuery, cuisine);
  };

  const filterRestaurants = (query: string, cuisine: string) => {
    let filtered = mockRestaurants;

    if (cuisine !== "All") {
      filtered = filtered.filter((r) => r.cuisine === cuisine);
    }

    if (query) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.location.toLowerCase().includes(query.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
  };

  return (
    <main className="home-page">
      <nav className="home-nav">
        <Link href="/" className="home-brand" aria-label="MealNest home">
          <Image src="/images/Logo.png" alt="MealNest logo" width={54} height={54} priority />
          <span>MealNest</span>
        </Link>
        <div className="home-nav-actions">
          <Link href="/login">Login</Link>
          <Link className="home-nav-button" href="/signup">
            Sign Up
          </Link>
        </div>
      </nav>

      <section className="home-hero">
        <Image
          src="/images/Register.jpg"
          alt="Restaurant table prepared for dining"
          fill
          priority
          className="home-hero-image"
        />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <p className="home-kicker">Premium Dining Reservations</p>
          <h1>Reserve your perfect table with MealNest.</h1>
          <p>
            Discover restaurants, book tables, and manage your dining journey
            from one simple place.
          </p>
          <div className="home-hero-actions">
            <Link className="home-primary" href="/signup">
              Create Account
            </Link>
            <Link className="home-secondary" href="/login">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="restaurant-section">
        <div className="restaurant-container">
          <div className="section-header">
            <h2>Discover Restaurants</h2>
            <p>Find the perfect dining experience from our curated selection</p>
          </div>

          <div className="search-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search restaurants, cuisines, or locations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="cuisine-filters">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  className={`cuisine-filter ${selectedCuisine === cuisine ? "active" : ""}`}
                  onClick={() => handleCuisineChange(cuisine)}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          <div className="restaurant-grid">
            {filteredRestaurants.length === 0 ? (
              <div className="no-results">
                <p>No restaurants found matching your search.</p>
                <button onClick={() => { handleSearch(""); setSelectedCuisine("All"); }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`} className="restaurant-card">
                  <div className="restaurant-image">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className="restaurant-img"
                    />
                    <div className={`status-badge ${restaurant.isOpen ? "open" : "closed"}`}>
                      {restaurant.isOpen ? "Open Now" : "Closed"}
                    </div>
                  </div>
                  <div className="restaurant-content">
                    <div className="restaurant-header">
                      <h3>{restaurant.name}</h3>
                      <div className="rating">
                        <span>★</span>
                        <span>{restaurant.rating}</span>
                      </div>
                    </div>
                    <p className="cuisine">{restaurant.cuisine}</p>
                    <p className="location">{restaurant.location}</p>
                    <div className="restaurant-footer">
                      <span className="book-now">Book Table →</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Image src="/images/Logo.png" alt="MealNest" width={48} height={48} />
            <h3>MealNest</h3>
            <p>Premium dining reservations made simple.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Discover</h4>
              <Link href="/">Restaurants</Link>
              <Link href="/">Cuisines</Link>
              <Link href="/">Locations</Link>
            </div>
            <div>
              <h4>Company</h4>
              <Link href="/">About Us</Link>
              <Link href="/">Careers</Link>
              <Link href="/">Contact</Link>
            </div>
            <div>
              <h4>Support</h4>
              <Link href="/">Help Center</Link>
              <Link href="/">Privacy Policy</Link>
              <Link href="/">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MealNest. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
