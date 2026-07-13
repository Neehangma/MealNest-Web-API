export function formatDateInput(dateValue?: string) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function formatDisplayDate(dateValue?: string) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export type StatusTone = "confirmed" | "pending" | "cancelled" | "completed";

export function statusToneOf(status?: string): StatusTone {
  const value = (status || "").toLowerCase();
  if (value === "pending") return "pending";
  if (value === "cancelled") return "cancelled";
  if (value === "completed") return "completed";
  return "confirmed";
}

export function statusLabelOf(status?: string) {
  const value = (status || "confirmed").toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}
