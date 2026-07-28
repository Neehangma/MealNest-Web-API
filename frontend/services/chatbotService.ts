import type { ChatbotResponse } from "@/types/chatbot";

type ChatbotApiResponse = Partial<ChatbotResponse> & {
  data?: ChatbotResponse;
  message?: string;
};

export async function sendChatbotMessage(message: string): Promise<string> {
  const response = await fetch("/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const body = await response.json().catch(() => null) as ChatbotApiResponse | null;
  if (!response.ok) {
    throw new Error(body?.message || "Unable to contact the MealNest Assistant.");
  }
  const reply = body?.reply || body?.data?.reply;
  if (!reply?.trim()) {
    throw new Error("The MealNest Assistant returned an empty response.");
  }
  return reply.trim();
}
