import styles from "../admin.module.css";

export default function AdminSettingsPage() {
  return <main className={styles.sharedPage}><section className={styles.content}><div className={styles.pageHeading}><div><p className={styles.eyebrow}>System preferences</p><h1>Admin Settings</h1><p className={styles.subtitle}>Manage MealNest administration preferences.</p></div></div><section className={`${styles.card} ${styles.panel}`}><div className={styles.emptyState}>Settings options will appear here.</div></section></section></main>;
}
