import { useState, useEffect } from 'react';
import { useRouter } from '../Router';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Header } from '../Header';
import { toast } from 'sonner';
import { Loader2, Shield, CheckCircle2, ArrowLeft, Wallet, CreditCard, Lock, PlayCircle } from 'lucide-react';
import { paymentsApi } from '@/lib/api';

// Declare Khalti checkout globally
declare global {
  interface Window {
    KhaltiCheckout: any;
  }
}

export function PaymentPage() {
  const { pageParams, navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'khalti' | 'esewa' | 'demo' | null>(null);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [khaltiLoaded, setKhaltiLoaded] = useState(false);

  useEffect(() => {
    if (pageParams?.invoiceId && pageParams?.projectId && pageParams?.amount) {
      setInvoiceId(Number(pageParams.invoiceId));
      setProjectId(Number(pageParams.projectId));
      setAmount(Number(pageParams.amount));
      setJobTitle(pageParams.jobTitle || 'Project Payment');
    } else {
      toast.error('Missing payment details');
      setTimeout(() => navigate('client-dashboard'), 2000);
    }

    loadKhaltiScript();
  }, [pageParams, navigate]);

  const loadKhaltiScript = () => {
    if (window.KhaltiCheckout) {
      setKhaltiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js';
    script.async = true;
    script.onload = () => setKhaltiLoaded(true);
    script.onerror = () => toast.error('Failed to load Khalti');
    document.body.appendChild(script);
  };

  const handleKhaltiPayment = async () => {
    if (!invoiceId || !projectId || !amount) {
      toast.error('Payment details incomplete');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentsApi.initiateKhaltiPayment({
        invoiceId,
        projectId,
        amount,
      });

      console.log('Khalti response:', response);
      
      // Server-side initiation returns payment URL
      if (response.paymentUrl) {
        toast.success('Redirecting to Khalti...');
        // Redirect to Khalti payment page
        window.location.href = response.paymentUrl;
      } else {
        toast.error('Failed to get Khalti payment URL');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const verifyKhaltiPayment = async (token: string, amount: number) => {
    if (!invoiceId || !projectId) return;

    try {
      await paymentsApi.verifyKhaltiPayment({ token, amount, invoiceId, projectId });
      toast.success('Payment successful!');
      setTimeout(() => {
        navigate('payment-success', { 
          invoiceId: invoiceId.toString(), 
          projectId: projectId.toString() 
        });
      }, 1500);
    } catch (error: any) {
      toast.error('Payment verification failed');
    }
  };

  const handleEsewaPayment = async () => {
    if (!invoiceId || !projectId || !amount) {
      toast.error('Payment details incomplete');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentsApi.initiateEsewaPayment({
        invoiceId,
        projectId,
        amount,
      });

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = response.esewaPaymentUrl;

      const fields = {
        amount: response.amount.toString(),
        tax_amount: response.taxAmount?.toString() || '0',
        total_amount: response.totalAmount.toString(),
        transaction_uuid: response.transactionUuid,
        product_code: (response as any).productCode || response.productId,
        product_service_charge: response.productServiceCharge?.toString() || '0',
        product_delivery_charge: response.productDeliveryCharge?.toString() || '0',
        success_url: response.successUrl,
        failure_url: response.failureUrl,
        signed_field_names: response.signedFieldNames,
        signature: (response as any).signature || '',
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      toast.success('Redirecting to eSewa...');
      setTimeout(() => form.submit(), 500);
    } catch (error: any) {
      toast.error('Failed to initiate payment');
      setLoading(false);
    }
  };

  const handleDemoPayment = async () => {
    if (!invoiceId || !projectId || !amount) {
      toast.error('Payment details incomplete');
      return;
    }

    setLoading(true);
    try {
      toast.info('Processing demo payment...');
      
      // Initiate demo payment
      await paymentsApi.initiateDemoPayment({
        invoiceId,
        projectId,
        amount,
      });

      // Wait a moment for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Automatically verify the demo payment
      const verifyResponse = await paymentsApi.verifyDemoPayment({
        invoiceId,
        projectId,
      });

      toast.success('Demo payment successful!');
      
      // Redirect to success page
      setTimeout(() => {
        navigate('payment-success', {
          invoiceId: invoiceId.toString(),
          projectId: projectId.toString(),
        });
      }, 1500);
    } catch (error: any) {
      console.error('Demo payment error:', error);
      toast.error(error.response?.data?.error || 'Demo payment failed');
      setLoading(false);
    }
  };

  if (!invoiceId || !projectId || !amount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('client-dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Secure Payment</h1>
          <p className="text-lg text-gray-600">Choose your preferred payment method</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Summary - Left Side */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 text-gray-900">Payment Details</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Project</p>
                    <p className="font-semibold text-gray-900">{jobTitle}</p>
                  </div>

                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Invoice ID</span>
                    <span className="font-medium">#{invoiceId}</span>
                  </div>

                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Project ID</span>
                    <span className="font-medium">#{projectId}</span>
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Amount</span>
                      <span className="text-2xl font-bold text-primary">
                        Rs. {amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Escrow Protected</p>
                      <p className="text-blue-700">Funds held securely until project completion</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods - Right Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Khalti Option */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                selectedGateway === 'khalti' 
                  ? 'ring-2 ring-primary shadow-xl scale-[1.02]' 
                  : 'hover:scale-[1.01]'
              }`}
              onClick={() => setSelectedGateway('khalti')}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${
                    selectedGateway === 'khalti' ? 'bg-primary' : 'bg-purple-100'
                  }`}>
                    <Wallet className={`h-10 w-10 ${
                      selectedGateway === 'khalti' ? 'text-white' : 'text-purple-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">Khalti</h3>
                      {selectedGateway === 'khalti' && (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      Pay with Khalti wallet, banking, or mobile banking
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {['Khalti Wallet', 'E-Banking', 'Mobile Banking', 'Connect IPS'].map((method) => (
                        <span key={method} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedGateway === 'khalti' && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleKhaltiPayment();
                      }}
                      disabled={loading}
                      size="lg"
                      className="ml-4"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Pay Now'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* eSewa Option */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                selectedGateway === 'esewa' 
                  ? 'ring-2 ring-primary shadow-xl scale-[1.02]' 
                  : 'hover:scale-[1.01]'
              }`}
              onClick={() => setSelectedGateway('esewa')}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${
                    selectedGateway === 'esewa' ? 'bg-primary' : 'bg-green-100'
                  }`}>
                    <CreditCard className={`h-10 w-10 ${
                      selectedGateway === 'esewa' ? 'text-white' : 'text-green-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">eSewa</h3>
                      {selectedGateway === 'esewa' && (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      Nepal's popular digital wallet and payment service
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {['eSewa Wallet', 'Bank Transfer'].map((method) => (
                        <span key={method} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedGateway === 'esewa' && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEsewaPayment();
                      }}
                      disabled={loading}
                      size="lg"
                      className="ml-4"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Pay Now'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Demo Payment Option */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 border-dashed ${
                selectedGateway === 'demo' 
                  ? 'ring-2 ring-primary shadow-xl scale-[1.02] border-primary' 
                  : 'hover:scale-[1.01] border-gray-300'
              }`}
              onClick={() => setSelectedGateway('demo')}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${
                    selectedGateway === 'demo' ? 'bg-primary' : 'bg-blue-100'
                  }`}>
                    <PlayCircle className={`h-10 w-10 ${
                      selectedGateway === 'demo' ? 'text-white' : 'text-blue-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">Demo Payment</h3>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                        TEST MODE
                      </span>
                      {selectedGateway === 'demo' && (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      Automatically process payment for testing. No actual payment required.
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                        Instant Processing
                      </span>
                      <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                        For Development
                      </span>
                    </div>
                  </div>

                  {selectedGateway === 'demo' && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoPayment();
                      }}
                      disabled={loading}
                      size="lg"
                      className="ml-4 bg-primary hover:bg-primary/90"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-5 w-5" />
                          Pay Now (Demo)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">🔒 Secure & Encrypted Payment</p>
                    <p className="leading-relaxed">
                      All transactions are encrypted and secure. Your payment will be held in escrow 
                      and released to the freelancer only upon successful project completion.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
