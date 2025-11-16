import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

export function CreateJobPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('OPEN')
  const [categoryId, setCategoryId] = useState('')
  const [jobType, setJobType] = useState('FIXED_PRICE')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [durationHours, setDurationHours] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [skills, setSkills] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadCategoriesAndSkills()
  }, [])

  useEffect(() => {
    if (categoryId) {
      loadSkillsForCategory(categoryId)
    } else {
      loadSkillsForCategory(null)
    }
  }, [categoryId])

  const loadCategoriesAndSkills = async () => {
    try {
      const [catsData, skillsData] = await Promise.all([
        api.jobCategories.getAll(),
        api.jobSkills.getAll()
      ])
      setCategories(catsData || [])
      setSkills(skillsData || [])
    } catch (err) {
      showError('Failed to load categories and skills')
    } finally {
      setLoadingData(false)
    }
  }

  const loadSkillsForCategory = async (catId) => {
    try {
      const skillsData = await api.jobSkills.getAll(catId)
      setSkills(skillsData || [])
    } catch (err) {
      console.error('Failed to load skills', err)
    }
  }

  const handleSkillToggle = (skillId) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const jobData = {
        title,
        description,
        status,
        categoryId: categoryId ? parseInt(categoryId) : null,
        jobType,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        experienceLevel: experienceLevel || null,
        durationHours: durationHours ? parseInt(durationHours) : null,
        expiresAt: expiresAt || null,
        skillIds: selectedSkills.map(id => parseInt(id))
      }

      const job = await api.jobs.create(token, jobData)
      showSuccess('Job created successfully!')
      navigate(`/jobs/${job.id}`)
    } catch (err) {
      showError(err.message || 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="loading-skeleton h-10 w-48 mb-8"></div>
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
    <div className="min-h-screen py-12 bg-pattern">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="page-title">Post a New Job</h1>
            <p className="page-subtitle">Create a job posting to find the perfect freelancer</p>
          </div>
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="input-field"
                  placeholder="e.g., Website Development, Logo Design, Content Writing"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="input-field"
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  required
                  className="input-field"
                  disabled={loading}
                >
                  <option value="FIXED_PRICE">Fixed Price</option>
                  <option value="HOURLY">Hourly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">
                    Budget Min (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="input-field"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">
                    Budget Max (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="input-field"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="input-field"
                  disabled={loading}
                >
                  <option value="">Any Level</option>
                  <option value="ENTRY">Entry Level</option>
                  <option value="MID">Mid Level</option>
                  <option value="SENIOR">Senior Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  Required Skills
                </label>
                <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-lg border border-white/10 min-h-[100px]">
                  {skills.length === 0 ? (
                    <p className="text-white/50 text-sm">Select a category to see skills</p>
                  ) : (
                    skills.map(skill => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleSkillToggle(skill.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedSkills.includes(skill.id)
                            ? 'bg-violet-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                        disabled={loading}
                      >
                        {skill.name}
                      </button>
                    ))
                  )}
                </div>
                {selectedSkills.length > 0 && (
                  <p className="text-xs text-white/50 mt-2">
                    {selectedSkills.length} skill(s) selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Describe the job requirements, timeline, budget expectations, and any specific skills needed..."
                  disabled={loading}
                />
                <p className="text-xs text-white/50 mt-1">Be detailed to attract the right freelancers</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="input-field"
                    placeholder="e.g., 40"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="input-field"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field"
                  disabled={loading}
                >
                  <option value="OPEN">Open - Accepting applications</option>
                  <option value="CLOSED">Closed - No longer accepting</option>
                  <option value="IN_PROGRESS">In Progress - Work has started</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Job'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
