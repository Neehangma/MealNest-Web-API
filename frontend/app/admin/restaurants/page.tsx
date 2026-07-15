"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import styles from "../admin.module.css";
import { createRestaurantAction, deleteRestaurantAction, getAdminRestaurantsAction, updateRestaurantAction } from "@/lib/actions/admin/restaurant-action";
import type { AdminRestaurant, RestaurantPayload, RestaurantsResponse } from "@/lib/api/admin";

const NAV = [
  ["Dashboard", "/admin"], ["Users", "/admin/users"], ["Restaurants", "/admin/restaurants"], ["Bookings", "/admin/booking"],
];
const CUISINES = ["Nepali", "Italian", "French", "Korean", "Japanese", "Indian", "Thai", "Chinese", "Mediterranean", "Mexican", "Contemporary"];
const SLOTS = ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"];

type FormState = {
  name: string; cuisine: string; description: string; image: string; location: string; rating: string;
  priceRange: "$" | "$$" | "$$$" | "$$$$"; openingTime: string; closingTime: string;
  isOpen: boolean; featured: boolean; address: string; phone: string; features: string;
};

const EMPTY_FORM: FormState = { name: "", cuisine: "Italian", description: "", image: "/images/Register.jpg", location: "", rating: "4.5", priceRange: "$$", openingTime: "11:00 AM", closingTime: "10:00 PM", isOpen: true, featured: false, address: "", phone: "", features: "" };
const EMPTY_META: RestaurantsResponse["meta"] = { page: 1, limit: 10, total: 0, totalPages: 0, availableTotal: 0, cuisineTypes: 0 };

function editForm(restaurant: AdminRestaurant): FormState {
  const times = restaurant.hours?.match(/:\s*(.+?)\s*-\s*(.+)$/);
  return { name: restaurant.name, cuisine: restaurant.cuisine, description: restaurant.description || "", image: restaurant.image || "/images/Register.jpg", location: restaurant.location, rating: String(restaurant.rating), priceRange: restaurant.priceRange || "$$", openingTime: times?.[1] || "11:00 AM", closingTime: times?.[2] || "10:00 PM", isOpen: restaurant.isOpen, featured: restaurant.featured, address: restaurant.address || restaurant.location, phone: restaurant.phone || "", features: (restaurant.features || []).join(", ") };
}

function payload(form: FormState): RestaurantPayload {
  return { name: form.name.trim(), cuisine: form.cuisine.trim(), description: form.description.trim(), image: form.image.trim(), location: form.location.trim(), rating: Number(form.rating), priceRange: form.priceRange, isActive: true, isOpen: form.isOpen, featured: form.featured, address: form.address.trim() || form.location.trim(), phone: form.phone.trim() || "+977 1-0000000", hours: `Mon-Sun: ${form.openingTime} - ${form.closingTime}`, availableTimeSlots: SLOTS, features: form.features.split(",").map((item) => item.trim()).filter(Boolean) };
}

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [available, setAvailable] = useState<"" | "true" | "false">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editing, setEditing] = useState<AdminRestaurant | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminRestaurant | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => { const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 350); return () => window.clearTimeout(timer); }, [search]);

  async function load(nextPage = page) {
    setLoading(true); setError("");
    try {
      const response = await getAdminRestaurantsAction({ page: nextPage, limit: meta.limit, search: debouncedSearch || undefined, cuisine: cuisine || undefined, available: available || undefined });
      setRestaurants(response.data); setMeta(response.meta); setPage(response.meta.page);
    } catch (reason) {
      setRestaurants([]); setError(reason instanceof Error ? reason.message : "Unable to load restaurants");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(page); }, [page, meta.limit, debouncedSearch, cuisine, available]); // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() { setEditing("new"); setForm(EMPTY_FORM); setFormError(""); }
  function openEdit(restaurant: AdminRestaurant) { setEditing(restaurant); setForm(editForm(restaurant)); setFormError(""); }
  function closeForm() { if (!submitting) { setEditing(null); setFormError(""); } }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.cuisine.trim() || !form.location.trim() || !form.description.trim()) { setFormError("Name, cuisine, location, and description are required."); return; }
    setSubmitting(true); setFormError("");
    try {
      if (editing === "new") await createRestaurantAction(payload(form));
      else if (editing) await updateRestaurantAction(editing._id, payload(form));
      setEditing(null); await load(editing === "new" ? 1 : page);
    } catch (reason) { setFormError(reason instanceof Error ? reason.message : "Unable to save restaurant"); }
    finally { setSubmitting(false); }
  }

  async function remove() {
    if (!deleteTarget) return;
    setSubmitting(true); setError("");
    try { await deleteRestaurantAction(deleteTarget._id); setDeleteTarget(null); await load(restaurants.length === 1 && page > 1 ? page - 1 : page); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to delete restaurant"); }
    finally { setSubmitting(false); }
  }

  const from = meta.total ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta.total ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return <div className={styles.adminRoot}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><span className={styles.brandName}>MealNest</span><span className={styles.brandSub}>ADMIN</span></div>
      <nav className={styles.nav} aria-label="Admin navigation">
        {NAV.map(([label, href]) => <a key={label} href={href} className={`${styles.navItem} ${label === "Restaurants" ? styles.navActive : ""}`}><span aria-hidden>{label === "Dashboard" ? "▦" : label === "Users" ? "♙" : label === "Restaurants" ? "⌂" : "▣"}</span><span className={styles.navLabel}>{label}</span></a>)}
      </nav>
      <button type="button" className={styles.addButton} onClick={openCreate}>＋ Add New Restaurant</button>
    </aside>

    <main className={styles.main}>
      <header className={styles.topbar}><div className={styles.search}><span>⌕</span><input className={styles.searchInput} type="search" placeholder="Search by name or location..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></header>
      <section className={styles.content}>
        <div className={styles.pageHeading}><div><p className={styles.eyebrow}>Restaurant directory</p><h1>Admin Restaurant Management</h1><p className={styles.subtitle}>View, search, create, edit, and delete MealNest restaurants.</p></div><button className={styles.dateButton} type="button" onClick={openCreate}>＋ New Restaurant</button></div>

        <div className={styles.statsGrid}>
          {[ ["Total Restaurants", meta.total], ["Available Restaurants", meta.availableTotal], ["Cuisine Types", meta.cuisineTypes], ["Current Page", meta.page || 1] ].map(([label, value]) => <article key={label} className={`${styles.card} ${styles.statCard}`}><div><p className={styles.statLabel}>{label}</p><p className={styles.statValue}>{value}</p></div></article>)}
        </div>

        <section className={`${styles.card} ${styles.panel}`}>
          <div className={styles.restaurantFilters}>
            <select value={cuisine} onChange={(event) => { setCuisine(event.target.value); setPage(1); }}><option value="">All cuisines</option>{CUISINES.map((item) => <option key={item}>{item}</option>)}</select>
            <select value={available} onChange={(event) => { setAvailable(event.target.value as typeof available); setPage(1); }}><option value="">All availability</option><option value="true">Available</option><option value="false">Unavailable</option></select>
            <select value={meta.limit} onChange={(event) => { setMeta((current) => ({ ...current, limit: Number(event.target.value) })); setPage(1); }}><option value="10">10 per page</option><option value="20">20 per page</option><option value="50">50 per page</option></select>
          </div>
          <div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Restaurants</h2><p className={styles.tableMeta}>Showing {from}–{to} of {meta.total}</p></div></div>
          {error && <div className={styles.errorBanner}>{error}</div>}
          <div className={styles.tableWrap}><table className={styles.usersTable}><thead><tr><th>Image</th><th>Restaurant Name</th><th>Cuisine</th><th>Location</th><th>Rating</th><th>Availability</th><th>Created Date</th><th>Actions</th></tr></thead><tbody>
            {loading ? <tr><td colSpan={8}><div className={styles.emptyState}>Loading restaurants…</div></td></tr> : error ? <tr><td colSpan={8}><div className={styles.emptyState}>Unable to display restaurants.</div></td></tr> : restaurants.length === 0 ? <tr><td colSpan={8}><div className={styles.emptyState}>No restaurants found.</div></td></tr> : restaurants.map((restaurant) => <tr key={restaurant._id}>
              <td><Image src={restaurant.image || "/images/Register.jpg"} alt={restaurant.name} width={58} height={44} className={styles.restaurantThumbnail} /></td>
              <td><strong>{restaurant.name}</strong></td><td>{restaurant.cuisine}</td><td>{restaurant.location}</td><td>★ {restaurant.rating ?? "N/A"}</td>
              <td><span className={`${styles.pill} ${restaurant.isOpen ? styles.pillUser : styles.pillAdmin}`}>{restaurant.isOpen ? "Available" : "Unavailable"}</span></td>
              <td>{restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleDateString() : "N/A"}</td>
              <td><div className={styles.actions}><button className={styles.tableAction} type="button" aria-label={`Edit ${restaurant.name}`} onClick={() => openEdit(restaurant)}>✎</button><button className={`${styles.tableAction} ${styles.dangerAction}`} type="button" aria-label={`Delete ${restaurant.name}`} onClick={() => setDeleteTarget(restaurant)}>⌫</button></div></td>
            </tr>)}
          </tbody></table></div>
          <div className={styles.pagination}><button className={styles.pageButton} type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {meta.page || 1} of {meta.totalPages || 1}</span><button className={styles.pageButton} type="button" disabled={page >= meta.totalPages || loading || meta.totalPages === 0} onClick={() => setPage((current) => current + 1)}>Next</button></div>
        </section>
      </section>
    </main>

    {editing && <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="restaurant-form-title"><section className={`${styles.modal} ${styles.restaurantModal}`}><div className={styles.modalHeader}><h2 id="restaurant-form-title">{editing === "new" ? "Create Restaurant" : "Edit Restaurant"}</h2><button className={styles.iconButton} type="button" aria-label="Close" onClick={closeForm}>×</button></div><form className={styles.formGrid} onSubmit={save}>
      <label className={styles.field}>Restaurant name<input className={styles.inputControl} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label className={styles.field}>Cuisine<input className={styles.inputControl} list="cuisines" value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} /><datalist id="cuisines">{CUISINES.map((item) => <option key={item} value={item} />)}</datalist></label>
      <label className={styles.field}>Location<input className={styles.inputControl} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
      <label className={styles.field}>Image path<input className={styles.inputControl} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></label>
      <label className={styles.field}>Rating<input className={styles.inputControl} type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></label>
      <label className={styles.field}>Price range<select className={styles.selectControl} value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value as FormState["priceRange"] })}>{["$", "$$", "$$$", "$$$$"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className={styles.field}>Opening time<input className={styles.inputControl} value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} /></label>
      <label className={styles.field}>Closing time<input className={styles.inputControl} value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} /></label>
      <label className={styles.field}>Address<input className={styles.inputControl} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
      <label className={styles.field}>Phone<input className={styles.inputControl} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label className={`${styles.field} ${styles.fullField}`}>Description<textarea className={styles.inputControl} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label className={`${styles.field} ${styles.fullField}`}>Menu/features (comma separated)<input className={styles.inputControl} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} /></label>
      <label className={styles.checkboxField}><input type="checkbox" checked={form.isOpen} onChange={(e) => setForm({ ...form, isOpen: e.target.checked })} /> Available</label><label className={styles.checkboxField}><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
      {formError && <div className={`${styles.errorBanner} ${styles.fullField}`}>{formError}</div>}<div className={`${styles.modalActions} ${styles.fullField}`}><button className={styles.secondaryButton} type="button" onClick={closeForm}>Cancel</button><button className={styles.primaryButton} type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save Restaurant"}</button></div>
    </form></section></div>}

    {deleteTarget && <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="delete-restaurant-title"><section className={styles.confirmModal}><h2 id="delete-restaurant-title">Delete Restaurant</h2><p>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This removes it from both admin and user dashboards.</p><div className={styles.modalActions}><button className={styles.secondaryButton} type="button" onClick={() => setDeleteTarget(null)} disabled={submitting}>Cancel</button><button className={styles.dangerButton} type="button" onClick={() => void remove()} disabled={submitting}>{submitting ? "Deleting…" : "Delete Restaurant"}</button></div></section></div>}
  </div>;
}
