"use client";

import Link from "next/link";
import { useState } from "react";

type IconName = "check" | "utensils" | "calendar" | "users" | "home" | "star";

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  return (
    <svg {...props}>
      {name === "check" && <path d="M20 6 9 17l-5-5" />}
      {name === "utensils" && (
        <>
          <path d="M4 3v8" />
          <path d="M8 3v8" />
          <path d="M4 7h4" />
          <path d="M6 11v10" />
          <path d="M17 3v18" />
          <path d="M14 3c0 5 6 5 6 0" />
        </>
      )}
      {name === "calendar" && (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      )}
      {name === "users" && (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )}
      {name === "home" && (
        <>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </>
      )}
      {name === "star" && <path d="m12 2 3.1 6.3 6.9 1-5 4.8 1.2 6.8L12 17.7 5.8 21 7 14.1 2 9.3l6.9-1L12 2Z" />}
    </svg>
  );
}

export default function BookingConfirmationPage() {
  const [booking] = useState(() => {
    const fallback = { restaurantName: "Your restaurant", date: "Selected date", time: "Selected time", guests: 2, location: "Kathmandu", cuisine: "" };
    if (typeof window === "undefined") return fallback;
    const stored = sessionStorage.getItem("mealnest_booking");
    return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
  });
  return (
    <div className="booking-confirmation-page">
      <main className="booking-confirmation-main">
        <div className="booking-confirmation-container">
          <div className="confirmation-icon">
            <Icon name="check" size={64} />
          </div>
          
          <h1>Booking Confirmation - MealNest</h1>
          
          <div className="confirmation-content">
            <h2>Thank you for your booking!</h2>
            
            <div className="confirmation-message">
              <p>Dear <strong>Dipika Maharjan</strong>,</p>
              <p>Your reservation at <strong>{booking.restaurantName}</strong> is confirmed.</p>
            </div>

            <div className="booking-details-card">
              <h3>Reservation Details</h3>
              <ul className="booking-details-list">
                <li>
                  <div className="detail-icon">
                    <Icon name="utensils" size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Restaurant</span>
                    <span className="detail-value">{booking.restaurantName}</span>
                  </div>
                </li>
                <li>
                  <div className="detail-icon">
                    <Icon name="calendar" size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Date & Time</span>
                    <span className="detail-value">{booking.date}, {booking.time}</span>
                  </div>
                </li>
                <li>
                  <div className="detail-icon">
                    <Icon name="users" size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Guests</span>
                    <span className="detail-value">{booking.guests} Guests</span>
                  </div>
                </li>
                <li>
                  <div className="detail-icon">
                    <Icon name="home" size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{booking.location}{booking.cuisine ? `, ${booking.cuisine} Cuisine` : ""}</span>
                  </div>
                </li>
                <li>
                  <div className="detail-icon">
                    <Icon name="star" size={20} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Total Amount</span>
                    <span className="detail-value">NPR 3,616.00</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="confirmation-closing">
              <p>We look forward to hosting you!</p>
              <p className="team-signature">MealNest Team</p>
            </div>

            <div className="confirmation-actions">
              <Link href="/dashboard/user" className="back-to-dashboard">
                Back to Dashboard
              </Link>
              <Link href="/dashboard/user/reservations" className="view-reservations">
                View All Reservations
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="customer-footer booking-confirmation-footer">
        <div>
          <h2>MealNest</h2>
          <p>Premium dining logistics and reservations for the modern connoisseur.</p>
        </div>
        <nav aria-label="Platform links">
          <h3>Platform</h3>
          <a href="#">About Us</a>
          <a href="#">Press</a>
          <a href="#">Careers</a>
        </nav>
        <nav aria-label="Support links">
          <h3>Support</h3>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </nav>
        <div>
          <h3>Connect</h3>
          <div className="social-row">
            <Icon name="check" />
            <Icon name="check" />
            <Icon name="check" />
          </div>
          <p>&copy; 2024 MealNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
