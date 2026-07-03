import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminNotFound() {
  return (
    <div className={styles.content}>
      <section className={`${styles.card} ${styles.panel}`}>
        <h1 className={styles.panelTitle}>Admin page not found</h1>
        <p className={styles.subtitle}>The page you requested does not exist.</p>
        <Link className={styles.ghostButton} href="/admin">
          Back to Dashboard
        </Link>
      </section>
    </div>
  );
}
