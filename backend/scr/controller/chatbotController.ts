import type { Request, Response } from "express";
import { getMealNestReply } from "../services/openAIService";

export async function sendChatMessage(req: Request, res: Response): Promise<void> {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!message) {
      res.status(400).json({ message: "A message is required." });
      return;
    }

    if (message.length > 1_000) {
      res.status(400).json({ message: "Please keep your message under 1,000 characters." });
      return;
    }

    const reply = await getMealNestReply(message);
    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI chatbot error:", error);
    res.status(500).json({
      message: error instanceof Error && error.message === "GEMINI_API_KEY is not configured."
        ? "The MealNest Assistant is not configured yet."
        : "The MealNest Assistant is temporarily unavailable.",
    });
  }
}
