"use client";

import styles from "./admin.module.css";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.content}>
      <section className={`${styles.card} ${styles.panel}`}>
        <h1 className={styles.panelTitle}>Something went wrong</h1>
        <p className={styles.subtitle}>The admin dashboard could not be loaded.</p>
        <button className={styles.ghostButton} type="button" onClick={reset}>
          Try again
        </button>
      </section>
    </div>
  );
}
