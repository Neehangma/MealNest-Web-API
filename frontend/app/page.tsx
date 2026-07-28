"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/app/_components/ThemeToggle";

type LandingIconName = "serving" | "star" | "calendar" | "tag";

const landingFeatures: Array<{ title: string; description: string; icon: LandingIconName }> = [
  { title: "Wide Selection", description: "Explore a variety of cuisines and dining experiences.", icon: "serving" },
  { title: "Real Reviews", description: "Read genuine reviews from real diners.", icon: "star" },
  { title: "Instant Booking", description: "Book your table instantly with real-time availability.", icon: "calendar" },
  { title: "Exclusive Offers", description: "Get access to special deals and discounts.", icon: "tag" },
];

const popularCuisines = [
  { name: "French", image: "/images/Golden.jpg" },
  { name: "Japanese", image: "/images/sakura.jpg" },
  { name: "Thai", image: "/images/tanrak.jpg" },
  { name: "Chinese", image: "/images/jade.jpg" },
  { name: "Indian", image: "/images/mahal.jpg" },
];

function LandingFeatureIcon({ name }: { name: LandingIconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "serving" && <><path d="M4 17h16"/><path d="M6 17a6 6 0 0 1 12 0"/><path d="M12 8V6"/><path d="M10 6h4"/></>}
      {name === "star" && <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>}
      {name === "calendar" && <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h2M14 14h2M8 17h2M14 17h2"/></>}
      {name === "tag" && <><path d="M20 13 13 20 4 11V4h7l9 9Z"/><circle cx="8.5" cy="8.5" r="1"/></>}
    </svg>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <main className="home-page">
      <nav className="home-nav">
        <Link href="/" className="home-brand" aria-label="MealNest home">
          <Image src="/images/Logo.png" alt="MealNest logo" width={54} height={54} priority />
          <span>MealNest</span>
        </Link>
        <button
          type="button"
          className="home-nav-toggle"
          aria-label="Toggle navigation"
          aria-controls="home-navigation-actions"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <div
          id="home-navigation-actions"
          className={`home-nav-actions ${mobileMenuOpen ? "is-open" : ""}`}
        >
          <ThemeToggle className="home-theme-toggle" />
          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
          <Link className="home-nav-button" href="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
        </div>
      </nav>

      <section className="home-hero">
        <Image src="/images/Register.jpg" alt="Restaurant table prepared for dining" fill priority className="home-hero-image" />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <p className="home-kicker">Premium Dining Reservations</p>
          <h1>Reserve your perfect table with MealNest.</h1>
          <p>Discover restaurants, book tables, and manage your dining journey from one simple place.</p>
          <div className="home-hero-actions">
            <Link className="home-primary" href="/signup">Create Account</Link>
            <Link className="home-secondary" href="/login">Sign In</Link>
          </div>
        </div>
      </section>

      <section className="landing-discovery-section">
        <div className="landing-benefits">
          <div className="landing-section-heading">
            <h2><span aria-hidden="true">◆</span> Why Choose MealNest? <span aria-hidden="true">◆</span></h2>
            <i aria-hidden="true" />
          </div>
          <div className="landing-benefit-grid">
            {landingFeatures.map((feature) => (
              <article key={feature.title} className="landing-benefit-card">
                <div className="landing-benefit-icon"><LandingFeatureIcon name={feature.icon} /></div>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="landing-cuisines">
          <div className="landing-section-heading">
            <h2>Explore Popular Cuisines</h2>
            <i aria-hidden="true" />
            <p>Find your favorite flavor from our top cuisines</p>
          </div>
          <div className="landing-cuisine-grid">
            {popularCuisines.map((cuisine) => (
              <article key={cuisine.name} className="landing-cuisine-card">
                <Image src={cuisine.image} alt={`${cuisine.name} cuisine`} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 33vw, 16vw" />
                <span className="landing-cuisine-shade" aria-hidden="true" />
                <strong>{cuisine.name}</strong>
              </article>
            ))}
          </div>
          <Link className="landing-cuisine-cta" href="/dashboard/user/discover">
            Explore All Cuisines <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Image src="/images/Logo.png" alt="MealNest" width={48} height={48} />
            <h3>MealNest</h3>
            <p>Premium dining reservations made simple.</p>
          </div>
          <div className="footer-links">
            <div><h4>Discover</h4><Link href="/">Restaurants</Link><Link href="/">Cuisines</Link><Link href="/">Locations</Link></div>
            <div><h4>Company</h4><Link href="/">About Us</Link><Link href="/">Careers</Link><Link href="/">Contact</Link></div>
            <div><h4>Support</h4><Link href="/">Help Center</Link><Link href="/">Privacy Policy</Link><Link href="/">Terms of Service</Link></div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MealNest. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
