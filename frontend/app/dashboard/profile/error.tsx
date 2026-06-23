"use client";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <div className="dashboard-heading">
          <p>Profile</p>
          <h1>Something went wrong</h1>
        </div>
        <p className="form-message error">{error.message}</p>
        <button type="button" onClick={reset}>
          Try Again
        </button>
      </section>
    </main>
  );
}
