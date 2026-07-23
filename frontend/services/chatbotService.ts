import type { ChatbotResponse } from "@/types/chatbot";

export async function sendChatbotMessage(message: string): Promise<string> {
  const response = await fetch("/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const body = await response.json().catch(() => null) as (ChatbotResponse & { message?: string }) | null;
  if (!response.ok) {
    throw new Error(body?.message || "Unable to contact the MealNest Assistant.");
  }
  if (!body?.reply) {
    throw new Error("The MealNest Assistant returned an empty response.");
  }
  return body.reply;
}
