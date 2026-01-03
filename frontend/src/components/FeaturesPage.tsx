import { Header } from './Header';
import { Footer } from './Footer';
import { 
  MessageSquare, Briefcase, DollarSign, Star, FileText, 
  Clock, TrendingUp, Shield, Users, Zap, CheckCircle, ArrowRight 
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useRouter } from './Router';

export function FeaturesPage() {
  const { navigate } = useRouter();

  const features = [
    {
      icon: MessageSquare,
      title: 'Real-Time Messaging',
      description: 'Connect instantly with clients and freelancers through our advanced messaging system with file sharing and read receipts.',
      color: 'from-blue-500 to-cyan-500',
      highlights: ['Instant notifications', 'File attachments', 'Project context', 'Online status'],
    },
    {
      icon: Briefcase,
      title: 'Project Management',
      description: 'Complete workspace with milestones, time tracking, file sharing, and activity feeds for seamless collaboration.',
      color: 'from-purple-500 to-pink-500',
      highlights: ['Milestone tracking', 'Time tracking', 'File management', 'Activity timeline'],
    },
    {
      icon: FileText,
      title: 'Smart Contracts',
      description: 'Create professional contracts with customizable terms, milestones, and payment schedules.',
      color: 'from-green-500 to-emerald-500',
      highlights: ['Legal templates', 'Custom terms', 'Digital signatures', 'Milestone payments'],
    },
    {
      icon: DollarSign,
      title: 'Invoicing & Payments',
      description: 'Generate professional invoices, track payments, and manage earnings with detailed analytics.',
      color: 'from-yellow-500 to-orange-500',
      highlights: ['Invoice generator', 'Payment tracking', 'Earnings analytics', 'Withdrawal system'],
    },
    {
      icon: Star,
      title: 'Reviews & Ratings',
      description: 'Build reputation with honest reviews, ratings, and feedback from clients and freelancers.',
      color: 'from-red-500 to-pink-500',
      highlights: ['5-star ratings', 'Detailed reviews', 'Response system', 'Rating distribution'],
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into earnings, project performance, and growth metrics.',
      color: 'from-indigo-500 to-purple-500',
      highlights: ['Earnings charts', 'Project breakdown', 'Growth tracking', 'Performance metrics'],
    },
  ];

  const platformFeatures = [
    {
      title: 'For Freelancers',
      items: [
        'Find projects matching your skills',
        'Submit compelling proposals',
        'Track time and earnings',
        'Build your portfolio',
        'Get paid securely',
        'Receive reviews and grow reputation',
      ],
    },
    {
      title: 'For Clients',
      items: [
        'Post unlimited projects',
        'Browse talented freelancers',
        'Review proposals efficiently',
        'Manage multiple projects',
        'Track progress in real-time',
        'Make secure payments',
      ],
    },
    {
      title: 'Platform Benefits',
      items: [
        'Secure escrow payments',
        '24/7 customer support',
        'Dispute resolution',
        'Mobile-responsive design',
        'Advanced search filters',
        'Verified profiles',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-background" />
          <div className="w-full px-4 md:px-8 lg:px-12 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 bg-gradient-to-r from-primary to-secondary">
                Complete Platform
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Everything You Need to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Succeed
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                A comprehensive freelancing platform with all the features you need for project management,
                communication, payments, and growth.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-secondary"
                  onClick={() => navigate('signup')}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('about')}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-20 bg-background">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need in one platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-card rounded-2xl border border-border p-8 hover:shadow-2xl transition-all duration-300 hover:border-primary/50"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Features by User Type */}
        <section className="py-20 bg-muted/30">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for Everyone
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tailored features for freelancers, clients, and the platform
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {platformFeatures.map((section, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl border border-border p-8"
                >
                  <h3 className="text-2xl font-bold mb-6">{section.title}</h3>
                  <ul className="space-y-4">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-background">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '15K+', label: 'Active Users', icon: Users },
                { value: '5K+', label: 'Projects Completed', icon: Briefcase },
                { value: '$2.4M+', label: 'Total Earnings', icon: DollarSign },
                { value: '4.8/5', label: 'Average Rating', icon: Star },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Trust */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Security & Trust
                </h2>
                <p className="text-xl text-muted-foreground">
                  Your security is our top priority
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Secure Payments',
                    description: 'All transactions are encrypted and protected with industry-standard security.',
                  },
                  {
                    title: 'Escrow Protection',
                    description: 'Funds are held securely until work is completed to your satisfaction.',
                  },
                  {
                    title: 'Verified Profiles',
                    description: 'Identity verification ensures you work with real, trusted professionals.',
                  },
                  {
                    title: 'Dispute Resolution',
                    description: 'Fair and impartial dispute resolution process to protect both parties.',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-xl border border-border p-6"
                  >
                    <div className="flex items-start gap-4">
                      <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-12 md:p-16 text-center max-w-5xl mx-auto">
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of freelancers and clients already succeeding on SajiloKaam
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => navigate('signup')}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    Sign Up Free
                    <Zap className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('contact')}
                    className="border-white text-white hover:bg-white/10"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}