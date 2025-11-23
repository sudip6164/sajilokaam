import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { api } from '../utils/api'
import { gradients } from '../theme/designSystem'

const STEPS = [
  { id: 'brand', title: 'Brand & Story', description: 'Headline, overview, intro video' },
  { id: 'expertise', title: 'Expertise & Skills', description: 'Experience, skills, languages' },
  { id: 'pricing', title: 'Rates & Availability', description: 'Preferred workload, rate card' },
  { id: 'presence', title: 'Portfolio & Links', description: 'Links, certifications, showcase' },
  { id: 'verification', title: 'Verification', description: 'Documents & submission' }
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

const availabilityOptions = [
  { value: 'FULL_TIME', label: 'Full-time (30+ hrs/week)' },
  { value: 'PART_TIME', label: 'Part-time (10-30 hrs/week)' },
  { value: 'AS_NEEDED', label: 'As needed - open to offers' }
]

const experienceOptions = [
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'MID', label: 'Intermediate' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'EXPERT', label: 'Expert' }
]

const workloadOptions = [
  { value: 'ONE_OFF', label: 'One-off gigs' },
  { value: 'SHORT_TERM', label: 'Short-term (1-3 months)' },
  { value: 'LONG_TERM', label: 'Long-term (3-6 months)' },
  { value: 'ONGOING_PARTNER', label: 'Ongoing partnership' }
]

const teamRoleOptions = [
  { value: 'SOLO', label: 'Solo freelancer' },
  { value: 'MEMBER', label: 'Team member' },
  { value: 'LEAD', label: 'Team lead / agency owner' }
]

const initialProfileState = {
  headline: '',
  overview: '',
  videoIntroUrl: '',
  availability: '',
  experienceLevel: '',
  experienceYears: '',
  primarySkills: '',
  secondarySkills: '',
  languages: '',
  education: '',
  certifications: '',
  hourlyRate: '',
  hourlyRateMin: '',
  hourlyRateMax: '',
  preferredWorkload: '',
  teamRole: '',
  teamName: '',
  portfolioUrl: '',
  websiteUrl: '',
  linkedinUrl: '',
  githubUrl: '',
  locationCountry: '',
  locationCity: '',
  timezone: ''
}

export function FreelancerOnboardingPage() {
  const { token, profile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeStep, setActiveStep] = useState(STEPS[0].id)
  const [profileData, setProfileData] = useState(initialProfileState)
  const [status, setStatus] = useState('DRAFT')
  const [verificationNotes, setVerificationNotes] = useState('')
  const [documents, setDocuments] = useState([])
  const [docForm, setDocForm] = useState({
    documentType: '',
    fileName: '',
    fileUrl: ''
  })
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
      const data = await api.profiles.freelancer.get(token)
      if (data) {
        setProfileData(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.keys(initialProfileState).map((key) => [key, data[key] ?? ''])
          )
        }))
        setStatus(data.status || 'DRAFT')
        setVerificationNotes(data.verificationNotes || '')
      }

      const docs = await api.profiles.freelancer.listDocuments(token)
      setDocuments(docs || [])
    } catch (err) {
      showError(err.message || 'Failed to load freelancer profile')
    } finally {
      setLoading(false)
    }
  }

  const completion = useMemo(() => {
    const requiredFields = ['headline', 'overview', 'primarySkills', 'availability', 'experienceLevel', 'hourlyRate', 'locationCountry']
    const filled = requiredFields.filter(field => Boolean(profileData[field]))
    return Math.round((filled.length / requiredFields.length) * 100)
  }, [profileData])

  const handleChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.profiles.freelancer.update(token, {
        ...profileData,
        experienceYears: profileData.experienceYears ? Number(profileData.experienceYears) : null,
        hourlyRate: profileData.hourlyRate ? Number(profileData.hourlyRate) : null,
        hourlyRateMin: profileData.hourlyRateMin ? Number(profileData.hourlyRateMin) : null,
        hourlyRateMax: profileData.hourlyRateMax ? Number(profileData.hourlyRateMax) : null
      })
      showSuccess('Profile saved')
      await loadProfile()
    } catch (err) {
      showError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitProfile = async () => {
    setSubmitting(true)
    try {
      await api.profiles.freelancer.submit(token, {
        confirmTerms: true,
        additionalNotes: submitNotes
      })
      showSuccess('Profile submitted for review')
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
      showError('Fill in all document fields')
      return
    }
    setDocUploading(true)
    try {
      const doc = await api.profiles.freelancer.addDocument(token, docForm)
      setDocuments(prev => [...prev, doc])
      setDocForm({ documentType: '', fileName: '', fileUrl: '' })
      showSuccess('Document added')
    } catch (err) {
      showError(err.message || 'Failed to add document')
    } finally {
      setDocUploading(false)
    }
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  const isFreelancer = profile.roles?.some(role => role.name === 'FREELANCER')
  if (!isFreelancer) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="page-shell bg-pattern">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="hero-grid">
              <div className="space-y-6">
                <div className="loading-skeleton h-8 w-48"></div>
                <div className="loading-skeleton h-12 w-3/4"></div>
                <div className="loading-skeleton h-6 w-1/2"></div>
              </div>
            </div>
            <div className="card p-10 text-center">
              <p className="text-white/70">Loading onboarding workspace...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusClass = STATUS_COLORS[status] || STATUS_COLORS.DRAFT
  const canSubmit = completion >= 80 && !['UNDER_REVIEW', 'APPROVED'].includes(status)

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Profile Setup
              </p>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  Freelancer <span className="gradient-text">onboarding</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl mt-4">
                  Craft a rich profile so clients can evaluate your expertise. Submit for admin verification to start bidding.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-start gap-4">
              <div className="stat-pill">
                <div className="text-xs text-white/60 uppercase tracking-wider">Completion</div>
                <div className="text-2xl font-black text-white">{completion}%</div>
              </div>
              <div className="stat-pill">
                <div className="text-xs text-white/60 uppercase tracking-wider">Status</div>
                <div className={`text-sm font-bold ${statusClass.replace('border', '')}`}>
                  {status?.replace(/_/g, ' ') || 'DRAFT'}
                </div>
              </div>
            </div>
          </div>

        <div className="flex flex-col gap-8 xl:flex-row">
          <div className="xl:w-1/4 space-y-6">
            <div className="card sticky top-32">
              <div className="mb-6">
                <p className="text-white/70 text-sm">
                  Craft a rich profile so clients can evaluate your expertise. Submit for admin verification to start bidding.
                </p>
              </div>

              <div className="space-y-3">
                {STEPS.map(step => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                      activeStep === step.id
                        ? 'border-violet-500/40 bg-violet-500/10 text-white'
                        : 'border-white/5 bg-white/5 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <p className="text-sm font-bold">{step.title}</p>
                    <p className="text-xs text-white/60">{step.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 border-t border-white/10 pt-6 space-y-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-secondary w-full"
                >
                  {saving ? 'Saving…' : 'Save Draft'}
                </button>
                <button
                  onClick={handleSubmitProfile}
                  disabled={!canSubmit || submitting}
                  className={`btn btn-primary w-full ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Submitting…' : 'Submit for Review'}
                </button>
                {status === 'REJECTED' && verificationNotes && (
                  <p className="text-xs text-rose-200 bg-rose-500/10 rounded-xl p-3">
                    <span className="font-bold">Admin feedback:</span> {verificationNotes}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="xl:w-3/4 space-y-8">
            {activeStep === 'brand' && (
              <section className="card space-y-6">
                <header>
                  <h2 className="text-xl font-bold text-white">Brand & Story</h2>
                  <p className="text-white/60 text-sm">Give clients a compelling snapshot.</p>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="form-label">Headline *</label>
                    <input
                      className="input-field"
                      placeholder="Ex: Senior MERN stack engineer for SaaS platforms"
                      value={profileData.headline}
                      onChange={e => handleChange('headline', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Overview *</label>
                    <textarea
                      className="input-field min-h-[180px]"
                      value={profileData.overview}
                      onChange={e => handleChange('overview', e.target.value)}
                      placeholder="Summarize your wins, industries, and what makes collaboration seamless."
                    />
                  </div>
                  <div>
                    <label className="form-label">Intro Video URL</label>
                    <input
                      className="input-field"
                      value={profileData.videoIntroUrl}
                      onChange={e => handleChange('videoIntroUrl', e.target.value)}
                      placeholder="https://youtu.be/..."
                    />
                  </div>
                  <div>
                    <label className="form-label">Location</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className="input-field"
                        value={profileData.locationCountry}
                        onChange={e => handleChange('locationCountry', e.target.value)}
                        placeholder="Country"
                      />
                      <input
                        className="input-field"
                        value={profileData.locationCity}
                        onChange={e => handleChange('locationCity', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Timezone</label>
                    <input
                      className="input-field"
                      value={profileData.timezone}
                      onChange={e => handleChange('timezone', e.target.value)}
                      placeholder="GMT+5:45"
                    />
                  </div>
                </div>
              </section>
            )}

            {activeStep === 'expertise' && (
              <section className="card space-y-6">
                <header>
                  <h2 className="text-xl font-bold text-white">Expertise & Skills</h2>
                  <p className="text-white/60 text-sm">Showcase your domain mastery.</p>
                </header>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="form-label">Availability *</label>
                    <select
                      className="input-field"
                      value={profileData.availability}
                      onChange={e => handleChange('availability', e.target.value)}
                    >
                      <option value="">Select availability</option>
                      {availabilityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Experience Level *</label>
                    <select
                      className="input-field"
                      value={profileData.experienceLevel}
                      onChange={e => handleChange('experienceLevel', e.target.value)}
                    >
                      <option value="">Select seniority</option>
                      {experienceOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Years of Experience</label>
                    <input
                      type="number"
                      className="input-field"
                      min={0}
                      value={profileData.experienceYears}
                      onChange={e => handleChange('experienceYears', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Languages</label>
                    <input
                      className="input-field"
                      placeholder="English (Fluent), Nepali (Native)"
                      value={profileData.languages}
                      onChange={e => handleChange('languages', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Primary Skills *</label>
                    <textarea
                      className="input-field"
                      placeholder="React, Node.js, TypeScript, GraphQL..."
                      value={profileData.primarySkills}
                      onChange={e => handleChange('primarySkills', e.target.value)}
                    />
                    <p className="text-xs text-white/50 mt-1">Comma-separated list. These power search & matching.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Secondary Skills</label>
                    <textarea
                      className="input-field"
                      placeholder="UI design, analytics, QA automation..."
                      value={profileData.secondarySkills}
                      onChange={e => handleChange('secondarySkills', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Education</label>
                    <textarea
                      className="input-field"
                      placeholder="BSc. Computer Science - XYZ University"
                      value={profileData.education}
                      onChange={e => handleChange('education', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Certifications</label>
                    <textarea
                      className="input-field"
                      placeholder="AWS Certified Developer, PMP..."
                      value={profileData.certifications}
                      onChange={e => handleChange('certifications', e.target.value)}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeStep === 'pricing' && (
              <section className="card space-y-6">
                <header>
                  <h2 className="text-xl font-bold text-white">Rates & Availability</h2>
                  <p className="text-white/60 text-sm">Align expectations upfront.</p>
                </header>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="form-label">Hero Hourly Rate *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                      <input
                        type="number"
                        className="input-field pl-7"
                        value={profileData.hourlyRate}
                        onChange={e => handleChange('hourlyRate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Min Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                      <input
                        type="number"
                        className="input-field pl-7"
                        value={profileData.hourlyRateMin}
                        onChange={e => handleChange('hourlyRateMin', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Max Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                      <input
                        type="number"
                        className="input-field pl-7"
                        value={profileData.hourlyRateMax}
                        onChange={e => handleChange('hourlyRateMax', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="form-label">Preferred Workload</label>
                    <select
                      className="input-field"
                      value={profileData.preferredWorkload}
                      onChange={e => handleChange('preferredWorkload', e.target.value)}
                    >
                      <option value="">Select preference</option>
                      {workloadOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Team Role</label>
                    <select
                      className="input-field"
                      value={profileData.teamRole}
                      onChange={e => handleChange('teamRole', e.target.value)}
                    >
                      <option value="">Select</option>
                      {teamRoleOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {profileData.teamRole === 'LEAD' && (
                    <div className="md:col-span-2">
                      <label className="form-label">Team / Agency Name</label>
                      <input
                        className="input-field"
                        value={profileData.teamName}
                        onChange={e => handleChange('teamName', e.target.value)}
                        placeholder="Your collective / agency"
                      />
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeStep === 'presence' && (
              <section className="card space-y-6">
                <header>
                  <h2 className="text-xl font-bold text-white">Portfolio & Presence</h2>
                  <p className="text-white/60 text-sm">Link your best work.</p>
                </header>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="form-label">Portfolio URL</label>
                    <input
                      className="input-field"
                      value={profileData.portfolioUrl}
                      onChange={e => handleChange('portfolioUrl', e.target.value)}
                      placeholder="https://dribbble.com/you"
                    />
                  </div>
                  <div>
                    <label className="form-label">Personal Website</label>
                    <input
                      className="input-field"
                      value={profileData.websiteUrl}
                      onChange={e => handleChange('websiteUrl', e.target.value)}
                      placeholder="https://you.dev"
                    />
                  </div>
                  <div>
                    <label className="form-label">LinkedIn</label>
                    <input
                      className="input-field"
                      value={profileData.linkedinUrl}
                      onChange={e => handleChange('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/you"
                    />
                  </div>
                  <div>
                    <label className="form-label">GitHub</label>
                    <input
                      className="input-field"
                      value={profileData.githubUrl}
                      onChange={e => handleChange('githubUrl', e.target.value)}
                      placeholder="https://github.com/you"
                    />
                  </div>
                </div>
              </section>
            )}

            {activeStep === 'verification' && (
              <section className="card space-y-8">
                <header>
                  <h2 className="text-xl font-bold text-white">Verification Center</h2>
                  <p className="text-white/60 text-sm">Upload supporting documents & submit for admin approval.</p>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="form-label">Submission Notes</label>
                    <textarea
                      className="input-field min-h-[120px]"
                      value={submitNotes}
                      onChange={e => setSubmitNotes(e.target.value)}
                      placeholder="Add context for reviewers (optional)"
                    />
                  </div>
                  <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
                    <h3 className="text-sm font-bold text-white mb-2">Checklist</h3>
                    <ul className="space-y-2 text-xs text-white/70">
                      <li>• Fill required profile sections (headline, overview, skills, rate)</li>
                      <li>• Add at least one supporting document</li>
                      <li>• Confirm readiness before submitting</li>
                      <li>• Await email + in-app notification</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Supporting Docs</h3>
                  <div className="space-y-4">
                    {documents.length === 0 && (
                      <p className="text-sm text-white/50">No documents uploaded yet.</p>
                    )}
                    {documents.map(doc => (
                      <div key={doc.id} className="border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{doc.documentType}</p>
                          <p className="text-xs text-white/60">{doc.fileName}</p>
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-violet-300 underline">
                            {doc.fileUrl}
                          </a>
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
                      <input
                        className="input-field"
                        value={docForm.documentType}
                        onChange={e => setDocForm(prev => ({ ...prev, documentType: e.target.value }))}
                        placeholder="Government ID / Portfolio PDF"
                      />
                    </div>
                    <div>
                      <label className="form-label">File Name</label>
                      <input
                        className="input-field"
                        value={docForm.fileName}
                        onChange={e => setDocForm(prev => ({ ...prev, fileName: e.target.value }))}
                        placeholder="passport.pdf"
                      />
                    </div>
                    <div>
                      <label className="form-label">Hosted URL</label>
                      <input
                        className="input-field"
                        value={docForm.fileUrl}
                        onChange={e => setDocForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                        placeholder="https://files.yoursite.com/passport.pdf"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={docUploading}
                    className="btn btn-secondary"
                  >
                    {docUploading ? 'Attaching…' : 'Attach Document'}
                  </button>
                </form>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



