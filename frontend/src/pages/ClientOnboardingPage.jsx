import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { api } from '../utils/api'

const STEPS = [
  { id: 'company', title: 'Company Identity', description: 'Basics about your brand and mission' },
  { id: 'needs', title: 'Hiring Needs', description: 'Budgets, contract preferences, languages' },
  { id: 'verification', title: 'Verification', description: 'Docs & submission workflow' }
]

const STATUS_COLORS = {
  DRAFT: 'bg-slate-500/20 text-slate-200 border border-slate-500/40',
  INCOMPLETE: 'bg-amber-500/10 text-amber-200 border border-amber-500/40',
  SUBMITTED: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/40',
  UNDER_REVIEW: 'bg-blue-500/10 text-blue-200 border border-blue-500/40',
  APPROVED: 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/40',
  REJECTED: 'bg-rose-500/10 text-rose-100 border border-rose-500/40',
  NEEDS_UPDATE: 'bg-yellow-500/10 text-yellow-100 border border-yellow-500/40'
}

const initialProfile = {
  companyName: '',
  companyWebsite: '',
  companySize: '',
  industry: '',
  description: '',
  locationCountry: '',
  locationCity: '',
  timezone: '',
  hiringNeeds: '',
  averageBudgetMin: '',
  averageBudgetMax: '',
  preferredContractType: '',
  languages: ''
}

export function ClientOnboardingPage() {
  const { token, profile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

  const [activeStep, setActiveStep] = useState(STEPS[0].id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [profileData, setProfileData] = useState(initialProfile)
  const [status, setStatus] = useState('DRAFT')
  const [verificationNotes, setVerificationNotes] = useState('')
  const [documents, setDocuments] = useState([])
  const [docForm, setDocForm] = useState({ documentType: '', fileName: '', fileUrl: '' })
  const [docUploading, setDocUploading] = useState(false)
  const [submitNotes, setSubmitNotes] = useState('')

  useEffect(() => {
    if (token) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await api.profiles.client.get(token)
      if (data) {
        setProfileData(prev => ({
          ...prev,
          ...Object.fromEntries(Object.keys(initialProfile).map(key => [key, data[key] ?? '']))
        }))
        setStatus(data.status || 'DRAFT')
        setVerificationNotes(data.verificationNotes || '')
      }

      const docs = await api.profiles.client.listDocuments(token)
      setDocuments(docs || [])
    } catch (err) {
      showError(err.message || 'Failed to load client profile')
    } finally {
      setLoading(false)
    }
  }

  const completion = useMemo(() => {
    const required = ['companyName', 'industry', 'description', 'averageBudgetMin', 'averageBudgetMax', 'locationCountry']
    const filled = required.filter(field => Boolean(profileData[field]))
    return Math.round((filled.length / required.length) * 100)
  }, [profileData])

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.profiles.client.update(token, {
        ...profileData,
        averageBudgetMin: profileData.averageBudgetMin ? Number(profileData.averageBudgetMin) : null,
        averageBudgetMax: profileData.averageBudgetMax ? Number(profileData.averageBudgetMax) : null
      })
      showSuccess('Client profile saved')
      await loadProfile()
    } catch (err) {
      showError(err.message || 'Failed to save client profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.profiles.client.submit(token, {
        confirmTerms: true,
        additionalNotes: submitNotes
      })
      showSuccess('Profile submitted for verification')
      await loadProfile()
    } catch (err) {
      showError(err.message || 'Unable to submit profile')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDocumentSubmit = async (e) => {
    e.preventDefault()
    if (!docForm.documentType || !docForm.fileName || !docForm.fileUrl) {
      showError('Fill all document fields')
      return
    }
    setDocUploading(true)
    try {
      const doc = await api.profiles.client.addDocument(token, docForm)
      setDocuments(prev => [...prev, doc])
      setDocForm({ documentType: '', fileName: '', fileUrl: '' })
      showSuccess('Document attached')
    } catch (err) {
      showError(err.message || 'Failed to attach document')
    } finally {
      setDocUploading(false)
    }
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  const isClient = profile.roles?.some(role => role.name === 'CLIENT')
  if (!isClient) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern py-12">
        <div className="container-custom">
          <div className="card p-10 text-center text-white/70">Loading client onboarding...</div>
        </div>
      </div>
    )
  }

  const statusClass = STATUS_COLORS[status] || STATUS_COLORS.DRAFT
  const canSubmit = completion >= 70 && !['UNDER_REVIEW', 'APPROVED'].includes(status)

  return (
    <div className="min-h-screen bg-pattern py-10">
      <div className="container-custom">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-1/4 space-y-6">
            <div className="card sticky top-32">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">Client Onboarding</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}>
                  {status?.replace(/_/g, ' ') || 'DRAFT'}
                </span>
              </div>
              <p className="text-white/70 text-sm mb-6">
                Verified clients get priority talent, escrow access, and faster hiring.
              </p>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white/70">Completion</span>
                  <span className="text-xs font-bold text-white">{completion}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500" style={{ width: `${completion}%` }}></div>
                </div>
              </div>
              <div className="space-y-3">
                {STEPS.map(step => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                      activeStep === step.id ? 'border-cyan-500/40 bg-cyan-500/10 text-white' : 'border-white/5 bg-white/5 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <p className="text-sm font-bold">{step.title}</p>
                    <p className="text-xs text-white/60">{step.description}</p>
                  </button>
                ))}
              </div>
              <div className="mt-6 border-t border-white/10 pt-6 space-y-3">
                <button onClick={handleSave} disabled={saving} className="btn btn-secondary w-full">
                  {saving ? 'Saving…' : 'Save Draft'}
                </button>
                <button onClick={handleSubmit} disabled={!canSubmit || submitting} className={`btn btn-primary w/full ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {submitting ? 'Submitting…' : 'Submit for Review'}
                </button>
                {status === 'REJECTED' && verificationNotes && (
                  <p className="text-xs text-rose-200 bg-rose-500/10 rounded-xl p-3">
                    <span className="font-bold">Admin feedback:</span> {verificationNotes}
                  </p>
                )}
              </div>
            </div>
          </aside>

          <main className="lg:w-3/4 space-y-8">
            {activeStep === 'company' && (
              <section className="card space-y-6">
                <header>
                  <h2 className="text-xl font-bold text-white">Company Identity</h2>
                  <p className="text-white/60 text-sm">Tell freelancers who you are hiring for.</p>
                </header>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="form-label">Company Name *</label>
                    <input className="input-field" value={profileData.companyName} onChange={e => handleChange('companyName', e.target.value)} placeholder="Sajilo Commerce Pvt. Ltd." />
                  </div>
                  <div>
                    <label className="form-label">Website</label>
                    <input className="input-field" value={profileData.companyWebsite} onChange={e => handleChange('companyWebsite', e.target.value)} placeholder="https://company.com" />
                  </div>
                  <div>
                    <label className="form-label">Company Size</label>
                    <select className="input-field" value={profileData.companySize} onChange={e => handleChange('companySize', e.target.value)}>
                      <option value="">Select</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="200+">200+</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Industry *</label>
                    <input className="input-field" value={profileData.industry} onChange={e => handleChange('industry', e.target.value)} placeholder="FinTech / E-commerce" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Company Description *</label>
                    <textarea className="input-field min-h-[160px]" value={profileData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Explain your mission, users, and where freelancers fit in." />
                  </div>
                  <div>
                    <label className="form-label">Location</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input className="input-field" value={profileData.locationCountry} onChange={e => handleChange('locationCountry', e.target.value)} placeholder="Country" />
                      <input className="input-field" value={profileData.locationCity} onChange={e => handleChange('locationCity', e.target.value)} placeholder="City" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Timezone</label>
                    <input className="input-field" value={profileData.timezone} onChange={e => handleChange('timezone', e.target.value)} placeholder="GMT+5:45" />
                  </div>
                </div>
              </section>
            )}

            {activeStep === 'needs' && (
              <section className="card space-y-6">
                <header>
                  <h2 className="text-xl font-bold text-white">Hiring Needs & Budget</h2>
                  <p className="text-white/60 text-sm">Help talent gauge fit before applying.</p>
                </header>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="form-label">What are you hiring for?</label>
                    <textarea className="input-field min-h-[140px]" value={profileData.hiringNeeds} onChange={e => handleChange('hiringNeeds', e.target.value)} placeholder="Describe teams, roles, timelines, tools, collaboration style..." />
                  </div>
                  <div>
                    <label className="form-label">Budget Min *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                      <input type="number" className="input-field pl-7" value={profileData.averageBudgetMin} onChange={e => handleChange('averageBudgetMin', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Budget Max *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                      <input type="number" className="input-field pl-7" value={profileData.averageBudgetMax} onChange={e => handleChange('averageBudgetMax', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Preferred Contract Type</label>
                    <select className="input-field" value={profileData.preferredContractType} onChange={e => handleChange('preferredContractType', e.target.value)}>
                      <option value="">Select</option>
                      <option value="HOURLY">Hourly</option>
                      <option value="FIXED">Fixed price</option>
                      <option value="RETAINER">Retainer</option>
                      <option value="MIXED">Mix of the above</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Preferred Languages</label>
                    <input className="input-field" value={profileData.languages} onChange={e => handleChange('languages', e.target.value)} placeholder="English, Nepali" />
                  </div>
                </div>
              </section>
            )}

            {activeStep === 'verification' && (
              <section className="card space-y-8">
                <header>
                  <h2 className="text-xl font-bold text-white">Verification Center</h2>
                  <p className="text-white/60 text-sm">Attach business documents, POAs, or tax certificates.</p>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="form-label">Submission Notes</label>
                    <textarea className="input-field min-h-[120px]" value={submitNotes} onChange={e => setSubmitNotes(e.target.value)} placeholder="Provide extra context for admins (optional)" />
                  </div>
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                    <h3 className="text-sm font-bold text-white mb-2">Checklist</h3>
                    <ul className="space-y-2 text-xs text-white/70">
                      <li>• Company info complete (name, industry, description)</li>
                      <li>• Budget range provided</li>
                      <li>• At least one supporting document attached</li>
                      <li>• Submission notes (optional but helpful)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Supporting Docs</h3>
                  <div className="space-y-4">
                    {documents.length === 0 && <p className="text-sm text-white/50">No documents yet.</p>}
                    {documents.map(doc => (
                      <div key={doc.id} className="border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{doc.documentType}</p>
                          <p className="text-xs text-white/60">{doc.fileName}</p>
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-cyan-300 underline">{doc.fileUrl}</a>
                        </div>
                        <span className="text-xs font-bold text-white/50">{doc.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleDocumentSubmit}>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="form-label">Document Type</label>
                      <input className="input-field" value={docForm.documentType} onChange={e => setDocForm(prev => ({ ...prev, documentType: e.target.value }))} placeholder="Company registration / ID" />
                    </div>
                    <div>
                      <label className="form-label">File Name</label>
                      <input className="input-field" value={docForm.fileName} onChange={e => setDocForm(prev => ({ ...prev, fileName: e.target.value }))} placeholder="registration.pdf" />
                    </div>
                    <div>
                      <label className="form-label">Hosted URL</label>
                      <input className="input-field" value={docForm.fileUrl} onChange={e => setDocForm(prev => ({ ...prev, fileUrl: e.target.value }))} placeholder="https://files.company.com/reg.pdf" />
                    </div>
                  </div>
                  <button type="submit" disabled={docUploading} className="btn btn-secondary">
                    {docUploading ? 'Attaching…' : 'Attach Document'}
                  </button>
                </form>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}



