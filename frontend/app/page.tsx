/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const suggestions = [
  {
    name: "The Golden Truffle",
    description: "Modern Italian & Homemade Pasta",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
    rating: "4.8",
    status: "Available Today",
    time: "8:30 PM",
  },
  {
    name: "Orizuru Sushi",
    description: "Traditional Omakase Experience",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80",
    rating: "4.9",
    status: "Waitlist Only",
    time: "",
  },
  {
    name: "Jimbu",
    description: "Local and Authentic Nepali food",
    image:
      "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=900&q=80",
    rating: "4.7",
    status: "Available Today",
    time: "7:00 PM",
  },
];

const categories = ["Italian", "Japanese", "Nepali", "Korean", "Thai", "Indian"];

const steps = [
  {
    icon: "1",
    title: "Discover",
    text: "Explore thousands of vetted restaurants based on your location and preferences.",
  },
  {
    icon: "2",
    title: "Reserve",
    text: "Instantly book a table for any occasion with real-time availability updates.",
  },
  {
    icon: "3",
    title: "Enjoy",
    text: "Arrive and dine with the confidence of a confirmed reservation and premium service.",
  },
];

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link href="/" className="landing-logo">
          MealNest
        </Link>

        <nav aria-label="Primary navigation" className="landing-nav-links">
          <a href="#discover" className="active">
            Discover
          </a>
          <a href="#reserve">Reservations</a>
          <a href="#favorites">Favorites</a>
        </nav>

        <Link href="/login" className="landing-signin">
          Sign In
        </Link>
      </header>

      <section className="landing-hero" id="discover">
        <div className="landing-hero-overlay">
          <h1>Your Next Culinary Adventure Awaits</h1>
          <form className="landing-search">
            <div className="search-field">
              <span aria-hidden="true">R</span>
              <input placeholder="Restaurant name or cuisine" />
            </div>
            <div className="search-field">
              <span aria-hidden="true">L</span>
              <input placeholder="Location" />
            </div>
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <section className="landing-section suggestions-section" id="favorites">
        <div className="section-title-row">
          <div>
            <h2>Personalized Suggestions</h2>
            <p>Curated based on your taste and local trends.</p>
          </div>
          <a href="#categories">View All -&gt;</a>
        </div>

        <div className="suggestion-grid">
          {suggestions.map((item) => (
            <article className="restaurant-card" key={item.name}>
              <div className="restaurant-image-wrap">
                <img src={item.image} alt={item.name} />
                <span className="rating">Star {item.rating}</span>
              </div>
              <div className="restaurant-body">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="restaurant-meta">
                  <span className={item.status.includes("Waitlist") ? "waitlist" : ""}>
                    {item.status}
                  </span>
                  {item.time && <small>{item.time}</small>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="category-band" id="categories">
        <h2>Browse by Category</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <button type="button" className="category-card" key={category}>
              <span aria-hidden="true">+</span>
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="landing-section works-section" id="reserve">
        <h2>How MealNest Works</h2>
        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.title}>
              <span aria-hidden="true">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="cta-card">
          <div className="cta-content">
            <h2>Ready to dine?</h2>
            <p>
              Join thousands of food enthusiasts and get exclusive access to the
              best tables in your city.
            </p>
            <Link href="/register" className="cta-button">
              Create an Account
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80"
            alt="A colorful plated meal"
          />
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <h2>MealNest</h2>
          <p>Elevating your dining experiences through seamless discovery and reservations.</p>
        </div>
        <div>
          <h3>Company</h3>
          <a href="#">About Us</a>
          <a href="#">Press</a>
          <a href="#">Careers</a>
        </div>
        <div>
          <h3>Support</h3>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
        <div>
          <h3>Follow Us</h3>
          <div className="social-row">
            <a href="#" aria-label="Website">
              web
            </a>
            <a href="#" aria-label="Share">
              share
            </a>
          </div>
        </div>
        <p className="copyright">&copy; 2024 MealNest. All rights reserved.</p>
      </footer>
    </main>
  );
}
