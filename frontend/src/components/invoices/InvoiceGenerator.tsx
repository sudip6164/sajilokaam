import { useState } from 'react';
import { FileText, Download, Send, Calendar, DollarSign, Plus, X, Printer } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceGeneratorProps {
  projectTitle: string;
  clientName: string;
  clientEmail: string;
  onGenerate: (invoice: InvoiceData) => void;
  onCancel: () => void;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  paymentInstructions?: string;
}

export function InvoiceGenerator({ projectTitle, clientName, clientEmail, onGenerate, onCancel }: InvoiceGeneratorProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState(
    'Payment is due within 30 days of invoice date. Please make payment to the account details provided.'
  );

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    // Calculate amount
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }
    
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const handleGenerate = () => {
    onGenerate({
      invoiceNumber,
      issueDate,
      dueDate,
      items,
      subtotal,
      tax,
      total,
      notes,
      paymentInstructions,
    });
  };

  const isValid = invoiceNumber && issueDate && dueDate && items.some(item => item.description && item.amount > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card rounded-xl border border-border max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Generate Invoice</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create a professional invoice for your project
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Invoice Form */}
            <div className="space-y-6">
              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-sm">
                    Invoice Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-sm">
                    Issue Date <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold mb-2 text-sm">
                    Due Date <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-semibold mb-2">Bill To:</p>
                <p className="font-semibold">{clientName}</p>
                <p className="text-sm text-muted-foreground">{clientEmail}</p>
                <p className="text-sm text-muted-foreground mt-1">Project: {projectTitle}</p>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold">Line Items</label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Item {index + 1}</span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-destructive hover:bg-destructive/10 p-1 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Description (e.g., Frontend Development)"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          placeholder="Qty"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                        <input
                          type="number"
                          value={item.rate || ''}
                          onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                          placeholder="Rate"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                        <input
                          type="number"
                          value={item.amount || ''}
                          disabled
                          placeholder="Amount"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax */}
              <div>
                <label className="block font-semibold mb-2 text-sm">Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRate || ''}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold mb-2 text-sm">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes or comments"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              {/* Payment Instructions */}
              <div>
                <label className="block font-semibold mb-2 text-sm">Payment Instructions</label>
                <textarea
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            {/* Right: Invoice Preview */}
            <div>
              <div className="sticky top-0">
                <div className="bg-background border-2 border-border rounded-lg p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold">INVOICE</h3>
                      <p className="text-sm text-muted-foreground mt-1">{invoiceNumber}</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-primary to-secondary">
                      SajiloKaam
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">From:</p>
                      <p className="font-semibold">Your Name</p>
                      <p className="text-muted-foreground">your@email.com</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">To:</p>
                      <p className="font-semibold">{clientName}</p>
                      <p className="text-muted-foreground">{clientEmail}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Issue Date:</p>
                      <p className="font-semibold">
                        {issueDate ? new Date(issueDate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Date:</p>
                      <p className="font-semibold">
                        {dueDate ? new Date(dueDate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 font-semibold">Description</th>
                          <th className="text-right py-2 font-semibold">Qty</th>
                          <th className="text-right py-2 font-semibold">Rate</th>
                          <th className="text-right py-2 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.filter(item => item.description).map((item, index) => (
                          <tr key={index} className="border-b border-border">
                            <td className="py-2">{item.description}</td>
                            <td className="text-right py-2">{item.quantity}</td>
                            <td className="text-right py-2">${item.rate.toFixed(2)}</td>
                            <td className="text-right py-2">${item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    {taxRate > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                        <span className="font-semibold">${tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-xl text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {notes && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">{notes}</p>
                    </div>
                  )}

                  {paymentInstructions && (
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs font-semibold mb-1">Payment Instructions:</p>
                      <p className="text-xs text-muted-foreground">{paymentInstructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-background">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={!isValid}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button type="button" variant="outline" disabled={!isValid}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button type="button" onClick={handleGenerate} disabled={!isValid}>
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
