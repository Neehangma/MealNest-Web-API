"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { AuthUser } from "@/lib/api/auth";

type DashboardClientProps = {
  user: AuthUser | null;
};

const reservations = [
  {
    restaurant: "The Golden Truffle",
    date: "Today",
    time: "7:30 PM",
    guests: "4 guests",
    status: "Confirmed",
  },
  {
    restaurant: "Jimbu Thakali",
    date: "Jun 30",
    time: "1:15 PM",
    guests: "2 guests",
    status: "Pending",
  },
];

const favorites = ["Italian", "Nepali", "Fine Dining"];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const name = user?.fullName || user?.email?.split("@")[0] || "Guest";
  const email = user?.email || "user@example.com";
  const phone = user?.phoneNumber || "Not added";

  return (
    <main className="user-dashboard">
      <aside className="user-sidebar">
        <Link href="/" className="user-brand">
          <Image src="/images/Logo.png" alt="MealNest logo" width={58} height={58} priority />
          <span>MealNest</span>
        </Link>

        <nav className="user-nav" aria-label="Dashboard navigation">
          <a className="active" href="#">Dashboard</a>
          <a href="#">Bookings</a>
          <a href="#">Restaurants</a>
          <a href="#">Favorites</a>
          <button type="button" onClick={() => setProfileOpen(true)}>
            Profile
          </button>
        </nav>
      </aside>

      <section className="user-main">
        <header className="user-topbar">
          <div>
            <p>Welcome back</p>
            <h1>{name}</h1>
          </div>
          <Link className="user-logout" href="/">
            Home
          </Link>
        </header>

        <section className="user-hero-panel">
          <Image
            src="/images/Login.jpg"
            alt="Restaurant interior"
            fill
            className="user-hero-image"
            priority
          />
          <div className="user-hero-shade" />
          <div className="user-hero-copy">
            <p>Find your next table</p>
            <h2>Book memorable dining experiences in minutes.</h2>
            <div className="user-search">
              <input placeholder="Search restaurants, cuisine, or location" />
              <button type="button">Search</button>
            </div>
          </div>
        </section>

        <section className="user-stats">
          <article>
            <span>Upcoming</span>
            <strong>2</strong>
            <p>Reservations</p>
          </article>
          <article>
            <span>Visited</span>
            <strong>12</strong>
            <p>Restaurants</p>
          </article>
          <article>
            <span>Reviews</span>
            <strong>8</strong>
            <p>Shared</p>
          </article>
        </section>

        <section className="user-grid">
          <article className="user-card">
            <div className="user-card-header">
              <h2>Upcoming Bookings</h2>
              <a href="#">View all</a>
            </div>
            <div className="booking-list">
              {reservations.map((reservation) => (
                <div className="booking-row" key={reservation.restaurant}>
                  <div>
                    <h3>{reservation.restaurant}</h3>
                    <p>
                      {reservation.date} at {reservation.time} · {reservation.guests}
                    </p>
                  </div>
                  <span>{reservation.status}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="user-card">
            <div className="user-card-header">
              <h2>Your Preferences</h2>
            </div>
            <div className="favorite-list">
              {favorites.map((favorite) => (
                <span key={favorite}>{favorite}</span>
              ))}
            </div>
            <p className="user-note">
              MealNest will use these preferences to highlight restaurants that match your taste.
            </p>
          </article>
        </section>
      </section>

      {profileOpen && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true">
          <section className="profile-card profile-popout">
            <div className="profile-header">
              <button type="button" className="profile-back" onClick={() => setProfileOpen(false)}>
                Close
              </button>
              <Image src="/images/Logo.png" alt="MealNest logo" width={62} height={62} priority />
            </div>

            <div className="profile-avatar">{initials(name)}</div>
            <h1>{name}</h1>
            <p>{email}</p>

            <div className="profile-details">
              <div>
                <span>Full Name</span>
                <strong>{name}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{email}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{phone}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{user?.role || "user"}</strong>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
