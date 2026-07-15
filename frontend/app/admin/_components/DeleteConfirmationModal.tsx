"use client";

import { useEffect, useRef } from "react";
import styles from "../admin.module.css";

export default function DeleteConfirmationModal({
  open, title, name, message, confirmLabel, deleting, onCancel, onConfirm,
}: {
  open: boolean; title: string; name: string; message: string; confirmLabel: string;
  deleting: boolean; onCancel: () => void; onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === "Escape" && !deleting) onCancel(); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [deleting, onCancel, open]);

  if (!open) return null;
  return <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) onCancel(); }}>
    <section className={styles.confirmModal} role="dialog" aria-modal="true" aria-labelledby="admin-delete-title" aria-describedby="admin-delete-message">
      <h2 id="admin-delete-title">{title}</h2>
      <p id="admin-delete-message">Are you sure you want to delete <strong>{name}</strong>? {message}</p>
      <div className={styles.modalActions}>
        <button ref={cancelRef} className={styles.secondaryButton} type="button" onClick={onCancel} disabled={deleting}>Cancel</button>
        <button className={styles.dangerButton} type="button" onClick={onConfirm} disabled={deleting}>{deleting ? "Deleting..." : confirmLabel}</button>
      </div>
    </section>
  </div>;
}
