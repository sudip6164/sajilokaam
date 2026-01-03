import { Header } from './Header';
import { Footer } from './Footer';
import { Shield, Eye, Lock, Database, UserCheck, Bell } from 'lucide-react';

const highlights = [
  {
    icon: Shield,
    title: 'Your Privacy Matters',
    description: 'We take your privacy seriously and are committed to protecting your personal information.',
  },
  {
    icon: Lock,
    title: 'Secure Data',
    description: 'Your data is encrypted and stored securely using industry-standard practices.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'We are clear about what data we collect and how we use it.',
  },
];

const sections = [
  {
    title: '1. Information We Collect',
    icon: Database,
    content: `We collect information you provide directly to us, including:
    
• Account information (name, email, password)
• Profile information (skills, experience, portfolio)
• Payment information (processed securely through our payment partners)
• Communications between users
• Usage data and analytics

We also automatically collect certain information about your device and how you interact with our services, including IP address, browser type, operating system, and pages visited.`,
  },
  {
    title: '2. How We Use Your Information',
    icon: UserCheck,
    content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Send you technical notices and support messages
• Respond to your comments and questions
• Monitor and analyze trends and usage
• Detect and prevent fraud and abuse
• Personalize your experience
• Send promotional communications (with your consent)`,
  },
  {
    title: '3. Information Sharing',
    content: `We do not sell your personal information. We may share your information only in the following circumstances:

• With other users as necessary to provide our services (e.g., sharing your profile with potential clients)
• With service providers who perform services on our behalf
• To comply with legal obligations or protect our rights
• In connection with a merger, acquisition, or sale of assets
• With your consent`,
  },
  {
    title: '4. Data Security',
    icon: Lock,
    content: `We implement appropriate technical and organizational measures to protect your personal information, including:

• Encryption of data in transit and at rest
• Regular security assessments
• Access controls and authentication
• Secure payment processing through PCI-compliant partners
• Employee training on data protection

However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '5. Your Rights and Choices',
    content: `You have the right to:

• Access your personal information
• Correct inaccurate information
• Delete your account and data
• Export your data
• Opt-out of marketing communications
• Object to processing of your data
• Withdraw consent

To exercise these rights, please contact us at privacy@sajilokaam.com.`,
  },
  {
    title: '6. Cookies and Tracking',
    content: `We use cookies and similar tracking technologies to:

• Remember your preferences
• Understand how you use our services
• Improve our services
• Provide targeted advertising

You can control cookies through your browser settings, but this may affect your ability to use certain features.`,
  },
  {
    title: '7. Data Retention',
    content: `We retain your personal information for as long as necessary to:

• Provide our services
• Comply with legal obligations
• Resolve disputes
• Enforce our agreements

When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it by law.`,
  },
  {
    title: '8. International Data Transfers',
    content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.`,
  },
  {
    title: '9. Children\'s Privacy',
    content: `Our services are not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.`,
  },
  {
    title: '10. Changes to This Policy',
    icon: Bell,
    content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.`,
  },
];

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-32 pb-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: January 3, 2026
          </p>
        </div>

        {/* Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-xl bg-gradient-to-b from-primary/5 to-background border border-primary/20 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{highlight.title}</h3>
                <p className="text-sm text-muted-foreground">{highlight.description}</p>
              </div>
            );
          })}
        </div>

        {/* Introduction */}
        <div className="mb-12 p-6 rounded-xl bg-muted/30 border border-border">
          <p className="text-muted-foreground">
            At SajiloKaam, we respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you use our platform. Please read this policy carefully to understand our practices 
            regarding your personal data.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="pb-8 border-b border-border last:border-0">
                <div className="flex items-start gap-3 mb-4">
                  {Icon && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                </div>
                <div className="text-muted-foreground leading-relaxed">
                  {section.content.split('\n').map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <br key={idx} />;
                    if (trimmed.startsWith('•')) {
                      return (
                        <p key={idx} className="ml-4 mb-2">
                          {trimmed}
                        </p>
                      );
                    }
                    return (
                      <p key={idx} className="mb-3">
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
          <h3 className="font-semibold mb-2">Questions about Privacy?</h3>
          <p className="text-muted-foreground mb-4">
            If you have any questions or concerns about our Privacy Policy or data practices, please contact our Data Protection Officer at{' '}
            <a href="mailto:privacy@sajilokaam.com" className="text-primary hover:underline">
              privacy@sajilokaam.com
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}