import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

export function AdminUsersPage() {
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'FREELANCER'
  })

  useEffect(() => {
    if (token) {
      loadUsers()
      loadRoles()
    }
  }, [token, currentPage])

  const loadUsers = async () => {
    try {
      const response = await api.admin.getUsers(currentPage, 20, token)
      setUsers(response.content || [])
      setTotalPages(response.totalPages || 0)
    } catch (err) {
      showError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const rolesData = await api.admin.getRoles(token)
      setRoles(rolesData || [])
    } catch (err) {
      console.error('Failed to load roles', err)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.admin.createUser(formData, token)
      showSuccess('User created successfully')
      setShowCreateModal(false)
      resetForm()
      loadUsers()
    } catch (err) {
      showError(err.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    setSubmitting(true)
    try {
      await api.admin.updateUser(selectedUser.id, formData, token)
      showSuccess('User updated successfully')
      setShowEditModal(false)
      resetForm()
      setSelectedUser(null)
      loadUsers()
    } catch (err) {
      showError(err.message || 'Failed to update user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    setDeleting(true)
    try {
      await api.admin.deleteUser(selectedUser.id, token)
      showSuccess('User deleted successfully')
      setShowDeleteModal(false)
      setSelectedUser(null)
      loadUsers()
    } catch (err) {
      showError(err.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      role: 'FREELANCER'
    })
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      password: '',
      fullName: user.fullName,
      role: user.roles?.[0]?.name || 'FREELANCER'
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  if (loading) {
    return (
      <div className="page-shell bg-pattern">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="hero-grid">
              <div className="space-y-6">
                <div className="loading-skeleton h-8 w-48"></div>
                <div className="loading-skeleton h-12 w-3/4"></div>
                <div className="loading-skeleton h-6 w-1/2"></div>
              </div>
            </div>
            <div className="card">
              <div className="loading-skeleton h-8 w-3/4 mb-4"></div>
              <div className="loading-skeleton h-4 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Admin Console
              </p>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  User <span className="gradient-text">management</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl mt-4">
                  Manage user accounts, roles, and permissions across the platform.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  resetForm()
                  setShowCreateModal(true)
                }}
                className="btn btn-primary"
              >
                + Create User
              </button>
            </div>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/70 font-semibold">Name</th>
                    <th className="text-left p-4 text-white/70 font-semibold">Email</th>
                    <th className="text-left p-4 text-white/70 font-semibold">Role</th>
                    <th className="text-left p-4 text-white/70 font-semibold">Created</th>
                    <th className="text-right p-4 text-white/70 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white">{user.fullName}</td>
                      <td className="p-4 text-white/70">{user.email}</td>
                      <td className="p-4">
                        <span className="badge badge-primary">
                          {user.roles?.[0]?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-white/60 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="btn btn-sm btn-secondary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-white/10">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="btn btn-sm btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-white/70">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="btn btn-sm btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Create User</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-white/70 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Role</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input w-full"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Edit User</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-white/70 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-white/70 mb-2">Role</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input w-full"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedUser(null)
                    resetForm()
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Delete User</h2>
            <p className="text-white/70 mb-6">
              Are you sure you want to delete user <strong>{selectedUser.fullName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-danger flex-1"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

