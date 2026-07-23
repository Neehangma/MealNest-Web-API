"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import styles from "../admin.module.css";
import { createRestaurantAction, deleteRestaurantAction, getAdminRestaurantsAction, updateRestaurantAction } from "@/lib/actions/admin/restaurant-action";
import type { AdminRestaurant, RestaurantsResponse } from "@/lib/api/admin";
import { getRestaurantImage, RESTAURANT_FALLBACK_IMAGE } from "@/lib/restaurant-image";
import DeleteConfirmationModal from "../_components/DeleteConfirmationModal";
import ConfirmationModal from "../_components/ConfirmationModal";
import { isPhoneNumberValid, PHONE_VALIDATION_MESSAGE, sanitizePhoneNumber } from "@/lib/phone-validation";
import { RESERVATION_TIME_SLOTS } from "@/lib/reservation-time";

const CUISINES = ["Italian", "Japanese", "Indian", "Chinese", "Thai", "Korean", "Nepali"];
const PRICE_RANGES = ["Rs. 150–300", "Rs. 300–500", "Rs. 500–800"];

type FormState = {
  name: string; cuisine: string; description: string; image: string; location: string;
  priceRange: string; openingTime: string; closingTime: string;
  address: string; phone: string; features: string;
};
type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = { name: "", cuisine: "", description: "", image: "", location: "", priceRange: "", openingTime: "11:00 AM", closingTime: "10:00 PM", address: "", phone: "", features: "" };
const EMPTY_META: RestaurantsResponse["meta"] = { page: 1, limit: 10, total: 0, totalPages: 0, availableTotal: 0, cuisineTypes: 0 };

function editForm(restaurant: AdminRestaurant): FormState {
  const times = restaurant.hours?.match(/:\s*(.+?)\s*-\s*(.+)$/);
  const priceRange = PRICE_RANGES.includes(restaurant.priceRange)
    ? restaurant.priceRange
    : restaurant.price && restaurant.price <= 300
      ? PRICE_RANGES[0]
      : restaurant.price && restaurant.price > 500
        ? PRICE_RANGES[2]
        : PRICE_RANGES[1];
  return { name: restaurant.name, cuisine: restaurant.cuisine, description: restaurant.description || "", image: restaurant.image || "", location: restaurant.location, priceRange, openingTime: times?.[1] || "11:00 AM", closingTime: times?.[2] || "10:00 PM", address: restaurant.address || "", phone: restaurant.phone || "", features: (restaurant.features || []).join(", ") };
}

function payload(form: FormState, imageFile: File | null) {
  const data = new FormData();
  data.append("name", form.name.trim()); data.append("cuisine", form.cuisine); data.append("location", form.location.trim());
  data.append("priceRange", form.priceRange); data.append("openingTime", form.openingTime.trim()); data.append("closingTime", form.closingTime.trim());
  data.append("address", form.address.trim()); data.append("phone", form.phone.trim());
  data.append("description", form.description.trim()); data.append("menuFeatures", form.features.trim());
  data.append("availableTimeSlots", JSON.stringify(RESERVATION_TIME_SLOTS));
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [editing, setEditing] = useState<AdminRestaurant | "new" | null>(null);
  const [confirmingCreate, setConfirmingCreate] = useState(false);
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
  function openCreate() { clearPreview(); setEditing("new"); setForm(EMPTY_FORM); setFormError(""); setFieldErrors({}); setSuccessMessage(""); setConfirmingCreate(false); }
  function openEdit(restaurant: AdminRestaurant) { clearPreview(); setEditing(restaurant); setForm(editForm(restaurant)); setImagePreview(getRestaurantImage(restaurant.image)); setFormError(""); setFieldErrors({}); }
  function closeForm() { if (!submitting) { clearPreview(); setEditing(null); setFormError(""); setFieldErrors({}); setConfirmingCreate(false); } }

  useEffect(() => () => { if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) { setFormError("Please select a JPG, PNG, or WEBP image."); event.target.value = ""; return; }
    if (file.size > 5 * 1024 * 1024) { setFormError("Image must be smaller than 5 MB."); event.target.value = ""; return; }
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file); setImagePreview(URL.createObjectURL(file)); setFormError("");
  }

  function updateFormField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validateForm() {
    const errors: FieldErrors = {};
    if (!form.name.trim()) errors.name = "Restaurant name is required.";
    if (!CUISINES.includes(form.cuisine)) errors.cuisine = "Please select a supported cuisine.";
    if (!form.location.trim()) errors.location = "Location is required.";
    if (!PRICE_RANGES.includes(form.priceRange)) errors.priceRange = "Please select a price range.";
    if (!form.openingTime.trim()) errors.openingTime = "Opening time is required.";
    if (!form.closingTime.trim()) errors.closingTime = "Closing time is required.";
    if (!form.address.trim()) errors.address = "Address is required.";
    if (!form.phone.trim()) errors.phone = "Phone is required.";
    else if (!isPhoneNumberValid(form.phone)) errors.phone = PHONE_VALIDATION_MESSAGE;
    setFieldErrors(errors);

    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      window.setTimeout(() => {
        const input = document.querySelector<HTMLElement>(`[name="${firstInvalid}"]`);
        input?.focus();
        input?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
    }
    return !firstInvalid;
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editing === "new") {
      setFormError("");
      if (!validateForm()) return;
      setConfirmingCreate(true);
      return;
    }
    void persistRestaurant();
  }

  async function persistRestaurant() {
    if (submitting) return;
    if (!validateForm()) { setConfirmingCreate(false); return; }
    setSubmitting(true); setFormError("");
    try {
      if (editing === "new") {
        const result = await createRestaurantAction(payload(form, imageFile));
        if (!result.success) throw new Error(result.message);
      }
      else if (editing) await updateRestaurantAction(editing._id, payload(form, imageFile));
      const wasNew = editing === "new";
      clearPreview(); setConfirmingCreate(false); setEditing(null);
      if (wasNew) setSuccessMessage("Restaurant added successfully.");
      await load(wasNew ? 1 : page);
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
        <div className={styles.pageHeading}><div><p className={styles.eyebrow}>Restaurant directory</p><h1>Admin Restaurant Management</h1><p className={styles.subtitle}>View, search, create, edit, and delete MealNest restaurants.</p></div></div>

        <div className={styles.statsGrid}>
          {[ ["Total Restaurants", meta.total], ["Available Restaurants", meta.availableTotal], ["Cuisine Types", CUISINES.length], ["Current Page", meta.page || 1] ].map(([label, value]) => <article key={label} className={`${styles.card} ${styles.statCard}`}><div><p className={styles.statLabel}>{label}</p><p className={styles.statValue}>{value}</p></div></article>)}
        </div>

        <section className={`${styles.card} ${styles.panel}`}>
          <div className={styles.panelHeader}><div><h2 className={styles.panelTitle}>Restaurants</h2><p className={styles.tableMeta}>Showing {from}–{to} of {meta.total}</p></div><button className={styles.dateButton} type="button" onClick={openCreate}>＋ New Restaurant</button></div>
          <div className={styles.restaurantFilters}>
            <select value={cuisine} onChange={(event) => { setCuisine(event.target.value); setPage(1); }}><option value="">All cuisines</option>{CUISINES.map((item) => <option key={item}>{item}</option>)}</select>
            <select value={available} onChange={(event) => { setAvailable(event.target.value as typeof available); setPage(1); }}><option value="">All availability</option><option value="true">Available</option><option value="false">Unavailable</option></select>
            <select value={meta.limit} onChange={(event) => { setMeta((current) => ({ ...current, limit: Number(event.target.value) })); setPage(1); }}><option value="10">10 per page</option><option value="20">20 per page</option><option value="50">50 per page</option></select>
          </div>
          {successMessage && <div className={styles.successBanner} role="status">{successMessage}</div>}
          {error && <div className={styles.errorBanner}>{error}</div>}
          <div className={styles.tableWrap}><table className={styles.usersTable}><thead><tr><th>Image</th><th>Restaurant Name</th><th>Cuisine</th><th>Location</th><th>Availability</th><th>Created Date</th><th>Actions</th></tr></thead><tbody>
            {loading ? <tr><td colSpan={7}><div className={styles.emptyState}>Loading restaurants…</div></td></tr> : error ? <tr><td colSpan={7}><div className={styles.emptyState}>Unable to display restaurants.</div></td></tr> : restaurants.length === 0 ? <tr><td colSpan={7}><div className={styles.emptyState}>No restaurants found.</div></td></tr> : restaurants.map((restaurant) => <tr key={restaurant._id}>
              <td><Image unoptimized src={getRestaurantImage(restaurant.image)} alt={restaurant.name} width={58} height={44} className={styles.restaurantThumbnail} /></td>
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

    {editing && <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="restaurant-form-title"><section className={`${styles.modal} ${styles.restaurantModal}`}><div className={styles.modalHeader}><h2 id="restaurant-form-title">{editing === "new" ? "Create Restaurant" : "Edit Restaurant"}</h2><button className={styles.iconButton} type="button" aria-label="Close" onClick={closeForm}>×</button></div><form className={styles.formGrid} onSubmit={save} noValidate>
      <label className={styles.field}>Restaurant name<input name="name" className={styles.inputControl} required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "name-error" : undefined} value={form.name} onChange={(e) => updateFormField("name", e.target.value)} />{fieldErrors.name && <small id="name-error" className={styles.fieldError}>{fieldErrors.name}</small>}</label>
      <label className={styles.field}>Cuisine<select name="cuisine" className={styles.selectControl} required aria-invalid={Boolean(fieldErrors.cuisine)} aria-describedby={fieldErrors.cuisine ? "cuisine-error" : undefined} value={form.cuisine} onChange={(e) => updateFormField("cuisine", e.target.value)}><option value="">Select cuisine</option>{CUISINES.map((item) => <option key={item} value={item}>{item}</option>)}</select>{fieldErrors.cuisine && <small id="cuisine-error" className={styles.fieldError}>{fieldErrors.cuisine}</small>}</label>
      <label className={styles.field}>Location<input name="location" className={styles.inputControl} required aria-invalid={Boolean(fieldErrors.location)} aria-describedby={fieldErrors.location ? "location-error" : undefined} value={form.location} onChange={(e) => updateFormField("location", e.target.value)} />{fieldErrors.location && <small id="location-error" className={styles.fieldError}>{fieldErrors.location}</small>}</label>
      <label className={styles.field}>Price range<select name="priceRange" className={styles.selectControl} required aria-invalid={Boolean(fieldErrors.priceRange)} aria-describedby={fieldErrors.priceRange ? "price-range-error" : undefined} value={form.priceRange} onChange={(e) => updateFormField("priceRange", e.target.value)}><option value="">Select price range</option>{PRICE_RANGES.map((range) => <option key={range} value={range}>{range}</option>)}</select>{fieldErrors.priceRange && <small id="price-range-error" className={styles.fieldError}>{fieldErrors.priceRange}</small>}</label>
      <label className={`${styles.field} ${styles.fullField}`}>Restaurant image<input className={styles.fileControl} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleImageChange} /><span className={styles.selectedFileName}>{imageFile?.name || (editing !== "new" && form.image ? "Current image (choose a file to replace)" : "No image selected")}</span>{imagePreview && <span className={styles.restaurantImagePreview}><img src={imagePreview} alt="Restaurant preview" /></span>}</label>
      <label className={styles.field}>Opening time<input name="openingTime" className={styles.inputControl} required aria-invalid={Boolean(fieldErrors.openingTime)} aria-describedby={fieldErrors.openingTime ? "opening-time-error" : undefined} value={form.openingTime} onChange={(e) => updateFormField("openingTime", e.target.value)} />{fieldErrors.openingTime && <small id="opening-time-error" className={styles.fieldError}>{fieldErrors.openingTime}</small>}</label>
      <label className={styles.field}>Closing time<input name="closingTime" className={styles.inputControl} required aria-invalid={Boolean(fieldErrors.closingTime)} aria-describedby={fieldErrors.closingTime ? "closing-time-error" : undefined} value={form.closingTime} onChange={(e) => updateFormField("closingTime", e.target.value)} />{fieldErrors.closingTime && <small id="closing-time-error" className={styles.fieldError}>{fieldErrors.closingTime}</small>}</label>
      <label className={styles.field}>Address<input name="address" className={styles.inputControl} required aria-invalid={Boolean(fieldErrors.address)} aria-describedby={fieldErrors.address ? "address-error" : undefined} value={form.address} onChange={(e) => updateFormField("address", e.target.value)} />{fieldErrors.address && <small id="address-error" className={styles.fieldError}>{fieldErrors.address}</small>}</label>
      <label className={styles.field}>Phone<input name="phone" className={`${styles.inputControl} ${fieldErrors.phone ? "phone-input-invalid" : ""}`} type="tel" inputMode="numeric" maxLength={10} required aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "phone-error" : undefined} value={form.phone} onChange={(e) => updateFormField("phone", sanitizePhoneNumber(e.target.value))} />{fieldErrors.phone && <small id="phone-error" className={styles.fieldError}>{fieldErrors.phone}</small>}</label>
      <label className={`${styles.field} ${styles.fullField}`}>Description<textarea className={styles.inputControl} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label className={`${styles.field} ${styles.fullField}`}>Menu/features (comma separated)<input className={styles.inputControl} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} /></label>
      {formError && <div className={`${styles.errorBanner} ${styles.fullField}`}>{formError}</div>}<div className={`${styles.modalActions} ${styles.fullField}`}><button className={styles.secondaryButton} type="button" onClick={closeForm}>Cancel</button><button className={styles.primaryButton} type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save Restaurant"}</button></div>
    </form></section></div>}

    <ConfirmationModal open={confirmingCreate} title="Add Restaurant" message="Do you want to add this restaurant?" confirming={submitting} onNo={() => { if (!submitting) setConfirmingCreate(false); }} onYes={() => void persistRestaurant()} />

    <DeleteConfirmationModal open={Boolean(deleteTarget)} title="Delete Restaurant" name={deleteTarget?.name || "this restaurant"} message="This removes it from both admin and user dashboards." confirmLabel="Delete Restaurant" deleting={submitting} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} />
  </div>;
}
