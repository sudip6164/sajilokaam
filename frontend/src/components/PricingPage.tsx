import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { Button } from './ui/button';

const plans = [
  {
    name: 'Free',
    icon: Zap,
    price: 'Rs. 0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Browse unlimited jobs',
      'Submit up to 5 bids/month',
      'Basic profile',
      'Standard support',
      '10% platform fee',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    icon: Crown,
    price: 'Rs. 19',
    period: 'per month',
    description: 'For serious freelancers',
    features: [
      'Everything in Free',
      'Unlimited bids',
      'Featured profile badge',
      'Priority support',
      '5% platform fee',
      'Advanced analytics',
      'Portfolio showcase',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    icon: Rocket,
    price: 'Custom',
    period: 'contact us',
    description: 'For teams and agencies',
    features: [
      'Everything in Professional',
      'Team management',
      'Dedicated account manager',
      'Custom contracts',
      'Negotiable fees',
      'API access',
      'White-label options',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
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
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">/ {plan.period}</span>
                    </div>
                  </div>

                  <Button
                    className={`w-full mb-8 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                        : ''
                    }`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
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