import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'
import { gradients } from '../theme/designSystem'

export function CreateInvoicePage() {
  const navigate = useNavigate()
  const { token, profile } = useAuth()

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
            Create <span className="gradient-text">invoice</span>
          </h1>
          <p className="text-white/70 text-lg">
            This invoice creation screen is temporarily simplified while we stabilize the build.
          </p>
          <button
            className="btn btn-secondary mt-4"
            type="button"
            onClick={() => navigate('/invoices')}
          >
            Back to invoices
          </button>
        </div>
      </div>
    </div>
  )
}