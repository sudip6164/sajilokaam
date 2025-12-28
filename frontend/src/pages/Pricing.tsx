import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, HelpCircle, Zap, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "0",
    period: "forever",
    icon: Zap,
    color: "primary",
    features: [
      { text: "Up to 5 bids per month", included: true },
      { text: "Basic profile", included: true },
      { text: "Standard support", included: true },
      { text: "Access to all job listings", included: true },
      { text: "Portfolio (3 projects)", included: true },
      { text: "Verification badge", included: false },
      { text: "Featured profile", included: false },
      { text: "Priority support", included: false },
      { text: "AI task generation", included: false },
      { text: "Unlimited bids", included: false },
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Freelancer Pro",
    description: "For serious freelancers",
    price: "500",
    period: "month",
    icon: Star,
    color: "secondary",
    features: [
      { text: "Unlimited bids", included: true },
      { text: "Enhanced profile", included: true },
      { text: "Priority support", included: true },
      { text: "Access to all job listings", included: true },
      { text: "Portfolio (20 projects)", included: true },
      { text: "Verification badge", included: true },
      { text: "Featured in searches", included: true },
      { text: "Skills assessment tests", included: true },
      { text: "AI task generation", included: true },
      { text: "Dedicated account manager", included: false },
    ],
    cta: "Start 14-Day Trial",
    popular: true
  },
  {
    name: "Client Pro",
    description: "For businesses & agencies",
    price: "1000",
    period: "month",
    icon: Crown,
    color: "accent",
    features: [
      { text: "Unlimited job posts", included: true },
      { text: "Priority freelancer matching", included: true },
      { text: "Dedicated support", included: true },
      { text: "Featured job listings", included: true },
      { text: "Team collaboration", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Bulk hiring tools", included: true },
      { text: "Custom contracts", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const comparisonFeatures = [
  { feature: "Monthly Bids", free: "5", freelancer: "Unlimited", client: "N/A" },
  { feature: "Job Posts", free: "N/A", freelancer: "N/A", client: "Unlimited" },
  { feature: "Portfolio Projects", free: "3", freelancer: "20", client: "N/A" },
  { feature: "Verification Badge", free: "❌", freelancer: "✓", client: "✓" },
  { feature: "Featured Listing", free: "❌", freelancer: "✓", client: "✓" },
  { feature: "AI Tools", free: "❌", freelancer: "✓", client: "✓" },
  { feature: "Priority Support", free: "❌", freelancer: "✓", client: "✓" },
  { feature: "Service Fee", free: "10%", freelancer: "5%", client: "N/A" },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Pricing Plans
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Simple, Transparent
              <span className="text-primary"> Pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Choose the plan that fits your needs. Start free and upgrade as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 bg-muted rounded-full">
              <button
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all",
                  !isAnnual ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  isAnnual ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                Annual
                <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const annualPrice = Math.round(parseInt(plan.price) * 12 * 0.8);
              const displayPrice = isAnnual ? Math.round(annualPrice / 12) : plan.price;
              
              return (
                <Card 
                  key={index} 
                  className={cn(
                    "relative border-2 transition-all duration-300",
                    plan.popular 
                      ? "border-primary shadow-lg scale-105 z-10" 
                      : "border-border hover:border-primary/50 hover:shadow-md"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 bg-gradient-primary text-primary-foreground text-sm font-medium rounded-full shadow-md">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4",
                      plan.color === "primary" && "bg-primary/10 text-primary",
                      plan.color === "secondary" && "bg-secondary/10 text-secondary",
                      plan.color === "accent" && "bg-accent/20 text-accent-foreground"
                    )}>
                      <plan.icon className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    
                    <div className="pt-4">
                      <span className="text-4xl font-bold text-foreground">
                        NPR {displayPrice}
                      </span>
                      {plan.price !== "0" && (
                        <span className="text-muted-foreground">/{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={cn(
                            "text-sm",
                            feature.included ? "text-foreground" : "text-muted-foreground/50"
                          )}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      variant={plan.popular ? "hero" : "outline"} 
                      className="w-full"
                      size="lg"
                      asChild
                    >
                      <Link to="/register">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Compare Plans</h2>
            <p className="text-muted-foreground">
              See which features are included in each plan.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-primary">Freelancer Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-foreground">Client Pro</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-4 px-4 text-foreground">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{row.free}</td>
                    <td className="py-4 px-4 text-center font-medium text-secondary">{row.freelancer}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{row.client}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Have Questions?</h2>
            <p className="text-muted-foreground mb-8">
              Check our FAQ or contact our sales team for custom enterprise solutions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/contact">
                  <HelpCircle className="w-4 h-4" />
                  Contact Sales
                </Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/register">Start Free Today</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
