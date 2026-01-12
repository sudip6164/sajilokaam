import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { CreditCard, Wallet, Loader2 } from 'lucide-react';
import { paymentsApi } from '@/lib/api';
import { toast } from 'sonner';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
  onPaymentSuccess: () => void;
}

export function PaymentModal({ open, onClose, invoice, onPaymentSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'khalti' | 'esewa'>('khalti');
  const [amount, setAmount] = useState(invoice?.totalAmount - (invoice?.paidAmount || 0));
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const balanceDue = invoice.totalAmount - (invoice.paidAmount || 0);
    if (amount > balanceDue) {
      toast.error('Amount cannot exceed balance due');
      return;
    }

    try {
      setLoading(true);

      // Create payment record
      const payment = await paymentsApi.create({
        invoiceId: invoice.id,
        amount: amount,
        paymentMethod: paymentMethod.toUpperCase(),
        status: 'PENDING',
      });

      // Initiate payment gateway
      const initiationResponse = await paymentsApi.initiate(payment.id, {
        gateway: paymentMethod,
        returnUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
      });

      // Redirect to payment gateway
      if (initiationResponse.paymentUrl) {
        window.location.href = initiationResponse.paymentUrl;
      } else {
        toast.error('Failed to initiate payment. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Invoice</DialogTitle>
          <DialogDescription>
            Choose your payment method and complete the payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Invoice:</span>
              <span className="font-medium">{invoice?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">Rs. {invoice?.totalAmount?.toFixed(2)}</span>
            </div>
            {invoice?.paidAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Already Paid:</span>
                <span className="font-medium">Rs. {invoice?.paidAmount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Balance Due:</span>
              <span className="text-primary">
                Rs. {(invoice?.totalAmount - (invoice?.paidAmount || 0))?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor="amount">Payment Amount (Rs.)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min="0"
              max={invoice?.totalAmount - (invoice?.paidAmount || 0)}
              step="0.01"
              placeholder="Enter amount"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can pay the full amount or make a partial payment
            </p>
          </div>

          {/* Payment Method Selection */}
          <div>
            <Label className="mb-3 block">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="space-y-3">
                {/* Khalti */}
                <label
                  htmlFor="khalti"
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'khalti'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value="khalti" id="khalti" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-purple-100 p-2 rounded">
                      <Wallet className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Khalti</p>
                      <p className="text-xs text-gray-600">Digital Wallet</p>
                    </div>
                  </div>
                </label>

                {/* eSewa */}
                <label
                  htmlFor="esewa"
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'esewa'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value="esewa" id="esewa" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-green-100 p-2 rounded">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">eSewa</p>
                      <p className="text-xs text-gray-600">Digital Payment</p>
                    </div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Secure Payment:</strong> You will be redirected to the payment gateway to
              complete your transaction securely.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading || !amount || amount <= 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Rs. {amount?.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
