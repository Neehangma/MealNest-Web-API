"use client";

import { useState } from "react";
import Link from "next/link";

type PaymentMethod = {
  id: string;
  type: "card" | "bank";
  last4: string;
  expiry: string;
  brand: string;
  isDefault: boolean;
};

type IconName = "card" | "plus" | "trash" | "check" | "chevron";

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
      {name === "card" && (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </>
      )}
      {name === "plus" && (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      )}
      {name === "trash" && (
        <>
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </>
      )}
      {name === "check" && <path d="M20 6 9 17l-5-5" />}
      {name === "chevron" && <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

export default function PaymentMethodsClient() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      last4: "4242",
      expiry: "12/25",
      brand: "Visa",
      isDefault: true,
    },
    {
      id: "2",
      type: "card",
      last4: "5555",
      expiry: "08/26",
      brand: "Mastercard",
      isDefault: false,
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this payment method?")) {
      setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  return (
    <div className="payment-methods-page">
      <header className="customer-nav payment-methods-nav">
        <Link className="customer-brand" href="/dashboard/user">
          MealNest
        </Link>
        <nav aria-label="Customer navigation">
          <Link href="/dashboard/user">Discover</Link>
          <Link href="/reservations">Reservations</Link>
          <Link href="/favorites">Favorites</Link>
        </nav>
        <div className="customer-nav-actions">
          <button type="button" aria-label="Search">
            <Icon name="card" size={22} />
          </button>
        </div>
      </header>

      <main className="payment-methods-main">
        <section className="payment-methods-heading">
          <h1>Payment Methods</h1>
          <p>Manage your payment methods for quick and easy reservations.</p>
        </section>

        <div className="payment-methods-content">
          <div className="payment-methods-header">
            <h2>Saved Payment Methods</h2>
            <button
              className="payment-methods-add-button"
              onClick={() => setShowAddForm(!showAddForm)}
 type="button"
            >
              <Icon name="plus" size={18} />
              {showAddForm ? "Cancel" : "Add Payment Method"}
            </button>
          </div>

          {showAddForm && (
            <div className="payment-methods-form-card">
              <h3>Add New Payment Method</h3>
              <form className="payment-methods-form">
                <label>
                  <span>Card Number</span>
                  <input type="text" placeholder="1234 5678 9012 3456" />
                </label>
                <div className="payment-methods-form-row">
                  <label>
                    <span>Expiry Date</span>
                    <input type="text" placeholder="MM/YY" />
                  </label>
                  <label>
                    <span>CVV</span>
                    <input type="text" placeholder="123" />
                  </label>
                </div>
                <label>
                  <span>Cardholder Name</span>
                  <input type="text" placeholder="John Doe" />
                </label>
                <button type="submit" className="payment-methods-submit-button">
                  Add Payment Method
                </button>
              </form>
            </div>
          )}

          <div className="payment-methods-list">
            {paymentMethods.length === 0 ? (
              <div className="payment-methods-empty">
                <div className="payment-methods-empty-icon">
                  <Icon name="card" size={48} />
                </div>
                <h3>No payment methods saved</h3>
                <p>Add a payment method to make reservations faster.</p>
                <button
                  className="payment-methods-add-button"
                  onClick={() => setShowAddForm(true)}
 type="button"
                >
                  <Icon name="plus" size={18} />
                  Add Payment Method
                </button>
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div key={method.id} className={`payment-method-card ${method.isDefault ? "default" : ""}`}>
                  <div className="payment-method-icon">
                    <Icon name="card" size={32} />
                  </div>
                  <div className="payment-method-info">
                    <div className="payment-method-header">
                      <h3>{method.brand} ending in {method.last4}</h3>
                      {method.isDefault && (
                        <span className="payment-method-badge">Default</span>
                      )}
                    </div>
                    <p>Expires {method.expiry}</p>
                  </div>
                  <div className="payment-method-actions">
                    {!method.isDefault && (
                      <button
                        className="payment-method-action-button"
                        onClick={() => handleSetDefault(method.id)}
 type="button"
                      >
                        <Icon name="check" size={16} />
                        Set Default
                      </button>
                    )}
                    <button
                      className="payment-method-action-button danger"
                      onClick={() => handleDelete(method.id)}
 type="button"
                    >
                      <Icon name="trash" size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="customer-footer payment-methods-footer">
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
            <Icon name="card" />
            <Icon name="card" />
            <Icon name="card" />
          </div>
          <p>&copy; 2024 MealNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
