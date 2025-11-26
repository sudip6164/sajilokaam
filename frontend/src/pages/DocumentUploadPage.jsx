import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'
import { gradients } from '../theme/designSystem'

export function DocumentUploadPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { showToast } = useToast()
  
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [project, setProject] = useState(null)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      const data = await api.projects.getById(projectId, token)
      setProject(data)
    } catch (err) {
      showToast('Failed to load project', 'error')
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp']
      if (!validTypes.includes(selectedFile.type)) {
        showToast('Invalid file type. Please upload PDF or image files.', 'error')
        return
      }
      
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        showToast('File size exceeds 10MB limit', 'error')
        return
      }
      
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      showToast('Please select a file', 'error')
      return
    }

    setUploading(true)
    try {
      const result = await api.documents.upload(projectId, token, file)
      setProcessing(result)
      showToast('Document uploaded. Processing...', 'success')
      
      // Poll for processing status
      pollProcessingStatus(result.id)
    } catch (err) {
      showToast(err.message || 'Failed to upload document', 'error')
      setUploading(false)
    }
  }

  const pollProcessingStatus = async (processingId) => {
    const maxAttempts = 60 // Poll for up to 5 minutes (5 second intervals)
    let attempts = 0
    
    const poll = async () => {
      try {
        const status = await api.documents.getProcessingStatus(projectId, processingId, token)
        setProcessing(status)
        
        if (status.status === 'COMPLETED') {
          setUploading(false)
          loadSuggestions(processingId)
        } else if (status.status === 'FAILED') {
          setUploading(false)
          showToast(`Processing failed: ${status.errorMessage}`, 'error')
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          setUploading(false)
          showToast('Processing is taking longer than expected. Please check back later.', 'warning')
        }
      } catch (err) {
        setUploading(false)
        showToast('Failed to check processing status', 'error')
      }
    }
    
    poll()
  }

  const loadSuggestions = async (processingId) => {
    setLoading(true)
    try {
      const data = await api.documents.getSuggestions(projectId, processingId, token)
      setSuggestions(data)
    } catch (err) {
      showToast('Failed to load task suggestions', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleSuggestion = (suggestionId) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId)
    } else {
      newSelected.add(suggestionId)
    }
    setSelectedSuggestions(newSelected)
  }

  const handleCreateTasks = async () => {
    if (selectedSuggestions.size === 0) {
      showToast('Please select at least one task suggestion', 'error')
      return
    }

    setLoading(true)
    try {
      await api.documents.createTasks(projectId, processing.id, token, Array.from(selectedSuggestions))
      showToast(`Successfully created ${selectedSuggestions.size} task(s)`, 'success')
      navigate(`/projects/${projectId}`)
    } catch (err) {
      showToast(err.message || 'Failed to create tasks', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectSelected = async () => {
    if (selectedSuggestions.size === 0) {
      showToast('Please select suggestions to reject', 'error')
      return
    }

    setLoading(true)
    try {
      await api.documents.rejectSuggestions(projectId, processing.id, token, Array.from(selectedSuggestions))
      showToast('Suggestions rejected', 'success')
      // Reload suggestions
      loadSuggestions(processing.id)
      setSelectedSuggestions(new Set())
    } catch (err) {
      showToast(err.message || 'Failed to reject suggestions', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-500'
      case 'HIGH': return 'text-orange-500'
      case 'MEDIUM': return 'text-yellow-500'
      case 'LOW': return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-green-400'
    if (score >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <button
                onClick={() => navigate(`/projects/${projectId}`)}
                className="text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center gap-2 transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Project
              </button>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  AI-Powered Extraction
                </p>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  Document <span className="gradient-text">task extraction</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl mt-4">
                  {project ? `Upload documents for ${project.title} and let AI extract tasks automatically using OCR and NLP.` : 'Upload PDF or image files to automatically extract tasks using advanced OCR and NLP technology.'}
                </p>
              </div>
            </div>
          </div>

        {!processing && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
            <p className="text-white/70 mb-6">
              Upload a PDF or image file (PNG, JPG, GIF, BMP) to automatically extract tasks using OCR and NLP.
              Maximum file size: 10MB
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select File</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-700"
                />
                {file && (
                  <p className="mt-2 text-sm text-white/60">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload & Process'}
              </button>
            </div>
          </div>
        )}

        {processing && processing.status === 'PROCESSING' && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-lg">Processing document...</p>
            <p className="text-white/60 mt-2">This may take a few moments</p>
          </div>
        )}

        {processing && processing.status === 'COMPLETED' && (
          <div className="space-y-6">
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-400 font-semibold">
                ✓ Processing completed! Found {processing.extractedTasksCount} task suggestion(s)
              </p>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto"></div>
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Task Suggestions</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRejectSelected}
                      disabled={selectedSuggestions.size === 0}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      Reject Selected ({selectedSuggestions.size})
                    </button>
                    <button
                      onClick={handleCreateTasks}
                      disabled={selectedSuggestions.size === 0 || loading}
                      className="btn btn-primary disabled:opacity-50"
                    >
                      Create Tasks ({selectedSuggestions.size})
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border ${
                        selectedSuggestions.has(suggestion.id)
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-white/10'
                      } cursor-pointer transition-all hover:border-violet-500/50`}
                      onClick={() => toggleSuggestion(suggestion.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedSuggestions.has(suggestion.id)}
                            onChange={() => toggleSuggestion(suggestion.id)}
                            className="w-5 h-5 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500"
                          />
                          <h3 className="text-xl font-semibold">{suggestion.suggestedTitle}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          {suggestion.suggestedPriority && (
                            <span className={`text-sm font-medium ${getPriorityColor(suggestion.suggestedPriority)}`}>
                              {suggestion.suggestedPriority}
                            </span>
                          )}
                          <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidenceScore)}`}>
                            {(suggestion.confidenceScore * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      </div>
                      
                      {suggestion.suggestedDescription && (
                        <p className="text-white/70 mb-3">{suggestion.suggestedDescription}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-white/60">
                        {suggestion.suggestedDueDate && (
                          <span>Due: {new Date(suggestion.suggestedDueDate).toLocaleDateString()}</span>
                        )}
                        {suggestion.suggestedEstimatedHours && (
                          <span>Est. Hours: {suggestion.suggestedEstimatedHours}h</span>
                        )}
                        <span>Method: {suggestion.extractionMethod}</span>
                        {suggestion.lineNumber && (
                          <span>Line: {suggestion.lineNumber}</span>
                        )}
                      </div>
                      
                      {suggestion.rawTextSnippet && (
                        <details className="mt-3">
                          <summary className="text-sm text-violet-400 cursor-pointer">View source text</summary>
                          <pre className="mt-2 text-xs text-white/50 bg-black/20 p-2 rounded overflow-auto">
                            {suggestion.rawTextSnippet}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {!loading && suggestions.length === 0 && (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 text-center">
                <p className="text-white/70">No task suggestions found in the document.</p>
              </div>
            )}
          </div>
        )}

        {processing && processing.status === 'FAILED' && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 font-semibold">Processing failed</p>
            <p className="text-white/70 mt-2">{processing.errorMessage}</p>
            <button
              onClick={() => setProcessing(null)}
              className="btn btn-secondary mt-4"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

