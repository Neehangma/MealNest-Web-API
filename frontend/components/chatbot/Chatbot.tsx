"use client";

import { useEffect, useRef, useState } from "react";
import { sendChatbotMessage } from "@/services/chatbotService";
import type { ChatMessageData } from "@/types/chatbot";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";
import styles from "./Chatbot.module.css";

const WELCOME_MESSAGE: ChatMessageData = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I’m the MealNest AI Assistant. How can I help with your dining experience today?",
};

function messageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageData[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.querySelector("input")?.focus();
  }, [open]);

  async function send(message = input) {
    const text = message.trim();
    if (!text || loading) return;

    setMessages((current) => [...current, { id: messageId(), role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChatbotMessage(text);
      setMessages((current) => [...current, { id: messageId(), role: "assistant", text: reply }]);
    } catch (error) {
      setMessages((current) => [...current, {
        id: messageId(),
        role: "assistant",
        text: error instanceof Error ? error.message : "The MealNest Assistant is unavailable right now.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className={styles.chatbot} aria-label="MealNest AI Assistant">
      <section className={`${styles.window} ${open ? styles.windowOpen : ""}`} aria-hidden={!open}>
        <header className={styles.header}>
          <span className={styles.headerAvatar} aria-hidden="true">MN</span>
          <div><h2>MealNest AI</h2><p><span /> Online assistant</p></div>
          <button type="button" aria-label="Close MealNest AI" onClick={() => setOpen(false)}>×</button>
        </header>

        <div className={styles.messages} aria-live="polite">
          {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
          {loading && (
            <div className={`${styles.messageRow} ${styles.assistantRow}`} aria-label="MealNest AI is typing">
              <span className={styles.avatar} aria-hidden="true">MN</span>
              <span className={styles.typing}><i /><i /><i /></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <SuggestedQuestions disabled={loading} onSelect={(question) => void send(question)} />
        <div ref={inputRef}><ChatInput value={input} disabled={loading} onChange={setInput} onSubmit={() => void send()} /></div>
      </section>

      <button
        type="button"
        className={`${styles.launcher} ${open ? styles.launcherOpen : ""}`}
        aria-label={open ? "Close MealNest AI" : "Open MealNest AI"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <span>×</span> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-1-1.73V6a2 2 0 0 1 2-2Zm2 6h2V8H7v2Zm4 0h2V8h-2v2Zm4 0h2V8h-2v2Z" /></svg>}
      </button>
    </aside>
  );
}
