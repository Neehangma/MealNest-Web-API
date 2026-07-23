import type { ChatMessageData } from "@/types/chatbot";
import styles from "./Chatbot.module.css";

export default function ChatMessage({ message }: { message: ChatMessageData }) {
  return (
    <div className={`${styles.messageRow} ${message.role === "user" ? styles.userRow : styles.assistantRow}`}>
      {message.role === "assistant" && <span className={styles.avatar} aria-hidden="true">MN</span>}
      <p className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.assistantMessage}`}>
        {message.text}
      </p>
    </div>
  );
}
