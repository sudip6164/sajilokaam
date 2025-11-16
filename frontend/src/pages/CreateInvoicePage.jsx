import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

export function CreateInvoicePage() {
  const navigate = useNavigate()
  const { token, profile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0, itemType: 'SERVICE' }
  ])

  const [formData, setFormData] = useState({
    projectId: '',
    clientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: 0,
    discount: 0,
    currency: 'NPR',
    notes: '',
    terms: 'Payment is due within 30 days.'
  })

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load projects and clients - you may need to adjust these API calls
      // For now, we'll create a simple form
    } catch (err) {
      showError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index][field] = parseFloat(value) || 0
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice
    } else {
      newItems[index][field] = value
    }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, itemType: 'SERVICE' }])
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const taxAmount = subtotal * (formData.taxRate / 100)
    const total = subtotal + taxAmount - formData.discount
    return { subtotal, taxAmount, total }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.clientId) {
      showError('Please select a client')
      return
    }
    if (items.some(item => !item.description || item.unitPrice <= 0)) {
      showError('Please fill in all item details')
      return
    }

    setSubmitting(true)
    try {
      const invoiceData = {
        projectId: formData.projectId || null,
        clientId: parseInt(formData.clientId),
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        taxRate: formData.taxRate,
        discount: formData.discount,
        currency: formData.currency,
        notes: formData.notes,
        terms: formData.terms,
        status: 'DRAFT',
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          itemType: item.itemType
        }))
      }

      const invoice = await api.invoices.create(token, invoiceData)
      showSuccess('Invoice created successfully!')
      navigate(`/invoices/${invoice.id}`)
    } catch (err) {
      showError(err.message || 'Failed to create invoice')
    } finally {
      setSubmitting(false)
    }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="loading-skeleton h-10 w-48 mb-8"></div>
          <div className="card">
            <div className="loading-skeleton h-40 w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-pattern">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="page-title">Create Invoice</h1>
          <p className="page-subtitle">Create a new invoice for your client</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-6">Invoice Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Client *</label>
                <input
                  type="number"
                  className="input"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  placeholder="Client User ID"
                  required
                />
                <p className="text-xs text-white/50 mt-1">Enter the client's user ID</p>
              </div>
              <div>
                <label className="label">Project (Optional)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  placeholder="Project ID"
                />
              </div>
              <div>
                <label className="label">Issue Date *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Due Date *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Tax Rate (%)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">Discount</label>
                <input
                  type="number"
                  className="input"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="label">Currency</label>
                <select
                  className="input"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="NPR">NPR (Nepalese Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Invoice Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="btn btn-secondary text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5">
                      <label className="label">Description *</label>
                      <input
                        type="text"
                        className="input"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Item description"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Quantity</label>
                      <input
                        type="number"
                        className="input"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="label">Unit Price *</label>
                      <input
                        type="number"
                        className="input"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="btn btn-danger text-sm w-full"
                        disabled={items.length === 1}
                      >
                        ×
                      </button>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <span className="text-sm font-semibold text-violet-400">
                        {formData.currency} {(item.quantity * item.unitPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-white/80">
                <span>Subtotal:</span>
                <span>{formData.currency} {subtotal.toFixed(2)}</span>
              </div>
              {formData.taxRate > 0 && (
                <div className="flex justify-between text-white/80">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span>{formData.currency} {taxAmount.toFixed(2)}</span>
                </div>
              )}
              {formData.discount > 0 && (
                <div className="flex justify-between text-white/80">
                  <span>Discount:</span>
                  <span>-{formData.currency} {formData.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold text-white pt-2 border-t border-white/10">
                <span>Total:</span>
                <span className="text-violet-400">
                  {formData.currency} {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-6">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes for the invoice"
                />
              </div>
              <div>
                <label className="label">Terms & Conditions</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  placeholder="Payment terms and conditions"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

