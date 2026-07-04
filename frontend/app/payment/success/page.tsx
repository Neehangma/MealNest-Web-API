"use client";

import Image from "next/image";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="payment-success">
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="40" fill="#E7F8E9"/>
              <path d="M25 40L35 50L55 30" stroke="#00862D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1>Payment Successful!</h1>
          <p>Your reservation has been confirmed. We've sent a confirmation email with all the details.</p>
          
          <div className="reservation-summary">
            <div className="summary-item">
              <span>Restaurant</span>
              <strong>The Golden Truffle</strong>
            </div>
            <div className="summary-item">
              <span>Date</span>
              <strong>Tomorrow, Oct 24</strong>
            </div>
            <div className="summary-item">
              <span>Time</span>
              <strong>7:30 PM</strong>
            </div>
            <div className="summary-item">
              <span>Party Size</span>
              <strong>2 Guests</strong>
            </div>
            <div className="summary-item">
              <span>Confirmation #</span>
              <strong>MN-2024-78542</strong>
            </div>
          </div>

          <div className="success-actions">
            <Link href="/reservations" className="action-button primary">
              View My Reservations
            </Link>
            <Link href="/" className="action-button secondary">
              Browse More Restaurants
            </Link>
          </div>

          <div className="help-section">
            <p>Need help? <Link href="/contact">Contact Support</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
}
