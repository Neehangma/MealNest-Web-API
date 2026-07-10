"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createReservation,
  getRestaurantById,
  toggleFavorite,
  type RestaurantItem,
} from "@/lib/api/dashboard";

const FALLBACK_IMAGE = "/images/Register.jpg";
const DEFAULT_TIME_SLOTS = [
  "11:00 AM",
  "12:30 PM",
  "2:00 PM",
  "5:30 PM",
  "7:00 PM",
  "8:30 PM",
];

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<RestaurantItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [image, setImage] = useState(FALLBACK_IMAGE);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [isFavorite, setIsFavorite] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;

    getRestaurantById(id)
      .then(({ data }) => {
        setRestaurant(data);
        setImage(data.image || FALLBACK_IMAGE);
      })
      .catch((reason: unknown) => {
        setRestaurant(null);
        setError(reason instanceof Error ? reason.message : "Restaurant not found");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      value: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    };
  });

  async function reserve() {
    if (!restaurant || !selectedDate || !selectedTime) {
      setError("Please select a date and time.");
      return;
    }

    setBooking(true);
    setError("");
    try {
      const payload = {
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        cuisine: restaurant.cuisine,
        image: restaurant.image,
        reservationDate: selectedDate,
        date: selectedDate,
        time: selectedTime,
        guests: Number(partySize),
        status: "confirmed",
      };
      await createReservation(payload);
      sessionStorage.setItem(
        "mealnest_booking",
        JSON.stringify({
          ...payload,
          location: restaurant.location,
          priceRange: restaurant.priceRange,
        }),
      );
      router.push("/payment-checkout");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to complete reservation.");
      setBooking(false);
    }
  }

  async function handleFavoriteToggle() {
    if (!restaurant) return;

    try {
      setError("");
      await toggleFavorite(restaurant._id);
      setIsFavorite((value) => !value);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update favorites.");
    }
  }

  if (loading) {
    return <main className="restaurant-error"><div className="error-container"><h1>Loading restaurant...</h1></div></main>;
  }

  if (!restaurant) {
    return <main className="restaurant-error"><div className="error-container"><h1>Restaurant Not Found</h1><p>{error}</p><Link href="/dashboard/user" className="back-button">Back to Restaurants</Link></div></main>;
  }

  const slots = restaurant.availableTimeSlots?.length
    ? restaurant.availableTimeSlots
    : DEFAULT_TIME_SLOTS;

  return <main className="restaurant-detail">
    <nav className="detail-nav"><Link href="/dashboard/user" className="detail-brand"><Image src="/images/Logo.png" alt="MealNest" width={40} height={40}/><span>MealNest</span></Link><div className="detail-nav-actions"><Link href="/dashboard/user">Dashboard</Link><Link className="detail-nav-button" href="/reservations">Reservations</Link></div></nav>
    <div className="hero-section"><div className="hero-image"><Image src={image} onError={() => setImage(FALLBACK_IMAGE)} alt={restaurant.name} fill priority className="hero-img"/><div className="hero-overlay"/></div><div className="hero-content"><div className={`status-badge ${restaurant.isOpen ? "open" : "closed"}`}>{restaurant.isOpen ? "Open Now" : "Closed"}</div><h1>{restaurant.name}</h1><div className="hero-meta"><span className="rating">★ {restaurant.rating} ({restaurant.reviewCount || 0})</span><span className="cuisine">{restaurant.cuisine}</span><span className="location">{restaurant.location}</span></div></div></div>
    <div className="detail-container"><div className="detail-main"><section className="info-section"><h2>About</h2><p>{restaurant.description}</p></section><section className="info-section"><h2>Location &amp; Hours</h2><div className="info-grid"><div><span>Address</span><p>{restaurant.address}</p></div><div><span>Phone</span><p>{restaurant.phone}</p></div><div><span>Hours</span><p>{restaurant.hours}</p></div></div></section><section className="info-section"><h2>Features</h2><div className="features-list">{restaurant.features.map((feature) => <span key={feature} className="feature-tag">{feature}</span>)}</div></section></div>
      <aside className="booking-sidebar"><div className="booking-card"><h3>Reserve a Table</h3><div className="booking-form"><label>Date<select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}><option value="">Select date</option>{days.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}</select></label><label>Time<select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}><option value="">Select time</option>{slots.map((time) => <option key={time} value={time}>{time}</option>)}</select></label><label>Party Size<select value={partySize} onChange={(event) => setPartySize(event.target.value)}>{[1, 2, 3, 4, 5, 6, 7].map((size) => <option key={size} value={size}>{size}{size === 7 ? "+" : ""} Guest{size > 1 ? "s" : ""}</option>)}</select></label>{error && <p className="form-message error">{error}</p>}<button type="button" className="book-button" onClick={reserve} disabled={booking}>{booking ? "Booking..." : "Book a Table"}</button></div><div className="favorite-section"><button type="button" className={`favorite-button ${isFavorite ? "active" : ""}`} onClick={handleFavoriteToggle}>{isFavorite ? "♥ Saved to Favorites" : "♡ Add to Favorites"}</button></div></div></aside>
    </div>
  </main>;
}
