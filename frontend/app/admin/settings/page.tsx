"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import type { AuthUser } from "@/lib/api/auth";
import { getAdminProfileAction, updateAdminProfileAction } from "@/lib/actions/admin/profile-action";
import { getRestaurantImage } from "@/lib/restaurant-image";
import styles from "../admin.module.css";

type FormState = { fullName: string; email: string; phoneNumber: string };
const EMPTY = { fullName: "", email: "", phoneNumber: "" };

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState | "image", string>>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    getAdminProfileAction().then(({ admin: value }) => setAdmin(value)).catch(() => setError("Unable to load profile.")).finally(() => setLoading(false));
  }, []);
  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  function initials(user: AuthUser) { return (user.fullName || user.email || "A").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }
  function openEdit() {
    if (!admin) return;
    setForm({ fullName: admin.fullName || "", email: admin.email, phoneNumber: admin.phoneNumber || "" });
    setPreview(admin.profilePicture ? getRestaurantImage(admin.profilePicture) : ""); setImageFile(null); setFieldErrors({}); setError(""); setEditing(true);
  }
  function closeEdit() { if (!saving) { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); setEditing(false); setPreview(""); setImageFile(null); setFieldErrors({}); } }
  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) { setFieldErrors((value) => ({ ...value, image: "Select a JPG, PNG, or WEBP image." })); event.target.value = ""; return; }
    if (file.size > 5 * 1024 * 1024) { setFieldErrors((value) => ({ ...value, image: "Image must be smaller than 5 MB." })); event.target.value = ""; return; }
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setImageFile(file); setPreview(URL.createObjectURL(file)); setFieldErrors((value) => ({ ...value, image: undefined }));
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    const errors: typeof fieldErrors = {};
    if (!form.fullName.trim()) errors.fullName = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email address.";
    if (form.phoneNumber.trim() && !/^[0-9+()\-\s]{7,20}$/.test(form.phoneNumber.trim())) errors.phoneNumber = "Enter a valid phone number.";
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    const data = new FormData(); data.append("fullName", form.fullName.trim()); data.append("email", form.email.trim().toLowerCase()); data.append("phoneNumber", form.phoneNumber.trim()); if (imageFile) data.append("profileImage", imageFile);
    try {
      setSaving(true); setError("");
      const response = await updateAdminProfileAction(data); setAdmin(response.admin); setEditing(false); setSuccess(true);
      window.localStorage.setItem("user", JSON.stringify(response.admin));
      window.dispatchEvent(new CustomEvent("admin-profile-updated", { detail: response.admin }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save profile changes."); }
    finally { setSaving(false); }
  }

  return <main className={styles.sharedPage}><section className={styles.content}>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>Administrator account</p><h1>Admin Profile</h1><p className={styles.subtitle}>View and manage your administrator account information.</p></div></div>
    {loading && <div className={styles.profileLoading}>Loading profile...</div>}
    {error && !admin && <div className={styles.errorBanner}>Unable to load profile.</div>}
    {admin && <article className={styles.adminProfileCard}>
      <header><h2>My Profile</h2><button type="button" className={styles.primaryButton} onClick={openEdit}>Edit Profile</button></header>
      <div className={styles.adminProfileAvatar}>{admin.profilePicture ? <img src={getRestaurantImage(admin.profilePicture)} alt={`${admin.fullName || "Admin"} profile`} /> : <span>{initials(admin)}</span>}</div>
      <div className={styles.adminProfileFields}><div><span>Full Name</span><strong>{admin.fullName || "Not provided"}</strong></div><div><span>Email</span><strong>{admin.email}</strong></div>{admin.phoneNumber && <div><span>Phone</span><strong>{admin.phoneNumber}</strong></div>}</div>
      <footer><div><span>Account Type</span><strong>Admin</strong></div><div><span>Member Since</span><strong>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "N/A"}</strong></div></footer>
    </article>}
    {error && admin && <div className={styles.errorBanner}>{error}</div>}
  </section>

  {editing && admin && <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="edit-admin-profile"><section className={`${styles.modal} ${styles.restaurantModal}`}><div className={styles.modalHeader}><h2 id="edit-admin-profile">Edit Profile</h2><button type="button" className={styles.iconButton} aria-label="Close" onClick={closeEdit}>×</button></div><form className={styles.formGrid} onSubmit={save}>
    <label className={styles.field}>Full name<input className={styles.inputControl} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })}/>{fieldErrors.fullName && <small className={styles.fieldError}>{fieldErrors.fullName}</small>}</label>
    <label className={styles.field}>Email<input className={styles.inputControl} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })}/>{fieldErrors.email && <small className={styles.fieldError}>{fieldErrors.email}</small>}</label>
    <label className={`${styles.field} ${styles.fullField}`}>Phone<input className={styles.inputControl} inputMode="tel" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}/>{fieldErrors.phoneNumber && <small className={styles.fieldError}>{fieldErrors.phoneNumber}</small>}</label>
    <label className={`${styles.field} ${styles.fullField}`}>Profile image<input className={styles.fileControl} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={selectImage}/><span className={styles.selectedFileName}>{imageFile?.name || (admin.profilePicture ? "Current image (choose a file to replace)" : "No image selected")}</span>{fieldErrors.image && <small className={styles.fieldError}>{fieldErrors.image}</small>}{preview ? <span className={styles.profileEditPreview}><img src={preview} alt="Profile preview"/></span> : <span className={styles.profileEditFallback}>{initials(admin)}</span>}</label>
    {error && <div className={`${styles.errorBanner} ${styles.fullField}`}>{error}</div>}<div className={`${styles.modalActions} ${styles.fullField}`}><button type="button" className={styles.secondaryButton} onClick={closeEdit} disabled={saving}>Cancel</button><button type="submit" className={styles.primaryButton} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button></div>
  </form></section></div>}

  {success && admin && <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="profile-updated-title"><section className={styles.profileSuccessModal}><div className={styles.profileSuccessIcon}>✓</div><h2 id="profile-updated-title">Profile Updated</h2><p>Your profile changes have been saved successfully.</p><div><span>Name</span><strong>{admin.fullName}</strong><span>Email</span><strong>{admin.email}</strong></div><button type="button" className={styles.primaryButton} onClick={() => setSuccess(false)}>Done</button></section></div>}
  </main>;
}
