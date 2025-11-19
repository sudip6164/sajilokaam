import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { Pagination } from '../components/Pagination'
import api from '../utils/api'

export function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [bidCounts, setBidCounts] = useState({})
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    categoryId: '',
    jobType: '',
    experienceLevel: '',
    budgetMin: '',
    budgetMax: '',
    skillId: '',
    status: '',
    featured: null
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [categories, setCategories] = useState([])
  const [skills, setSkills] = useState([])
  const [freelancerProfileStatus, setFreelancerProfileStatus] = useState(null)
  const [clientProfileStatus, setClientProfileStatus] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const itemsPerPage = 10
  const { token, profile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

  useEffect(() => {
    loadCategoriesAndSkills()
    loadJobs()
    if (token) {
      loadSavedJobs()
    }
  }, [token])

  useEffect(() => {
    loadJobs()
  }, [filters, searchQuery])

  useEffect(() => {
    if (token && profile?.roles?.some(r => r.name === 'FREELANCER')) {
      loadRecommendations()
    } else {
      setRecommendations([])
    }
  }, [token, profile])

  useEffect(() => {
    if (!token || !profile) {
      setFreelancerProfileStatus(null)
      setClientProfileStatus(null)
      return
    }

    let isMounted = true
    const loadProfileStatuses = async () => {
      try {
        if (profile.roles?.some(r => r.name === 'FREELANCER')) {
          const data = await api.profiles.freelancer.get(token)
          if (isMounted) {
            setFreelancerProfileStatus(data?.status || 'DRAFT')
          }
        } else {
          setFreelancerProfileStatus(null)
        }

        if (profile.roles?.some(r => r.name === 'CLIENT')) {
          const data = await api.profiles.client.get(token)
          if (isMounted) {
            setClientProfileStatus(data?.status || 'DRAFT')
          }
        } else {
          setClientProfileStatus(null)
        }
      } catch (err) {
        console.warn('Failed to load profile statuses', err)
      }
    }

    loadProfileStatuses()
    return () => {
      isMounted = false
    }
  }, [token, profile])

  const loadCategoriesAndSkills = async () => {
    try {
      const [catsData, skillsData] = await Promise.all([
        api.jobCategories.getAll(),
        api.jobSkills.getAll()
      ])
      setCategories(catsData || [])
      setSkills(skillsData || [])
    } catch (err) {
      console.error('Failed to load categories and skills', err)
    }
  }

  const loadRecommendations = async () => {
    if (!token) return
    setLoadingRecommendations(true)
    try {
      const data = await api.jobRecommendations.get(token)
      setRecommendations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Failed to load job recommendations', err)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const formatBudgetRange = (job) => {
    const min = job?.budgetMin != null ? Number(job.budgetMin) : null
    const max = job?.budgetMax != null ? Number(job.budgetMax) : null
    if (min != null && max != null) {
      return `Rs. ${min.toLocaleString()} - Rs. ${max.toLocaleString()}`
    }
    if (min != null) {
      return `From Rs. ${min.toLocaleString()}`
    }
    if (max != null) {
      return `Up to Rs. ${max.toLocaleString()}`
    }
    return 'Budget TBD'
  }

  const loadJobs = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.jobType) params.jobType = filters.jobType
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel
      if (filters.budgetMin) params.budgetMin = filters.budgetMin
      if (filters.budgetMax) params.budgetMax = filters.budgetMax
      if (filters.skillId) params.skillId = filters.skillId
      if (filters.status) params.status = filters.status
      if (filters.featured !== null) params.featured = filters.featured

      const jobsList = await api.jobs.getAll(token, params)
      setJobs(Array.isArray(jobsList) ? jobsList : [])
      
      // Load bid counts
      const counts = {}
      await Promise.all(
        jobsList.map(async (job) => {
          try {
            const count = await api.jobs.getBidCount(job.id)
            counts[job.id] = count
          } catch (err) {
            console.error(`Failed to load bid count for job ${job.id}`, err)
          }
        })
      )
      setBidCounts(counts)
    } catch (err) {
      showError(err.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const loadSavedJobs = async () => {
    try {
      const saved = await api.savedJobs.getAll(token)
      const savedIds = new Set(saved.map(sj => sj.job.id))
      setSavedJobs(savedIds)
    } catch (err) {
      console.error('Failed to load saved jobs', err)
    }
  }

  const handleSaveJob = async (e, jobId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!token) {
      showError('Please login to save jobs')
      return
    }

    try {
      if (savedJobs.has(jobId)) {
        await api.savedJobs.unsave(jobId, token)
        setSavedJobs(prev => {
          const newSet = new Set(prev)
          newSet.delete(jobId)
          return newSet
        })
        showSuccess('Job removed from saved')
      } else {
        await api.savedJobs.save(jobId, token)
        setSavedJobs(prev => new Set([...prev, jobId]))
        showSuccess('Job saved successfully')
      }
    } catch (err) {
      showError(err.message || 'Failed to save job')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      categoryId: '',
      jobType: '',
      experienceLevel: '',
      budgetMin: '',
      budgetMax: '',
      skillId: '',
      status: '',
      featured: null
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

  // Client-side search filter
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return job.title?.toLowerCase().includes(query) ||
           job.description?.toLowerCase().includes(query)
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

  const getStatusBadge = (status) => {
    const badges = {
      OPEN: 'badge badge-success',
      CLOSED: 'badge badge-gray',
      IN_PROGRESS: 'badge badge-warning'
    }
    return badges[status] || 'badge badge-gray'
  }

  const formatProfileStatus = (status) =>
    (status || 'INCOMPLETE').replace(/_/g, ' ')

  const isClient = profile?.roles?.some(r => r.name === 'CLIENT')
  const isFreelancer = profile?.roles?.some(r => r.name === 'FREELANCER')
  const isFreelancerApproved = !isFreelancer || freelancerProfileStatus === 'APPROVED'
  const isClientApproved = !isClient || clientProfileStatus === 'APPROVED'

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="loading-skeleton h-10 w-64 mb-8"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card">
                  <div className="loading-skeleton h-6 w-3/4 mb-3"></div>
                  <div className="loading-skeleton h-4 w-full mb-2"></div>
                  <div className="loading-skeleton h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-pattern">
      <div className="container-custom">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h1 className="page-title">Job Listings</h1>
              <p className="page-subtitle">
                {isClient ? 'Manage your job postings' : 'Browse available freelance opportunities'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              {isClient && (
                isClientApproved ? (
                  <Link to="/jobs/new" className="btn btn-primary">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Post New Job
                  </Link>
                ) : (
                  <button
                    onClick={() => showError('Get your client profile approved before posting new jobs.')}
                    className="btn btn-primary opacity-60 cursor-not-allowed"
                    title="Client profile approval required"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Awaiting Approval
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {isFreelancer && !isFreelancerApproved && (
              <div className="card border border-yellow-500/40 bg-yellow-500/5 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-yellow-200/80">Freelancer verification</p>
                  <h3 className="text-lg font-bold text-white mt-1 mb-2">Finish onboarding to unlock bidding</h3>
                  <p className="text-white/70 text-sm">
                    Your profile status is <span className="font-semibold text-white">{formatProfileStatus(freelancerProfileStatus)}</span>.
                    Complete the onboarding workspace to appear in search and submit proposals.
                  </p>
                </div>
                <Link to="/onboarding/freelancer" className="btn btn-secondary whitespace-nowrap">
                  Complete Profile
                </Link>
              </div>
            )}
            {isClient && !isClientApproved && (
              <div className="card border border-cyan-500/40 bg-cyan-500/5 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200/80">Client verification</p>
                  <h3 className="text-lg font-bold text-white mt-1 mb-2">Admins need to approve your company</h3>
                  <p className="text-white/70 text-sm">
                    Status <span className="font-semibold text-white">{formatProfileStatus(clientProfileStatus)}</span>.
                    Verified clients get featured placement, escrow, and faster proposals.
                  </p>
                </div>
                <Link to="/onboarding/client" className="btn btn-secondary whitespace-nowrap">
                  Open Dashboard
                </Link>
              </div>
            )}
          </div>

          {isFreelancer && (
            <section className="card mb-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-200/70">
                    Personalized feed
                  </p>
                  <h2 className="text-xl font-bold text-white">Recommended jobs for you</h2>
                  <p className="text-white/60 text-sm">
                    Matches are based on your primary and secondary skills.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    className="btn btn-ghost border border-white/10"
                    onClick={loadRecommendations}
                    disabled={loadingRecommendations}
                  >
                    {loadingRecommendations ? 'Refreshing…' : 'Refresh'}
                  </button>
                  <Link to="/profile" className="btn btn-secondary">
                    Update skills
                  </Link>
                </div>
              </div>
              {loadingRecommendations ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map(n => (
                    <div key={n} className="border border-white/10 rounded-2xl p-4 bg-white/5">
                      <div className="loading-skeleton h-6 w-1/2 mb-3"></div>
                      <div className="loading-skeleton h-4 w-3/4 mb-2"></div>
                      <div className="loading-skeleton h-4 w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <div className="border border-dashed border-white/15 rounded-2xl p-6 text-white/60 text-sm">
                  Complete your freelancer profile with skills to unlock personalized job suggestions.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="border border-white/10 rounded-2xl p-4 bg-white/5 flex flex-col gap-3">
                      <div>
                        <p className="text-xs uppercase text-white/50">Matched opportunity</p>
                        <h3 className="text-lg font-bold text-white">{rec.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-white/70">
                        {rec.category?.name && (
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-wide">
                            {rec.category.name}
                          </span>
                        )}
                        {rec.experienceLevel && (
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-wide">
                            {rec.experienceLevel.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <p className="text-white/70 text-sm line-clamp-2">{rec.description}</p>
                      <div className="flex items-center justify-between text-sm text-white">
                        <span className="font-semibold">{formatBudgetRange(rec)}</span>
                        <Link to={`/jobs/${rec.id}`} className="text-violet-300 hover:text-violet-200 text-xs font-semibold">
                          View Job →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filter Sidebar */}
            {showFilters && (
              <div className="lg:col-span-1">
                <div className="card sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-violet-400 hover:text-violet-300"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">Category</label>
                      <select
                        value={filters.categoryId}
                        onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                        className="input w-full"
                      >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">Job Type</label>
                      <select
                        value={filters.jobType}
                        onChange={(e) => handleFilterChange('jobType', e.target.value)}
                        className="input w-full"
                      >
                        <option value="">All Types</option>
                        <option value="FIXED_PRICE">Fixed Price</option>
                        <option value="HOURLY">Hourly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">Experience</label>
                      <select
                        value={filters.experienceLevel}
                        onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                        className="input w-full"
                      >
                        <option value="">Any Level</option>
                        <option value="ENTRY">Entry Level</option>
                        <option value="MID">Mid Level</option>
                        <option value="SENIOR">Senior Level</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">Budget Min (Rs.)</label>
                      <input
                        type="number"
                        value={filters.budgetMin}
                        onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                        className="input w-full"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">Budget Max (Rs.)</label>
                      <input
                        type="number"
                        value={filters.budgetMax}
                        onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                        className="input w-full"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">Skill</label>
                      <select
                        value={filters.skillId}
                        onChange={(e) => handleFilterChange('skillId', e.target.value)}
                        className="input w-full"
                      >
                        <option value="">All Skills</option>
                        {skills.map(skill => (
                          <option key={skill.id} value={skill.id}>{skill.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="input w-full"
                      >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Jobs List */}
            <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
              {/* Search Bar */}
              <div className="card mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs by title or description..."
                    className="input-field pl-10 w-full"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="card text-center py-16">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
                  <p className="text-white/70 mb-6">Try adjusting your filters or search query</p>
                  <button onClick={clearFilters} className="btn btn-secondary">
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-6">
                    {paginatedJobs.map(job => (
                      <Link
                        key={job.id}
                        to={`/jobs/${job.id}`}
                        className="card group hover-lift relative"
                      >
                        {isFreelancer && (
                          <button
                            onClick={(e) => handleSaveJob(e, job.id)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                            title={savedJobs.has(job.id) ? 'Remove from saved' : 'Save job'}
                          >
                            <svg
                              className={`w-5 h-5 ${savedJobs.has(job.id) ? 'text-yellow-400 fill-yellow-400' : 'text-white/70'}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                        )}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h2 className="text-2xl font-bold text-white group-hover:text-violet-400 transition-colors">
                                {job.title}
                              </h2>
                              <span className={getStatusBadge(job.status)}>
                                {job.status}
                              </span>
                              {job.category && (
                                <span className="badge badge-ghost">{job.category.name}</span>
                              )}
                              {job.jobType && (
                                <span className="badge badge-primary">{job.jobType.replace('_', ' ')}</span>
                              )}
                            </div>
                            <p className="text-white/70 mb-4 line-clamp-2 leading-relaxed">
                              {job.description || 'No description provided'}
                            </p>
                            {job.requiredSkills && job.requiredSkills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {job.requiredSkills.slice(0, 5).map(skill => (
                                  <span key={skill.id} className="badge badge-secondary text-xs">
                                    {skill.name}
                                  </span>
                                ))}
                                {job.requiredSkills.length > 5 && (
                                  <span className="badge badge-ghost text-xs">
                                    +{job.requiredSkills.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-sm text-white/60 flex-wrap">
                              {job.client && (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-purple-500/30">
                                    {job.client.fullName?.charAt(0) || 'U'}
                                  </div>
                                  <span className="text-white/80">{job.client.fullName}</span>
                                </div>
                              )}
                              {job.budgetMin && job.budgetMax && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-semibold text-white/90">
                                    Rs. {job.budgetMin.toLocaleString()} - Rs. {job.budgetMax.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {job.experienceLevel && (
                                <span className="text-white/80">{job.experienceLevel} Level</span>
                              )}
                              {job.createdAt && (
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold text-white/90">
                                  {bidCounts[job.id] !== undefined ? bidCounts[job.id] : '-'} {bidCounts[job.id] === 1 ? 'Bid' : 'Bids'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-violet-400 group-hover:translate-x-1 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
