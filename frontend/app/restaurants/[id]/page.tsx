"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createReservation, getRestaurantById, toggleFavorite, type RestaurantItem } from "@/lib/api/dashboard";

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [isFavorite, setIsFavorite] = useState(false);
  const [restaurant, setRestaurant] = useState<RestaurantItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadRestaurant() {
      try {
        setLoading(true);
        const response = await getRestaurantById(restaurantId);
        setRestaurant(response.data);
      } catch {
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    }

    void loadRestaurant();
  }, [restaurantId]);

  async function handleReserve() {
    if (!restaurant || !selectedDate || !selectedTime) {
      setMessage("Please select a date and time.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      await createReservation({
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        cuisine: restaurant.cuisine,
        image: restaurant.image,
        reservationDate: selectedDate,
        date: selectedDate,
        time: selectedTime,
        guests: Number(partySize),
        status: "confirmed",
      });
      setMessage("Reservation created successfully.");
    } catch {
      setMessage("Unable to create your reservation right now.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFavoriteToggle() {
    if (!restaurant) return;

    try {
      await toggleFavorite(restaurant._id);
      setIsFavorite((current) => !current);
    } catch {
      setMessage("Unable to update favorites right now.");
    }
  }

  if (loading) {
    return <div className="restaurant-error"><div className="error-container"><h1>Loading restaurant…</h1></div></div>;
  }

  if (!restaurant) {

  if (!restaurant) {
    return (
      <div className="restaurant-error">
        <div className="error-container">
          <h1>Restaurant Not Found</h1>
          <p>The restaurant you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="back-button">
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const timeSlots = [
    "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "5:00 PM",
    "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"
  ];

  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });

  return (
    <main className="restaurant-detail">
      <nav className="detail-nav">
        <Link href="/" className="detail-brand">
          <Image src="/images/Logo.png" alt="MealNest" width={40} height={40} />
          <span>MealNest</span>
        </Link>
        <div className="detail-nav-actions">
          <Link href="/login">Login</Link>
          <Link className="detail-nav-button" href="/register">
            Sign Up
          </Link>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-image">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            priority
            className="hero-img"
          />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className={`status-badge ${restaurant.isOpen ? "open" : "closed"}`}>
            {restaurant.isOpen ? "Open Now" : "Closed"}
          </div>
          <button type="button" className="detail-nav-button" onClick={() => void handleFavoriteToggle()}>
            {isFavorite ? "★ Saved" : "☆ Save"}
          </button>
          <h1>{restaurant.name}</h1>
          <div className="hero-meta">
            <span className="rating">★ {restaurant.rating}</span>
            <span className="cuisine">{restaurant.cuisine}</span>
            <span className="price">{restaurant.priceRange}</span>
            <span className="location">{restaurant.location}</span>
          </div>
        </div>
      </div>

      <div className="detail-container">
        <div className="detail-main">
          <section className="info-section">
            <h2>About</h2>
            <p>{restaurant.description}</p>
          </section>

          <section className="info-section">
            <h2>Location & Hours</h2>
            <div className="info-grid">
              <div>
                <span>Address</span>
                <p>{restaurant.address}</p>
              </div>
              <div>
                <span>Phone</span>
                <p>{restaurant.phone}</p>
              </div>
              <div>
                <span>Hours</span>
                <p>{restaurant.hours}</p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2>Features</h2>
            <div className="features-list">
              {restaurant.features.map((feature, index) => (
                <span key={index} className="feature-tag">
                  {feature}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="booking-sidebar">
          <div className="booking-card">
            <h3>Reserve a Table</h3>
            
            <div className="booking-form">
              <label>
                Date
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  <option value="">Select date</option>
                  {next7Days.map((date) => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </label>

              <label>
                Time
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </label>

              <label>
                Party Size
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5 Guests</option>
                  <option value="6">6 Guests</option>
                  <option value="7">7+ Guests</option>
                </select>
              </label>

              <button className="book-button">
                Find a Table
              </button>
            </div>

            <div className="favorite-section">
              <button
                className={`favorite-button ${isFavorite ? "active" : ""}`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                {isFavorite ? "♥ Saved to Favorites" : "♡ Add to Favorites"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
