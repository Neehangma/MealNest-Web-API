"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type IconName = "chevron" | "check" | "bank";

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
      {name === "bank" && <><path d="m3 10 9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></>}
    </svg>
  );
}

export default function PaymentCheckoutPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<"esewa" | "bank">("esewa");
  const [showDetails, setShowDetails] = useState(true);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePayment = () => {
    if (selectedMethod === "esewa") {
      setShowSuccessModal(true);
      setTimeout(() => {
        router.push("/dashboard/user/booking-confirmation");
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
            <h2>Choose Your Payment Option</h2>
            
            <div className="payment-option-grid">
              <button
                type="button"
                className={`payment-option-card ${selectedMethod === "esewa" ? "selected" : ""}`}
                onClick={() => setSelectedMethod("esewa")}
              >
                <div className="payment-option-icon esewa-icon" aria-hidden="true">e</div>
                <div className="payment-option-copy">
                  <h3>Pay via eSewa</h3>
                  <p>Use eSewa wallet</p>
                </div>
                {selectedMethod === "esewa" && <span className="payment-selected-check"><Icon name="check" size={14}/></span>}
              </button>

              <button
                type="button"
                className={`payment-option-card ${selectedMethod === "bank" ? "selected" : ""}`}
                onClick={() => setSelectedMethod("bank")}
              >
                <div className="payment-option-icon bank-icon"><Icon name="bank" size={28}/></div>
                <div className="payment-option-copy">
                  <h3>Linked Bank Account</h3>
                  <p>Pay instantly via bank account</p>
                </div>
                {selectedMethod === "bank" && <span className="payment-selected-check"><Icon name="check" size={14}/></span>}
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
              {selectedMethod === "esewa" ? "Pay via eSewa" : "Pay via Bank Account"}
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
