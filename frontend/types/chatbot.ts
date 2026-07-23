export type ChatRole = "user" | "assistant";

export interface ChatMessageData {
  id: string;
  role: ChatRole;
  text: string;
}

export interface ChatbotResponse {
  reply: string;
}
