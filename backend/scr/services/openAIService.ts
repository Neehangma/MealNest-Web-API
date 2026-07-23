import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are MealNest AI Assistant.

Help users with:
- Restaurant recommendations
- Reservations
- Booking guidance
- Cuisine information
- Payment methods
- Favorites
- Profile
- General application help

MealNest supports simulated eSewa and Mobile Banking payments.
Never claim that you completed a booking, cancellation, payment, or account change.
If information is unavailable, politely say you don't know instead of making it up.
Never request passwords, PINs, or payment credentials.
Keep answers under 120 words.`;

let client: GoogleGenAI | null = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export async function getMealNestReply(message: string): Promise<string> {
  const response = await getClient().models.generateContent({
    model: process.env.GEMINI_CHAT_MODEL || "gemini-3.6-flash",
    contents: message,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 220,
    },
  });

  return response.text?.trim() || "I’m sorry, I couldn’t generate a response right now.";
}
