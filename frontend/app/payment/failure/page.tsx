"use client";

import Image from "next/image";
import Link from "next/link";

export default function PaymentFailurePage() {
  return (
    <main className="payment-failure">
      <div className="failure-container">
        <div className="failure-card">
          <div className="failure-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="40" fill="#FEE7E7"/>
              <path d="M28 28L52 52M52 28L28 52" stroke="#D01818" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1>Payment Failed</h1>
          <p>We couldn't process your payment. This could be due to insufficient funds, an expired card, or a temporary issue with your bank.</p>
          
          <div className="error-details">
            <div className="error-item">
              <span>Error Code</span>
              <strong>PAY-ERR-001</strong>
            </div>
            <div className="error-item">
              <span>Transaction ID</span>
              <strong>TXN-2024-78542</strong>
            </div>
          </div>

          <div className="troubleshooting">
            <h3>What you can do:</h3>
            <ul>
              <li>Check your payment details and try again</li>
              <li>Contact your bank to ensure your card is active</li>
              <li>Try a different payment method</li>
              <li>If the issue persists, contact our support team</li>
            </ul>
          </div>

          <div className="failure-actions">
            <Link href="/" className="action-button primary">
              Try Again
            </Link>
            <Link href="/reservations" className="action-button secondary">
              View My Reservations
            </Link>
          </div>

          <div className="help-section">
            <p>Still having trouble? <Link href="/contact">Contact Support</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
}
