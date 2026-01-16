import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Check, Zap, Crown, Rocket, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { pricingApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from './Router';
import { toast } from 'sonner';

const planIcons: Record<string, any> = {
  'FREE': Zap,
  'PROFESSIONAL': Crown,
  'ENTERPRISE': Rocket,
};

const faqs = [
  {
    question: 'Can I change my plan later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.',
  },
  {
    question: 'Is there a contract or commitment?',
    answer: 'No contracts required. You can cancel your subscription at any time with no penalty.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'Your data remains accessible for 30 days after cancellation. You can reactivate anytime during this period.',
  },
];

export function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const { navigate } = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  useEffect(() => {
    fetchPlans();
    if (isAuthenticated) {
      fetchCurrentSubscription();
    }
  }, [isAuthenticated]);

  const fetchPlans = async () => {
    try {
      const data = await pricingApi.getPlans();
      setPlans(data.map((plan: any) => ({
        ...plan,
        icon: planIcons[plan.name] || Zap,
        highlighted: plan.name === 'PROFESSIONAL',
      })));
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      // If API fails, use fallback plans
      if (error.response?.status === 404) {
        setPlans([
          {
            id: 1,
            name: 'FREE',
            displayName: 'Free',
            description: 'Perfect for getting started',
            monthlyPrice: 0,
            yearlyPrice: 0,
            maxBidsPerMonth: 5,
            maxJobPostsPerMonth: 3,
            platformFeePercent: 10,
            featuredProfile: false,
            prioritySupport: false,
            icon: Zap,
            highlighted: false,
          },
          {
            id: 2,
            name: 'PROFESSIONAL',
            displayName: 'Professional',
            description: 'For serious freelancers',
            monthlyPrice: 19,
            yearlyPrice: 190,
            maxBidsPerMonth: -1,
            maxJobPostsPerMonth: -1,
            platformFeePercent: 5,
            featuredProfile: true,
            prioritySupport: true,
            icon: Crown,
            highlighted: true,
          },
          {
            id: 3,
            name: 'ENTERPRISE',
            displayName: 'Enterprise',
            description: 'For teams and agencies',
            monthlyPrice: 0,
            yearlyPrice: 0,
            maxBidsPerMonth: -1,
            maxJobPostsPerMonth: -1,
            platformFeePercent: 0,
            featuredProfile: true,
            prioritySupport: true,
            icon: Rocket,
            highlighted: false,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const sub = await pricingApi.getMySubscription();
      setCurrentPlan(sub.plan?.name);
    } catch (error: any) {
      // Silently fail - user might not have a subscription yet
      if (error.response?.status !== 404) {
        console.error('Error fetching subscription:', error);
      }
    }
  };

  const handleSubscribe = async (plan: any) => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }

    if (plan.name === 'ENTERPRISE') {
      toast.info('Please contact sales for enterprise plans');
      return;
    }

    try {
      const price = billingPeriod === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
      
      if (price === 0) {
        // Free plan - just subscribe
        await pricingApi.subscribe({
          planId: plan.id,
          billingPeriod: billingPeriod,
        });
        toast.success('Subscribed successfully!');
        fetchCurrentSubscription();
      } else {
        // Paid plan - redirect to payment
        toast.info('Payment integration coming soon');
        // TODO: Integrate with payment gateway
      }
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background pt-24 pb-20">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose the plan that works best for you. No hidden fees, no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Billing Period Toggle */}
      {plans.length > 0 && (
        <section className="py-8">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto flex justify-center">
              <div className="inline-flex rounded-lg border border-border p-1 bg-muted">
                <button
                  onClick={() => setBillingPeriod('MONTHLY')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingPeriod === 'MONTHLY'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('YEARLY')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingPeriod === 'YEARLY'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Yearly (Save 17%)
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="w-full px-4 md:px-8 lg:px-12">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan, index) => {
                const Icon = plan.icon;
                const price = billingPeriod === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;
                const isCurrentPlan = currentPlan === plan.name;
                const features = getPlanFeatures(plan);
                
                return (
                  <div
                    key={index}
                    className={`rounded-2xl border p-8 relative ${
                      plan.highlighted
                        ? 'border-primary shadow-2xl shadow-primary/20 scale-105 bg-gradient-to-b from-primary/5 to-background'
                        : 'border-border bg-card'
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold rounded-full">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-muted-foreground text-sm">{plan.description}</p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">
                          {price === 0 ? 'Free' : `Rs. ${price.toLocaleString()}`}
                        </span>
                        {price > 0 && (
                          <span className="text-muted-foreground">
                            {' / '}{billingPeriod === 'YEARLY' ? 'year' : 'month'}
                          </span>
                        )}
                      </div>
                    </div>

                    {isCurrentPlan ? (
                      <Button
                        className="w-full mb-8"
                        variant="outline"
                        size="lg"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className={`w-full mb-8 ${
                          plan.highlighted
                            ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                            : ''
                        }`}
                        variant={plan.highlighted ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => handleSubscribe(plan)}
                      >
                        {price === 0 ? 'Get Started' : plan.name === 'ENTERPRISE' ? 'Contact Sales' : 'Subscribe'}
                      </Button>
                    )}

                    <div className="space-y-3">
                      {features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Have questions? We've got answers.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <span className="font-semibold">{faq.question}</span>
                    <span className="text-2xl text-muted-foreground">
                      {openFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-12 text-center text-white max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Still have questions?</h2>
            <p className="text-xl mb-8 text-white/90">
              Our team is here to help. Get in touch and we'll answer any questions you have.
            </p>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function getPlanFeatures(plan: any): string[] {
  const base = [
    plan.maxBidsPerMonth === -1 ? 'Unlimited bids' : `Up to ${plan.maxBidsPerMonth} bids/month`,
    plan.maxJobPostsPerMonth === -1 ? 'Unlimited job posts' : `Up to ${plan.maxJobPostsPerMonth} job posts/month`,
    `${plan.platformFeePercent}% platform fee`,
  ];
  
  if (plan.featuredProfile) {
    base.push('Featured profile badge');
  }
  if (plan.prioritySupport) {
    base.push('Priority support');
  }
  if (plan.name === 'PROFESSIONAL' || plan.name === 'ENTERPRISE') {
    base.push('Advanced analytics');
  }
  if (plan.name === 'ENTERPRISE') {
    base.push('Team management', 'Dedicated account manager', 'Custom contracts');
  }
  
  return base;
}