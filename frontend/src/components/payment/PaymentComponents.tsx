import { useState } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle, Plus, Trash2, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface PaymentMethod {
  id: number;
  type: 'card' | 'bank' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  accountLast4?: string;
  email?: string;
  isDefault: boolean;
}

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  onAddMethod: () => void;
  onRemoveMethod: (id: number) => void;
  onSetDefault: (id: number) => void;
}

export function PaymentMethods({ methods, onAddMethod, onRemoveMethod, onSetDefault }: PaymentMethodsProps) {
  const getMethodIcon = (type: PaymentMethod['type']) => {
    return <CreditCard className="h-5 w-5" />;
  };

  const getMethodLabel = (method: PaymentMethod) => {
    if (method.type === 'card') {
      return `${method.brand} •••• ${method.last4}`;
    } else if (method.type === 'bank') {
      return `${method.bankName} •••• ${method.accountLast4}`;
    } else {
      return method.email;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Payment Methods</h3>
        <Button onClick={onAddMethod} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Method
        </Button>
      </div>

      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getMethodIcon(method.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getMethodLabel(method)}</span>
                  {method.isDefault && (
                    <Badge className="bg-success">Default</Badge>
                  )}
                </div>
                {method.type === 'card' && method.expiryMonth && method.expiryYear && (
                  <p className="text-sm text-muted-foreground">
                    Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!method.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSetDefault(method.id)}
                >
                  Set as Default
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveMethod(method.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {methods.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No payment methods added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface AddPaymentMethodProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AddPaymentMethod({ onSubmit, onCancel }: AddPaymentMethodProps) {
  const [methodType, setMethodType] = useState<'card' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      methodType,
      cardNumber,
      cardName,
      expiryDate,
      cvv,
      saveAsDefault,
    });
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl border border-border max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold mb-1">Add Payment Method</h2>
          <p className="text-sm text-muted-foreground">
            Add a new card or bank account
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Method Type */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMethodType('card')}
              className={`flex-1 p-4 rounded-lg border transition-all ${
                methodType === 'card'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <CreditCard className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Credit/Debit Card</p>
            </button>
            <button
              type="button"
              onClick={() => setMethodType('bank')}
              className={`flex-1 p-4 rounded-lg border transition-all ${
                methodType === 'bank'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <CreditCard className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-sm">Bank Account</p>
            </button>
          </div>

          {/* Card Form */}
          {methodType === 'card' && (
            <>
              <div>
                <label className="block font-semibold mb-2 text-sm">
                  Card Number <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-sm">
                  Cardholder Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-sm">
                    Expiry Date <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-sm">
                    CVV <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </>
          )}

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-primary mb-1">Secure Payment</p>
              <p className="text-muted-foreground">
                Your payment information is encrypted and secure. We never store your full card details.
              </p>
            </div>
          </div>

          {/* Save as Default */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm">Set as default payment method</span>
          </label>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Shield className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PaymentConfirmationProps {
  amount: number;
  recipient: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaymentConfirmation({ amount, recipient, description, onConfirm, onCancel }: PaymentConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl border border-border max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-border text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Confirm Payment</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-3xl font-bold">${amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="font-semibold">{recipient}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">For</span>
              <span className="text-sm">{description}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-600 mb-1">Important</p>
              <p className="text-muted-foreground">
                Once confirmed, this payment will be processed immediately and cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-primary to-secondary">
            Confirm Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
