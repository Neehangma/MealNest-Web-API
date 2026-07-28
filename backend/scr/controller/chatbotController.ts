import type { Request, Response } from "express";
import { getAiAssistantReply } from "../services/aiAssistantService";

export async function sendChatMessage(req: Request, res: Response): Promise<void> {
  try {
    const message =
      typeof req.body?.message === "string"
        ? req.body.message
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
            .trim()
        : "";

    if (!message) {
      res.status(400).json({ message: "A message is required." });
      return;
    }

    if (message.length > 1_000) {
      res.status(400).json({ message: "Please keep your message under 1,000 characters." });
      return;
    }

    const userId = String((req as any).user?._id || "");
    const result = await getAiAssistantReply(message, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("MealNest AI assistant error:", error);
    res.status(200).json({
      success: true,
      data: {
        reply: "I can still help with MealNest navigation and reservations. Please try asking about a restaurant or cuisine.",
        source: "fallback",
        restaurants: [],
      },
    });
  }
}
