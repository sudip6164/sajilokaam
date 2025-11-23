import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

export function AdminSettingsPage() {
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (token) {
      loadSettings()
    }
  }, [token])

  const loadSettings = async () => {
    try {
      const data = await api.admin.getSettings(token)
      setSettings(data || [])
    } catch (err) {
      showError(err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (setting) => {
    setEditingKey(setting.settingKey)
    setEditValue(setting.settingValue || '')
  }

  const handleSave = async (key) => {
    setSaving(true)
    try {
      await api.admin.updateSetting(key, { settingValue: editValue }, token)
      showSuccess('Setting updated successfully')
      setEditingKey(null)
      setEditValue('')
      loadSettings()
    } catch (err) {
      showError(err.message || 'Failed to update setting')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditValue('')
  }

  if (loading) {
    return (
      <div className="page-shell bg-pattern">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-10">
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
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Admin Console
              </p>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  System <span className="gradient-text">settings</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl mt-4">
                  Configure platform-wide settings and system parameters.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="space-y-4">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{setting.settingKey}</h3>
                      {setting.description && (
                        <p className="text-white/60 text-sm mb-2">{setting.description}</p>
                      )}
                      {editingKey === setting.settingKey ? (
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="input flex-1"
                          />
                          <button
                            onClick={() => handleSave(setting.settingKey)}
                            disabled={saving}
                            className="btn btn-sm btn-primary"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="btn btn-sm btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-white/70">{setting.settingValue || '(empty)'}</span>
                          <button
                            onClick={() => handleEdit(setting)}
                            className="btn btn-sm btn-secondary"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="badge badge-ghost text-xs">{setting.settingType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

