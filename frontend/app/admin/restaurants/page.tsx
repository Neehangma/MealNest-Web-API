"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import styles from "../admin.module.css";
import { createRestaurantAction, deleteRestaurantAction, getAdminRestaurantsAction, updateRestaurantAction } from "@/lib/actions/admin/restaurant-action";
import type { AdminRestaurant, RestaurantsResponse } from "@/lib/api/admin";
import { getRestaurantImage, RESTAURANT_FALLBACK_IMAGE } from "@/lib/restaurant-image";
import DeleteConfirmationModal from "../_components/DeleteConfirmationModal";

const CUISINES = ["Italian", "Japanese", "Indian", "Chinese", "Thai", "Korean", "Nepali"];
const SLOTS = ["11:00 AM", "12:30 PM", "2:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"];

type FormState = {
  name: string; cuisine: string; description: string; image: string; location: string;
  priceRange: string; openingTime: string; closingTime: string;
  address: string; phone: string; features: string;
};

const EMPTY_FORM: FormState = { name: "", cuisine: "", description: "", image: "", location: "", priceRange: "", openingTime: "11:00 AM", closingTime: "10:00 PM", address: "", phone: "", features: "" };
const EMPTY_META: RestaurantsResponse["meta"] = { page: 1, limit: 10, total: 0, totalPages: 0, availableTotal: 0, cuisineTypes: 0 };

function editForm(restaurant: AdminRestaurant): FormState {
  const times = restaurant.hours?.match(/:\s*(.+?)\s*-\s*(.+)$/);
  return { name: restaurant.name, cuisine: restaurant.cuisine, description: restaurant.description || "", image: restaurant.image || "", location: restaurant.location, priceRange: restaurant.priceRange || "", openingTime: times?.[1] || "11:00 AM", closingTime: times?.[2] || "10:00 PM", address: restaurant.address || restaurant.location, phone: restaurant.phone || "", features: (restaurant.features || []).join(", ") };
}

function payload(form: FormState, imageFile: File | null) {
  const data = new FormData();
  data.append("name", form.name.trim()); data.append("cuisine", form.cuisine); data.append("location", form.location.trim());
  data.append("priceRange", form.priceRange); data.append("hours", `Mon-Sun: ${form.openingTime} - ${form.closingTime}`);
  data.append("address", form.address.trim() || form.location.trim()); data.append("phone", form.phone.trim() || "+977 1-0000000");
  data.append("description", form.description.trim()); data.append("features", form.features);
  data.append("availableTimeSlots", JSON.stringify(SLOTS));
  if (imageFile) data.append("image", imageFile);
  return data;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

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

  function clearPreview() { if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview); setImagePreview(""); setImageFile(null); }
  function openCreate() { clearPreview(); setEditing("new"); setForm(EMPTY_FORM); setFormError(""); }
  function openEdit(restaurant: AdminRestaurant) { clearPreview(); setEditing(restaurant); setForm(editForm(restaurant)); setImagePreview(getRestaurantImage(restaurant.image)); setFormError(""); }
  function closeForm() { if (!submitting) { clearPreview(); setEditing(null); setFormError(""); } }

  useEffect(() => () => { if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) { setFormError("Please select a JPG, PNG, or WEBP image."); event.target.value = ""; return; }
    if (file.size > 5 * 1024 * 1024) { setFormError("Image must be smaller than 5 MB."); event.target.value = ""; return; }
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file); setImagePreview(URL.createObjectURL(file)); setFormError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !CUISINES.includes(form.cuisine) || !form.location.trim() || !form.priceRange || !form.openingTime.trim() || !form.closingTime.trim()) { setFormError("Name, supported cuisine, location, price range, opening time, and closing time are required."); return; }
    setSubmitting(true); setFormError("");
    try {
      if (editing === "new") await createRestaurantAction(payload(form, imageFile));
      else if (editing) await updateRestaurantAction(editing._id, payload(form, imageFile));
      clearPreview(); setEditing(null); await load(editing === "new" ? 1 : page);
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
    <main className={styles.main}>
      <header className={styles.topbar}><div className={styles.search}><span>⌕</span><input className={styles.searchInput} type="search" placeholder="Search by name or location..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></header>
      <section className={styles.content}>
        <div className={styles.pageHeading}><div><p className={styles.eyebrow}>Restaurant directory</p><h1>Admin Restaurant Management</h1><p className={styles.subtitle}>View, search, create, edit, and delete MealNest restaurants.</p></div><button className={styles.dateButton} type="button" onClick={openCreate}>＋ New Restaurant</button></div>

        <div className={styles.statsGrid}>
          {[ ["Total Restaurants", meta.total], ["Available Restaurants", meta.availableTotal], ["Cuisine Types", CUISINES.length], ["Current Page", meta.page || 1] ].map(([label, value]) => <article key={label} className={`${styles.card} ${styles.statCard}`}><div><p className={styles.statLabel}>{label}</p><p className={styles.statValue}>{value}</p></div></article>)}
        </div>

        <section className={`${styles.card} ${styles.panel}`}>
          <div className={styles.restaurantFilters}>
            <select value={cuisine} onChange={(event) => { setCuisine(event.target.value); setPage(1); }}><option value="">All cuisines</option>{CUISINES.map((item) => <option key={item}>{item}</option>)}</select>
            <select value={available} onChange={(event) => { setAvailable(event.target.value as typeof available); setPage(1); }}><option value="">All availability</option><option value="true">Available</option><option value="false">Unavailable</option></select>
            <select value={meta.limit} onChange={(event) => { setMeta((current) => ({ ...current, limit: Number(event.target.value) })); setPage(1); }}><option value="10">10 per page</option><option value="20">20 per page</option><option value="50">50 per page</option></select>
          </div>
          <div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Restaurants</h2><p className={styles.tableMeta}>Showing {from}–{to} of {meta.total}</p></div></div>
          {error && <div className={styles.errorBanner}>{error}</div>}
          <div className={styles.tableWrap}><table className={styles.usersTable}><thead><tr><th>Image</th><th>Restaurant Name</th><th>Cuisine</th><th>Location</th><th>Availability</th><th>Created Date</th><th>Actions</th></tr></thead><tbody>
            {loading ? <tr><td colSpan={7}><div className={styles.emptyState}>Loading restaurants…</div></td></tr> : error ? <tr><td colSpan={7}><div className={styles.emptyState}>Unable to display restaurants.</div></td></tr> : restaurants.length === 0 ? <tr><td colSpan={7}><div className={styles.emptyState}>No restaurants found.</div></td></tr> : restaurants.map((restaurant) => <tr key={restaurant._id}>
              <td><Image src={getRestaurantImage(restaurant.image)} alt={restaurant.name} width={58} height={44} className={styles.restaurantThumbnail} /></td>
              <td><strong>{restaurant.name}</strong></td><td>{restaurant.cuisine}</td><td>{restaurant.location}</td>
              <td><span className={`${styles.pill} ${restaurant.isOpen ? styles.pillUser : styles.pillAdmin}`}>{restaurant.isOpen ? "Available" : "Unavailable"}</span></td>
              <td>{restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleDateString() : "N/A"}</td>
              <td><div className={styles.actions}><button className={styles.tableAction} type="button" aria-label={`Edit ${restaurant.name}`} onClick={() => openEdit(restaurant)}>✎</button><button className={`${styles.tableAction} ${styles.dangerAction}`} type="button" aria-label={`Delete ${restaurant.name}`} title="Delete restaurant" onClick={() => setDeleteTarget(restaurant)}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg></button></div></td>
            </tr>)}
          </tbody></table></div>
          <div className={styles.pagination}><button className={styles.pageButton} type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {meta.page || 1} of {meta.totalPages || 1}</span><button className={styles.pageButton} type="button" disabled={page >= meta.totalPages || loading || meta.totalPages === 0} onClick={() => setPage((current) => current + 1)}>Next</button></div>
        </section>
      </section>
    </main>

    {editing && <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="restaurant-form-title"><section className={`${styles.modal} ${styles.restaurantModal}`}><div className={styles.modalHeader}><h2 id="restaurant-form-title">{editing === "new" ? "Create Restaurant" : "Edit Restaurant"}</h2><button className={styles.iconButton} type="button" aria-label="Close" onClick={closeForm}>×</button></div><form className={styles.formGrid} onSubmit={save}>
      <label className={styles.field}>Restaurant name<input className={styles.inputControl} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label className={styles.field}>Cuisine<select className={styles.selectControl} required value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })}><option value="">Select cuisine</option>{CUISINES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label className={styles.field}>Location<input className={styles.inputControl} required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
      <label className={styles.field}>Price range<input className={styles.inputControl} required placeholder="Enter a price or range" value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })} /></label>
      <label className={`${styles.field} ${styles.fullField}`}>Restaurant image<input className={styles.fileControl} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleImageChange} /><span className={styles.selectedFileName}>{imageFile?.name || (editing !== "new" && form.image ? "Current image (choose a file to replace)" : "No image selected")}</span>{imagePreview && <span className={styles.restaurantImagePreview}><img src={imagePreview} alt="Restaurant preview" /></span>}</label>
      <label className={styles.field}>Opening time<input className={styles.inputControl} required value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} /></label>
      <label className={styles.field}>Closing time<input className={styles.inputControl} required value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} /></label>
      <label className={styles.field}>Address<input className={styles.inputControl} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
      <label className={styles.field}>Phone<input className={styles.inputControl} inputMode="tel" pattern="[0-9+()\-\s]{7,20}" title="Enter a valid phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label className={`${styles.field} ${styles.fullField}`}>Description<textarea className={styles.inputControl} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label className={`${styles.field} ${styles.fullField}`}>Menu/features (comma separated)<input className={styles.inputControl} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} /></label>
      {formError && <div className={`${styles.errorBanner} ${styles.fullField}`}>{formError}</div>}<div className={`${styles.modalActions} ${styles.fullField}`}><button className={styles.secondaryButton} type="button" onClick={closeForm}>Cancel</button><button className={styles.primaryButton} type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save Restaurant"}</button></div>
    </form></section></div>}

    <DeleteConfirmationModal open={Boolean(deleteTarget)} title="Delete Restaurant" name={deleteTarget?.name || "this restaurant"} message="This removes it from both admin and user dashboards." confirmLabel="Delete Restaurant" deleting={submitting} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} />
  </div>;
}
