"use client";

import { useState } from "react";
import Link from "next/link";

type IconName = "chevron" | "check";

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
      {name === "chevron" && <path d="m9 18 6-6-6-6" />}
      {name === "check" && <path d="M20 6 9 17l-5-5" />}
    </svg>
  );
}

export default function PaymentCheckoutPage() {
  const [selectedMethod, setSelectedMethod] = useState<"esewa" | "bank">("esewa");
  const [showDetails, setShowDetails] = useState(true);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePayment = () => {
    if (selectedMethod === "esewa") {
      setShowSuccessModal(true);
      setTimeout(() => {
        window.location.href = "/booking-confirmation";
      }, 2000);
    } else {
      alert("Processing bank account payment...");
    }
  };

  return (
    <div className="payment-checkout-page">
      <main className="payment-checkout-main">
        <section className="payment-checkout-heading">
          <Link href="/dashboard/user" className="payment-checkout-back">
            <Icon name="chevron" size={18} />
            Back to Dashboard
          </Link>
          <h1>Payment Method</h1>
          <p>Select your preferred payment method to complete the reservation.</p>
        </section>

        <div className="payment-checkout-content">
          <div className="payment-methods-selection">
            <h2>Select Payment Method</h2>
            
            <div className="payment-method-options">
              <button
                type="button"
                className={`payment-method-option ${selectedMethod === "esewa" ? "selected" : ""}`}
                onClick={() => setSelectedMethod("esewa")}
              >
                <div className="payment-method-radio">
                  {selectedMethod === "esewa" && <Icon name="check" size={16} />}
                </div>
                <div className="payment-method-label">
                  <h3>Pay via eSewa</h3>
                  <p>Pay using your eSewa wallet</p>
                </div>
              </button>

              <button
                type="button"
                className={`payment-method-option ${selectedMethod === "bank" ? "selected" : ""}`}
                onClick={() => setSelectedMethod("bank")}
              >
                <div className="payment-method-radio">
                  {selectedMethod === "bank" && <Icon name="check" size={16} />}
                </div>
                <div className="payment-method-label">
                  <h3>Linked Bank Account</h3>
                  <p>Pay using your linked bank account</p>
                </div>
              </button>
            </div>
          </div>

          {showDetails && (
            <div className="payment-details-card">
              <h2>Payment Details</h2>
              
              {selectedMethod === "esewa" ? (
                <div className="payment-details-form">
                  <div className="form-group">
                    <label>ESEWA ID</label>
                    <input type="text" placeholder="Enter your eSewa ID" />
                  </div>
                  <div className="form-group">
                    <label>FULL NAME</label>
                    <input type="text" placeholder="Enter your full name" />
                  </div>
                  <div className="form-group">
                    <label>CONTACT NUMBER</label>
                    <input type="text" placeholder="Enter your contact number" />
                  </div>
                  <div className="form-group">
                    <label>ADDRESS</label>
                    <input type="text" placeholder="Enter your address" />
                  </div>
                </div>
              ) : (
                <div className="payment-details-form">
                  <div className="form-group">
                    <label>BANK NAME</label>
                    <input type="text" placeholder="Select your bank" />
                  </div>
                  <div className="form-group">
                    <label>ACCOUNT NUMBER</label>
                    <input type="text" placeholder="Enter your account number" />
                  </div>
                  <div className="form-group">
                    <label>ACCOUNT HOLDER NAME</label>
                    <input type="text" placeholder="Enter account holder name" />
                  </div>
                </div>
              )}

              <div className="payment-total">
                <div className="total-row">
                  <span>Subtotal</span>
                 <span>NPR</span>

                </div>
                <div className="total-row">
                  <span>Service Fee</span>
                  <span>NPR</span>
                </div>
                <div className="total-row final">
                  <strong>Total Amount</strong>
                  <strong>NPR</strong>
                </div>
              </div>
            </div>
          )}

          <div className="payment-actions">
            <Link href="/dashboard/user" className="cancel-button">
              CANCEL
            </Link>
            <button
              type="button"
              className="pay-button"
              onClick={handlePayment}
            >
              {selectedMethod === "esewa" ? "PAY VIA ESEWA" : "PAY VIA BANK"}
            </button>
          </div>
        </div>
      </main>

      <footer className="customer-footer payment-checkout-footer">
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

      {showSuccessModal && (
        <div className="payment-success-modal">
          <div className="payment-success-modal-content">
            <div className="success-icon">
              <Icon name="check" size={48} />
            </div>
            <h2>Payment Successful!</h2>
            <p>Your payment has been processed successfully via eSewa.</p>
            <p>Redirecting to booking confirmation...</p>
          </div>
        </div>
      )}
    </div>
  );
}
