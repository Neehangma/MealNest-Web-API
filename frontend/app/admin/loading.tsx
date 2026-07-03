import styles from "./admin.module.css";

export default function AdminLoading() {
  return (
    <div className={styles.content}>
      <section className={`${styles.card} ${styles.panel}`}>
        <h1 className={styles.panelTitle}>Loading dashboard...</h1>
      </section>
    </div>
  );
}
