import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="home-page">
      <nav className="home-nav">
        <Link href="/" className="home-brand" aria-label="MealNest home">
          <Image src="/images/Logo.png" alt="MealNest logo" width={54} height={54} priority />
          <span>MealNest</span>
        </Link>
        <div className="home-nav-actions">
          <Link href="/login">Login</Link>
          <Link className="home-nav-button" href="/register">
            Sign Up
          </Link>
        </div>
      </nav>

      <section className="home-hero">
        <Image
          src="/images/Register.jpg"
          alt="Restaurant table prepared for dining"
          fill
          priority
          className="home-hero-image"
        />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <p className="home-kicker">Premium Dining Reservations</p>
          <h1>Reserve your perfect table with MealNest.</h1>
          <p>
            Discover restaurants, book tables, and manage your dining journey
            from one simple place.
          </p>
          <div className="home-hero-actions">
            <Link className="home-primary" href="/register">
              Create Account
            </Link>
            <Link className="home-secondary" href="/login">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
