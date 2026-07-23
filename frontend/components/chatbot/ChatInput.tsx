"use client";

import type { FormEvent } from "react";
import styles from "./Chatbot.module.css";

export default function ChatInput({
  value, disabled, onChange, onSubmit,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className={styles.inputRow} onSubmit={submit}>
      <input
        value={value}
        maxLength={1_000}
        placeholder="Ask MealNest AI..."
        aria-label="Message MealNest AI"
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <button type="submit" aria-label="Send message" disabled={disabled || !value.trim()}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 9-18 9 4-9-4-9Zm4.5 8h8.7L6.6 6.2 7.5 11Zm-.9 6.8 9.6-4.8H7.5l-.9 4.8Z" /></svg>
      </button>
    </form>
  );
}
