"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { logoutAction } from "@/lib/actions/profile-action";

type LogoutContextValue = { requestLogout: (trigger?: HTMLElement | null) => void };
const LogoutContext = createContext<LogoutContextValue | null>(null);

export function useLogout() {
  const context = useContext(LogoutContext);
  if (!context) throw new Error("useLogout must be used within LogoutProvider");
  return context;
}

export default function LogoutProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const requestLogout = useCallback((trigger?: HTMLElement | null) => {
    returnFocusRef.current = trigger || (document.activeElement as HTMLElement | null);
    setSubmitting(false);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (submitting) return;
    setOpen(false);
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, [submitting]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== "Tab") return;
      const first = cancelRef.current;
      const last = confirmRef.current;
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, open]);

  return <LogoutContext.Provider value={{ requestLogout }}>
    {children}
    {open && <div className="profile-modal-overlay logout-confirmation-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
      <section className="profile-modal logout-confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="logout-confirmation-title" aria-describedby="logout-confirmation-message">
        <h2 id="logout-confirmation-title">Confirm Logout</h2>
        <p id="logout-confirmation-message">Are you sure you want to log out?</p>
        <div className="profile-modal-actions">
          <button ref={cancelRef} type="button" className="profile-modal-button secondary" onClick={closeModal} disabled={submitting}>Cancel</button>
          <form action={logoutAction} onSubmit={() => setSubmitting(true)}>
            <button ref={confirmRef} type="submit" className="profile-modal-button primary" disabled={submitting}>{submitting ? "Logging out..." : "Logout"}</button>
          </form>
        </div>
      </section>
    </div>}
  </LogoutContext.Provider>;
}
