"use client";

import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
  type PaginatedUsersResponse,
} from "@/lib/api/admin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>({ page: 1, limit: 10, total: 0, totalPages: 0 });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "user" as "user" | "admin",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedUsersResponse = await getUsers({
        page,
        limit: 10,
        search: search || undefined,
      });
      setUsers(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await createUser(formData);
      setShowCreateModal(false);
      setFormData({ fullName: "", email: "", phoneNumber: "", password: "", role: "user" });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormError(null);
    setSubmitting(true);

    try {
      const updateData: any = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await updateUser(selectedUser.id, updateData);
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ fullName: "", email: "", phoneNumber: "", password: "", role: "user" });
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      await deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: "",
      role: user.role,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-16">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-muted">
            Admin Panel
          </p>
          <h1 className="text-4xl font-bold uppercase leading-none text-on-dark md:text-5xl">
            User Management
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Create User
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Created</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditModal(user)}
                      className="mr-2 rounded bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="rounded bg-red-50 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="flex items-center px-4 text-sm font-medium">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">Create User</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Phone Number</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "user" | "admin" })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formError && (
                <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50 hover:bg-blue-700"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">Edit User</h2>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Phone Number</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "user" | "admin" })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formError && (
                <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50 hover:bg-blue-700"
                >
                  {submitting ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">Delete User</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <strong>{selectedUser.fullName}</strong> ({selectedUser.email})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="rounded bg-red-600 px-4 py-2 font-medium text-white disabled:opacity-50 hover:bg-red-700"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
