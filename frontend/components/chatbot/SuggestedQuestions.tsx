import styles from "./Chatbot.module.css";

export const SUGGESTED_QUESTIONS = [
  "Book a table",
  "Payment methods",
  "Thai restaurants",
  "Italian restaurants",
  "Cancel reservation",
  "My favourites",
];

export default function SuggestedQuestions({
  disabled, onSelect,
}: {
  disabled: boolean;
  onSelect: (question: string) => void;
}) {
  return (
    <div className={styles.suggestions} aria-label="Suggested questions">
      {SUGGESTED_QUESTIONS.map((question) => (
        <button key={question} type="button" disabled={disabled} onClick={() => onSelect(question)}>
          {question}
        </button>
      ))}
    </div>
  );
}
