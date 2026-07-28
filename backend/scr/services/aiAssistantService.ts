const Restaurant = require("../models/restaurant.model");
const Reservation = require("../models/reservation.model");
const Review = require("../models/review.model");

const SYSTEM_PROMPT = `You are MealNest Assistant.
You only answer restaurant-related questions.
You help users discover restaurants, compare restaurants, recommend cuisines,
explain menus, guide bookings, reservations, favourites, reviews, and MealNest usage.
Never invent restaurant information. Never expose database internals, API keys,
JWT tokens, passwords, or payment PINs. If data is unavailable, say so politely.
Keep answers short, friendly, and useful.`;

const BOOKING_GUIDE =
  "To make a reservation: open a restaurant, choose a date and time, select the number of guests and a table, then proceed to payment. Your reservation is confirmed after payment.";
const NO_MATCH =
  "I couldn't find a matching restaurant in MealNest. Try another cuisine or restaurant.";

type RestaurantContext = {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  price: number | null;
  priceRange: string;
  image: string;
  isOpen: boolean;
  menu: string[];
  reviewCount: number;
};

function plainRestaurant(document: any): RestaurantContext {
  return {
    id: String(document._id),
    name: document.name,
    cuisine: document.cuisine,
    location: document.location,
    rating: Number(document.rating || 0),
    price: Number.isFinite(Number(document.price)) ? Number(document.price) : null,
    priceRange: document.priceRange || "",
    image: document.image || "",
    isOpen: document.isOpen !== false,
    menu: Array.isArray(document.features) ? document.features.slice(0, 8) : [],
    reviewCount: Number(document.reviewCount || 0),
  };
}

function words(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 12);
}

function restaurantMatches(message: string, restaurant: RestaurantContext): boolean {
  const query = message.toLowerCase();
  const searchable = [
    restaurant.name,
    restaurant.cuisine,
    restaurant.location,
    restaurant.priceRange,
    ...restaurant.menu,
  ]
    .join(" ")
    .toLowerCase();
  return words(query).some((word) => searchable.includes(word));
}

async function databaseContext(message: string, userId: string) {
  const [restaurantDocs, reservationDocs] = await Promise.all([
    Restaurant.find({ isActive: { $ne: false } })
      .select("name cuisine location rating reviewCount price priceRange image isOpen features")
      .sort({ rating: -1, reviewCount: -1 })
      .limit(100)
      .maxTimeMS(5_000)
      .lean(),
    Reservation.find({ user: userId })
      .select("restaurantName cuisine date time guests tableNumber status bookingReference reservationDate")
      .sort({ reservationDate: 1 })
      .limit(20)
      .maxTimeMS(5_000)
      .lean(),
  ]);

  const restaurants = restaurantDocs.map(plainRestaurant);
  const lower = message.toLowerCase();
  let matches = restaurants.filter((restaurant) => restaurantMatches(message, restaurant));

  const priceMatch = lower.match(/(?:under|below|less than|rs\.?|npr)\s*(\d{2,5})/i);
  if (priceMatch) {
    const maximum = Number(priceMatch[1]);
    matches = restaurants.filter(
      (restaurant) => restaurant.price !== null && restaurant.price <= maximum,
    );
  } else if (/(affordable|cheap|budget)/i.test(lower)) {
    matches = restaurants.filter(
      (restaurant) => restaurant.price !== null && restaurant.price <= 500,
    );
  }
  if (/(top|best|highest rated|rating)/i.test(lower)) {
    matches = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 5);
  }
  if (/(open|available)/i.test(lower)) {
    const open = matches.filter((restaurant) => restaurant.isOpen);
    matches = open.length ? open : restaurants.filter((restaurant) => restaurant.isOpen);
  }

  const selected = matches.slice(0, 5);
  const reviewIds = selected.map((restaurant) => restaurant.id);
  const reviews = reviewIds.length
    ? await Review.find({
        restaurantId: { $in: reviewIds },
        status: { $ne: "hidden" },
      })
        .select("restaurantId rating comment")
        .sort({ createdAt: -1 })
        .limit(15)
        .maxTimeMS(5_000)
        .lean()
    : [];

  return {
    restaurants,
    matches: selected,
    reservations: reservationDocs,
    reviews,
  };
}

function localReply(message: string, context: any): string {
  const lower = message.toLowerCase();
  if (/(how|make|create).*(book|reservation)|how.*reserve/.test(lower)) {
    return BOOKING_GUIDE;
  }
  if (/(my reservation|my booking|upcoming booking|what restaurant have i booked)/.test(lower)) {
    const bookings = context.reservations.filter((item: any) => item.status !== "cancelled");
    if (!bookings.length) return "You do not have any active MealNest reservations yet.";
    return `Your MealNest reservations are: ${bookings
      .slice(0, 5)
      .map((item: any) => `${item.restaurantName} on ${item.date} at ${item.time}`)
      .join("; ")}.`;
  }
  if (/(cuisine|food type|types of food)/.test(lower) && !context.matches.length) {
    const cuisines = [...new Set(context.restaurants.map((item: any) => item.cuisine))].sort();
    return cuisines.length
      ? `MealNest currently offers: ${cuisines.join(", ")}.`
      : "Cuisine information is not available in MealNest right now.";
  }
  if (/(favourite|favorite)/.test(lower)) {
    return "Open a restaurant and use its favourite control to save it. You can review saved restaurants from your MealNest favourites.";
  }
  if (context.matches.length) {
    const descriptions = context.matches.map((restaurant: RestaurantContext) => {
      const price = restaurant.price === null ? "" : `, around Rs.${restaurant.price}`;
      return `${restaurant.name} (${restaurant.cuisine}, ${restaurant.rating.toFixed(1)}★${price}, ${restaurant.location})`;
    });
    return `I found ${descriptions.join("; ")} in MealNest.`;
  }
  if (/(restaurant|cuisine|menu|price|rating|review|location|open|available|recommend)/.test(lower)) {
    return NO_MATCH;
  }
  return "I can help with MealNest restaurants, cuisines, menus, reviews, favourites, and reservations. What would you like to find?";
}

async function geminiReply(message: string, context: any): Promise<string> {
  const apiKey = String(process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) throw new Error("Gemini is not configured");
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });
  const safeContext = JSON.stringify({
    restaurants: context.matches,
    reservations: context.reservations,
    reviews: context.reviews,
  });
  const request = ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: `User question: ${message}\nMealNest database context: ${safeContext}`,
    config: { systemInstruction: SYSTEM_PROMPT, maxOutputTokens: 700 },
  });
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Gemini timeout")), 25_000),
  );
  const response: any = await Promise.race([request, timeout]);
  const text = response.text?.trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

export async function getAiAssistantReply(message: string, userId: string) {
  let context: any;
  try {
    context = await databaseContext(message, userId);
  } catch (error) {
    console.error("MealNest AI database context error:", error);
    context = { restaurants: [], matches: [], reservations: [], reviews: [] };
  }

  try {
    const reply = await geminiReply(message, context);
    return { reply, source: "gemini", restaurants: context.matches };
  } catch (error) {
    console.warn(
      "MealNest AI provider failed; using local fallback:",
      error instanceof Error ? error.message : "unknown error",
    );
    return {
      reply: localReply(message, context),
      source: "fallback",
      restaurants: context.matches,
    };
  }
}

export const __testables = { localReply, plainRestaurant };
