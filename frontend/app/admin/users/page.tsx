"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  type PaginatedUsersResponse,
  type User,
} from "@/lib/api/admin";
import styles from "../admin.module.css";

type IconName =
  | "grid"
  | "users"
  | "store"
  | "calendar"
  | "star"
  | "settings"
  | "help"
  | "logout"
  | "menu"
  | "search"
  | "bell"
  | "chevron"
  | "wallet"
  | "arrow"
  | "plus"
  | "eye"
  | "edit"
  | "trash"
  | "close";

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "user" | "admin";
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: "user",
};

const navItems: { label: string; icon: IconName; active?: boolean; href: string }[] = [
  { label: "Dashboard", icon: "grid", href: "/admin" },
  { label: "Users", icon: "users", active: true, href: "/admin/users" },
  { label: "Restaurants", icon: "store", href: "/admin/restaurants" },
  { label: "Bookings", icon: "calendar", href: "/admin/bookings" },
  { label: "Reviews", icon: "star", href: "/admin/reviews" },
  { label: "Settings", icon: "settings", href: "/admin/settings" },
];

function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  return (
    <svg {...props}>
      {name === "grid" && (
        <>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </>
      )}
      {name === "users" && (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )}
      {name === "store" && (
        <>
          <path d="m3 9 2-5h14l2 5" />
          <path d="M5 9v10h14V9" />
          <path d="M8 13h3v6" />
          <path d="M13 13h3" />
          <path d="M3 9h18" />
        </>
      )}
      {name === "calendar" && (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
        </>
      )}
      {name === "star" && <path d="m12 2 3.1 6.3 6.9 1-5 4.8 1.2 6.8L12 17.7 5.8 21 7 14.1 2 9.3l6.9-1L12 2Z" />}
      {name === "settings" && (
        <>
          <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.4 7A2 2 0 1 1 7.2 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 20 7.2l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z" />
        </>
      )}
      {name === "help" && (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.1 9a3 3 0 1 1 5.8 1c-.6 1.4-2.1 1.7-2.6 2.8" />
          <path d="M12 17h.01" />
        </>
      )}
      {name === "logout" && (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </>
      )}
      {name === "menu" && (
        <>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
      {name === "search" && (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </>
      )}
      {name === "bell" && (
        <>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </>
      )}
      {name === "chevron" && <path d="m6 9 6 6 6-6" />}
      {name === "wallet" && (
        <>
          <path d="M20 7H5a2 2 0 0 0 0 4h15v8H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12v3" />
          <path d="M16 14h.01" />
        </>
      )}
      {name === "arrow" && (
        <>
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </>
      )}
      {name === "plus" && (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      )}
      {name === "eye" && (
        <>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
      {name === "edit" && (
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </>
      )}
      {name === "trash" && (
        <>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 15H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </>
      )}
      {name === "close" && (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      )}
    </svg>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function validateForm(form: FormState, mode: "create" | "edit") {
  if (!form.fullName.trim()) return "Name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
  if (mode === "create" && form.password.length < 6) return "Password must be at least 6 characters.";
  if (mode === "edit" && form.password && form.password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return "";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginatedUsersResponse["meta"]>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const adminCount = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");
        const response = await getUsers({
          page,
          limit: meta.limit,
          search: debouncedSearch || undefined,
        });

        if (!active) return;
        setUsers(response.data);
        setMeta(response.meta);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Failed to fetch users");
        setUsers([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, meta.limit]);

  async function refreshUsers(nextPage = page) {
    const response = await getUsers({
      page: nextPage,
      limit: meta.limit,
      search: debouncedSearch || undefined,
    });
    setUsers(response.data);
    setMeta(response.meta);
    setPage(response.meta.page);
  }

  function openCreateModal() {
    setForm(emptyForm);
    setSelectedUser(null);
    setFormError("");
    setModalMode("create");
  }

  function openEditModal(user: User) {
    setSelectedUser(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      password: "",
      role: user.role,
    });
    setFormError("");
    setModalMode("edit");
  }

  function closeFormModal() {
    setModalMode(null);
    setSelectedUser(null);
    setFormError("");
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modalMode) return;

    const validationError = validateForm(form, modalMode);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      if (modalMode === "create") {
        await createUser({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          password: form.password,
          role: form.role,
        });
        await refreshUsers(1);
      } else if (selectedUser) {
        await updateUser(selectedUser.id, {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim(),
          ...(form.password ? { password: form.password } : {}),
          role: form.role,
        });
        await refreshUsers();
      }

      closeFormModal();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Unable to save user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      setError("");
      await deleteUser(deleteTarget.id);
      const nextPage = users.length === 1 && page > 1 ? page - 1 : page;
      await refreshUsers(nextPage);
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete user");
    } finally {
      setSubmitting(false);
    }
  }

  const showingFrom = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const showingTo = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className={styles.adminRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Image className={styles.brandMark} src="/images/Logo.png" alt="MealNest logo" width={74} height={74} priority />
          <div className={styles.brandText}>
            <span className={styles.brandName}>MealNest</span>
            <span className={styles.brandSub}>SYSTEM MANAGEMENT</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Admin navigation">
          {navItems.map((item) => (
            <a key={item.label} className={`${styles.navItem} ${item.active ? styles.navActive : ""}`} href={item.href}>
              <Icon name={item.icon} size={24} />
              <span className={styles.navLabel}>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.addButton} type="button" onClick={openCreateModal}>
            <Icon name="plus" size={21} />
            Add New User
          </button>
          <div className={styles.supportLinks}>
            <a className={styles.navItem} href="#">
              <Icon name="help" size={24} />
              <span>Support</span>
            </a>
            <a className={`${styles.navItem} ${styles.signOut}`} href="#">
              <Icon name="logout" size={24} />
              <span>Sign Out</span>
            </a>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} type="button" aria-label="Open menu">
            <Icon name="menu" size={24} />
          </button>
          <div className={styles.search}>
            <Icon name="search" size={22} />
            <input
              className={styles.searchInput}
              placeholder="Search users by name or email..."
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className={styles.topActions}>
            <button className={`${styles.iconButton} ${styles.notification}`} type="button" aria-label="Notifications">
              <Icon name="bell" size={23} />
              <span className={styles.badge}>3</span>
            </button>
            <button className={styles.iconButton} type="button" aria-label="Settings">
              <Icon name="settings" size={23} />
            </button>
            <div className={styles.profile}>
              <span className={styles.profileAvatar}>AR</span>
              <div>
                <div className={styles.profileName}>Admin</div>
                <div className={styles.profileRole}>System Admin</div>
              </div>
              <Icon name="chevron" size={18} />
            </div>
          </div>
        </header>

        <section className={styles.content}>
          <div className={styles.heroRow}>
            <div>
              <h1 className={styles.title}>Admin User Management</h1>
              <p className={styles.subtitle}>View, search, create, edit, and delete MealNest users.</p>
            </div>
            <button className={styles.dateButton} type="button" onClick={openCreateModal}>
              <Icon name="plus" size={18} />
              Create User
            </button>
          </div>

          <div className={styles.statsGrid}>
            <article className={`${styles.card} ${styles.statCard}`}>
              <div className={`${styles.statIcon} ${styles.orange}`}>
                <Icon name="users" size={35} />
              </div>
              <div>
                <p className={styles.statLabel}>Total Users</p>
                <p className={styles.statValue}>{meta.total}</p>
                <p className={styles.trend}>Across all matching records</p>
              </div>
            </article>
            <article className={`${styles.card} ${styles.statCard}`}>
              <div className={`${styles.statIcon} ${styles.blue}`}>
                <Icon name="settings" size={35} />
              </div>
              <div>
                <p className={styles.statLabel}>Admins On Page</p>
                <p className={styles.statValue}>{adminCount}</p>
                <p className={styles.trend}>Current filtered page</p>
              </div>
            </article>
            <article className={`${styles.card} ${styles.statCard}`}>
              <div className={`${styles.statIcon} ${styles.green}`}>
                <Icon name="calendar" size={35} />
              </div>
              <div>
                <p className={styles.statLabel}>Current Page</p>
                <p className={styles.statValue}>{meta.page || 1}</p>
                <p className={styles.trend}>{meta.totalPages || 1} total pages</p>
              </div>
            </article>
            <article className={`${styles.card} ${styles.statCard}`}>
              <div className={`${styles.statIcon} ${styles.amber}`}>
                <Icon name="wallet" size={35} />
              </div>
              <div>
                <p className={styles.statLabel}>Page Size</p>
                <p className={styles.statValue}>{meta.limit}</p>
                <p className={styles.trend}>Users per request</p>
              </div>
            </article>
          </div>

          <section className={`${styles.card} ${styles.panel}`}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Users</h2>
                <p className={styles.tableMeta}>
                  Showing {showingFrom}-{showingTo} of {meta.total}
                </p>
              </div>
              <button className={styles.ghostButton} type="button" onClick={openCreateModal}>
                <Icon name="plus" size={16} />
                New User
              </button>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.tableWrap}>
              <table className={styles.usersTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.emptyState}>Loading users...</div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.emptyState}>No users found.</div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const displayName = user.fullName || user.email.split("@")[0];

                      return (
                        <tr key={user.id}>
                          <td>
                            <strong>#{user.id.slice(-6)}</strong>
                          </td>
                          <td>
                            <div className={styles.nameCell}>
                              <span className={styles.userAvatar}>{initials(displayName)}</span>
                              {displayName}
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`${styles.pill} ${user.role === "admin" ? styles.pillAdmin : styles.pillUser}`}>
                              {user.role === "admin" ? "Admin" : "User"}
                            </span>
                          </td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>
                            <div className={styles.actions}>
                              <button className={styles.tableAction} type="button" aria-label={`View ${displayName}`}>
                                <Icon name="eye" size={17} />
                              </button>
                              <button className={styles.tableAction} type="button" aria-label={`Edit ${displayName}`} onClick={() => openEditModal(user)}>
                                <Icon name="edit" size={17} />
                              </button>
                              <button className={`${styles.tableAction} ${styles.dangerAction}`} type="button" aria-label={`Delete ${displayName}`} onClick={() => setDeleteTarget(user)}>
                                <Icon name="trash" size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <button className={styles.pageButton} type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(value - 1, 1))}>
                Previous
              </button>
              <span>
                Page {meta.page || 1} of {meta.totalPages || 1}
              </span>
              <button className={styles.pageButton} type="button" disabled={page >= meta.totalPages || loading || meta.totalPages === 0} onClick={() => setPage((value) => value + 1)}>
                Next
              </button>
            </div>
          </section>
        </section>
      </main>

      {modalMode && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <section className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{modalMode === "create" ? "Create User" : "Edit User"}</h2>
              <button className={styles.iconButton} type="button" aria-label="Close modal" onClick={closeFormModal}>
                <Icon name="close" size={20} />
              </button>
            </div>
            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <label className={styles.field}>
                Name
                <input className={styles.inputControl} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
              </label>
              <label className={styles.field}>
                Email
                <input className={styles.inputControl} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label className={styles.field}>
                Phone
                <input className={styles.inputControl} value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} />
              </label>
              <label className={styles.field}>
                Role
                <select className={styles.selectControl} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as "user" | "admin" })}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className={`${styles.field} ${styles.fullField}`}>
                Password {modalMode === "edit" ? "(leave blank to keep current)" : ""}
                <input className={styles.inputControl} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              </label>
              {formError && <div className={`${styles.errorBanner} ${styles.fullField}`}>{formError}</div>}
              <div className={`${styles.modalActions} ${styles.fullField}`}>
                <button className={styles.secondaryButton} type="button" onClick={closeFormModal}>
                  Cancel
                </button>
                <button className={styles.primaryButton} type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <section className={styles.confirmModal}>
            <h2>Delete User</h2>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.fullName}</strong>? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} type="button" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className={styles.dangerButton} type="button" disabled={submitting} onClick={handleDelete}>
                {submitting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
