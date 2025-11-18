import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { api } from '../utils/api'

const ROLE_OPTIONS = [
  { value: 'LEAD', label: 'Team Lead' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'SPECIALIST', label: 'Specialist' }
]

export function TeamHubPage() {
  const { token, profile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'MEMBER' })
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    if (token) {
      loadTeams()
    }
  }, [token])

  const loadTeams = async () => {
    setLoading(true)
    try {
      const data = await api.teams.getMyTeams(token)
      setTeams(data || [])
      setSelectedTeam((data || [])[0] || null)
    } catch (err) {
      showError(err.message || 'Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim()) {
      showError('Team name is required')
      return
    }

    setCreating(true)
    try {
      await api.teams.create(token, {
        name: createForm.name.trim(),
        description: createForm.description?.trim()
      })
      showSuccess('Team created successfully')
      setCreateForm({ name: '', description: '' })
      setShowCreateForm(false)
      await loadTeams()
    } catch (err) {
      showError(err.message || 'Failed to create team')
    } finally {
      setCreating(false)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!selectedTeam) return
    if (!inviteForm.email.trim()) {
      showError('Enter an email to invite')
      return
    }

    setInviting(true)
    try {
      await api.teams.addMember(selectedTeam.id, token, {
        email: inviteForm.email.trim(),
        role: inviteForm.role
      })
      showSuccess('Invitation sent!')
      setInviteForm({ email: '', role: 'MEMBER' })
      await loadTeams()
    } catch (err) {
      showError(err.message || 'Failed to invite member')
    } finally {
      setInviting(false)
    }
  }

  const isLead = selectedTeam && selectedTeam.lead?.id === profile?.id

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern py-12">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="loading-skeleton h-10 w-64 mb-6"></div>
            <div className="grid md:grid-cols-[320px,1fr] gap-6">
              <div className="card h-[400px] loading-skeleton"></div>
              <div className="card h-[400px] loading-skeleton"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pattern py-12">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 mb-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="page-title">Team Collaboration Hub</h1>
              <p className="page-subtitle">Form pods, manage members, and coordinate delivery.</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create Team
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <aside className="space-y-4">
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-semibold text-lg">Your Teams</h2>
                  <span className="text-white/60 text-sm">{teams.length}</span>
                </div>
                <p className="text-white/60 text-xs">
                  Teams include pods where you are lead or contributor.
                </p>
              </div>

              <div className="card space-y-3 max-h-[70vh] overflow-y-auto">
                {teams.length === 0 && (
                  <div className="text-center py-10 text-white/60 text-sm">
                    You haven't joined any teams yet.
                  </div>
                )}
                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedTeam?.id === team.id
                        ? 'border-violet-500/60 bg-violet-500/10'
                        : 'border-white/5 bg-white/5 hover:border-white/15'
                    }`}
                  >
                    <p className="text-white font-semibold">{team.name}</p>
                    <p className="text-white/60 text-xs line-clamp-2">{team.description || 'No description provided'}</p>
                    <p className="text-[10px] text-white/40 mt-2 uppercase">
                      Lead: {team.lead?.fullName || 'Unassigned'}
                    </p>
                  </button>
                ))}
              </div>
            </aside>

            <section className="space-y-6">
              {!selectedTeam ? (
                <div className="card text-center py-16">
                  <p className="text-white/60">Select a team to see members and activity.</p>
                </div>
              ) : (
                <>
                  <div className="card">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs text-white/50 uppercase">Team</p>
                        <h2 className="text-3xl font-extrabold text-white">{selectedTeam.name}</h2>
                        <p className="text-white/70 text-sm mt-2">{selectedTeam.description || 'No description provided.'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/50 uppercase">Lead</p>
                        <p className="text-white font-semibold">{selectedTeam.lead?.fullName || '—'}</p>
                        <p className="text-white/60 text-xs">{selectedTeam.lead?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Roster</h3>
                        <p className="text-white/60 text-sm">{selectedTeam.members.length} members</p>
                      </div>
                      {isLead && (
                        <button
                          className="btn btn-secondary text-sm"
                          onClick={() => setInviteForm({ email: '', role: 'MEMBER' })}
                        >
                          Invite Member
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedTeam.members.map(member => (
                        <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <div>
                            <p className="text-white font-semibold text-sm">{member.fullName || member.email}</p>
                            <p className="text-white/60 text-xs">{member.email}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-3 py-1 rounded-full bg-white/10 text-white font-semibold">
                              {member.role || 'MEMBER'}
                            </span>
                            <span className="text-white/50 uppercase">{member.status}</span>
                          </div>
                          <div className="text-right text-white/50 text-[11px]">
                            Joined {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '—'}
                          </div>
                        </div>
                      ))}
                      {selectedTeam.members.length === 0 && (
                        <div className="text-center py-10 text-white/60 text-sm">
                          No members yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {isLead && (
                    <div className="card">
                      <h3 className="text-lg font-semibold text-white mb-4">Invite teammate</h3>
                      <form className="grid md:grid-cols-2 gap-4" onSubmit={handleInvite}>
                        <div className="md:col-span-2">
                          <label className="text-sm text-white/70 font-semibold mb-2 block">Email address</label>
                          <input
                            type="email"
                            className="input-field"
                            placeholder="teammate@company.com"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                            disabled={inviting}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-white/70 font-semibold mb-2 block">Role</label>
                          <select
                            className="input-field"
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                            disabled={inviting}
                          >
                            {ROLE_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={inviting}
                          >
                            {inviting ? 'Sending...' : 'Send Invite'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Create Team</h3>
            <form className="space-y-4" onSubmit={handleCreateTeam}>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">Team name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Product Velocity Pod"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  disabled={creating}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">Description</label>
                <textarea
                  className="input-field min-h-[120px]"
                  placeholder="Purpose, responsibilities, integration points..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  disabled={creating}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Team'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

