"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  priceRange: string;
  image: string;
  isOpen: boolean;
  description: string;
  address: string;
  phone: string;
  hours: string;
  features: string[];
}

const mockRestaurants: Record<string, Restaurant> = {
  "1": {
    id: "1",
    name: "The Golden Truffle",
    cuisine: "French",
    location: "Upper East Side",
    rating: 4.8,
    priceRange: "$$$",
    image: "/images/Register.jpg",
    isOpen: true,
    description: "Experience exquisite French cuisine in an elegant setting. Our award-winning chef brings traditional French techniques with modern innovation, creating unforgettable dining experiences.",
    address: "123 Park Avenue, New York, NY 10028",
    phone: "(212) 555-0123",
    hours: "Mon-Sun: 11:00 AM - 11:00 PM",
    features: ["Fine Dining", "Wine Selection", "Private Dining", "Valet Parking"],
  },
  "2": {
    id: "2",
    name: "Sakura Omakase",
    cuisine: "Japanese",
    location: "Tribeca",
    rating: 4.9,
    priceRange: "$$$$",
    image: "/images/Login.jpg",
    isOpen: true,
    description: "Authentic Japanese omakase experience with the freshest seasonal ingredients. Our master chef crafts each course with precision and artistry.",
    address: "456 Hudson Street, New York, NY 10013",
    phone: "(212) 555-0456",
    hours: "Tue-Sun: 6:00 PM - 11:00 PM",
    features: ["Omakase", "Sushi Bar", "Sake Selection", "Chef's Table"],
  },
  "3": {
    id: "3",
    name: "La Bella Italia",
    cuisine: "Italian",
    location: "SoHo",
    rating: 4.6,
    priceRange: "$$",
    image: "/images/Register.jpg",
    isOpen: true,
    description: "Traditional Italian cuisine made with love and fresh ingredients. From handmade pasta to wood-fired pizzas, every dish tells a story of Italian heritage.",
    address: "789 Broadway, New York, NY 10012",
    phone: "(212) 555-0789",
    hours: "Mon-Sun: 12:00 PM - 10:00 PM",
    features: ["Handmade Pasta", "Wood-Fired Pizza", "Outdoor Seating", "Family Style"],
  },
  "4": {
    id: "4",
    name: "El Toro Loco",
    cuisine: "Spanish",
    location: "Chelsea",
    rating: 4.5,
    priceRange: "$$",
    image: "/images/Login.jpg",
    isOpen: false,
    description: "Vibrant Spanish tapas and paella in a lively atmosphere. Enjoy authentic flavors from across Spain with our extensive tapas menu.",
    address: "321 West 23rd Street, New York, NY 10011",
    phone: "(212) 555-0321",
    hours: "Mon-Sun: 5:00 PM - 12:00 AM",
    features: ["Tapas", "Paella", "Live Music", "Happy Hour"],
  },
  "5": {
    id: "5",
    name: "Dragon Palace",
    cuisine: "Chinese",
    location: "Chinatown",
    rating: 4.4,
    priceRange: "$",
    image: "/images/Register.jpg",
    isOpen: true,
    description: "Authentic Chinese cuisine featuring Cantonese and Szechuan specialties. Family-owned since 1985, serving traditional recipes passed down generations.",
    address: "555 Mott Street, New York, NY 10013",
    phone: "(212) 555-0555",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    features: ["Dim Sum", "Family Style", "Takeout", "Delivery"],
  },
  "6": {
    id: "6",
    name: "Le Petit Bistro",
    cuisine: "French",
    location: "West Village",
    rating: 4.7,
    priceRange: "$$$",
    image: "/images/Login.jpg",
    isOpen: true,
    description: "Cozy French bistro with a neighborhood feel. Classic French dishes prepared with seasonal ingredients in an intimate setting.",
    address: "888 Greenwich Street, New York, NY 10014",
    phone: "(212) 555-0888",
    hours: "Mon-Sun: 8:00 AM - 10:00 PM",
    features: ["Brunch", "French Classics", "Wine Bar", "Outdoor Patio"],
  },
};

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [isFavorite, setIsFavorite] = useState(false);

  const restaurant = mockRestaurants[restaurantId];

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
