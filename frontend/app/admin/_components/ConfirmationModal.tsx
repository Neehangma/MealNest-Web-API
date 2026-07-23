"use client";

import { useEffect, useRef } from "react";
import styles from "../admin.module.css";

export default function ConfirmationModal({
  open, title, message, confirming, onNo, onYes,
}: {
  open: boolean; title: string; message: string; confirming: boolean;
  onNo: () => void; onYes: () => void;
}) {
  const noRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    noRef.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !confirming) onNo();
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [confirming, onNo, open]);

  if (!open) return null;

  return <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
    if (event.target === event.currentTarget && !confirming) onNo();
  }}>
    <section className={styles.confirmModal} role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" aria-describedby="admin-confirm-message">
      <h2 id="admin-confirm-title">{title}</h2>
      <p id="admin-confirm-message">{message}</p>
      <div className={styles.modalActions}>
        <button ref={noRef} className={styles.secondaryButton} type="button" onClick={onNo} disabled={confirming}>No</button>
        <button className={styles.primaryButton} type="button" onClick={onYes} disabled={confirming}>{confirming ? "Saving..." : "Yes"}</button>
      </div>
    </section>
  </div>;
}
