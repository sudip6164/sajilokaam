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
  const { error: showError } = useToast()

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  const isFreelancer = profile.roles?.some(role => role.name === 'FREELANCER')
  if (!isFreelancer) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Freelancer <span className="gradient-text">onboarding</span>
          </h1>
          <p className="text-white/70 text-lg">
            This page is temporarily simplified while we finish stabilizing the build. Core app flows will continue to work.
          </p>
        </div>
      </div>
    </div>
  )
}
