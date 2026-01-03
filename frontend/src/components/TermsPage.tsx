import { Header } from './Header';
import { Footer } from './Footer';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing and using SajiloKaam, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
  },
  {
    title: '2. Use License',
    content: `Permission is granted to temporarily download one copy of the materials on SajiloKaam's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to reverse engineer any software contained on SajiloKaam's website; remove any copyright or other proprietary notations from the materials; or transfer the materials to another person or "mirror" the materials on any other server.`,
  },
  {
    title: '3. User Accounts',
    content: `You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password. SajiloKaam reserves the right to refuse service, terminate accounts, or remove or edit content in its sole discretion.`,
  },
  {
    title: '4. Service Terms for Freelancers',
    content: `Freelancers must provide accurate information about their skills, experience, and qualifications. All work must be original and delivered as promised. Freelancers agree to communicate professionally and meet agreed-upon deadlines. Platform fees apply to all transactions as outlined in the pricing page.`,
  },
  {
    title: '5. Service Terms for Clients',
    content: `Clients must provide clear project requirements and fair compensation. Payment must be made according to agreed terms. Clients agree to provide timely feedback and communicate professionally with freelancers.`,
  },
  {
    title: '6. Payment Terms',
    content: `All payments are processed through SajiloKaam's secure payment system. Platform fees are deducted from each transaction. Refunds are handled on a case-by-case basis according to our dispute resolution policy. Freelancers can withdraw earnings according to the withdrawal schedule outlined in their account settings.`,
  },
  {
    title: '7. Intellectual Property',
    content: `Unless otherwise agreed, all intellectual property rights for work completed through SajiloKaam transfers to the client upon full payment. Freelancers retain the right to showcase completed work in their portfolio unless a non-disclosure agreement is in place.`,
  },
  {
    title: '8. Dispute Resolution',
    content: `In case of disputes, both parties agree to first attempt resolution through SajiloKaam's mediation service. If mediation fails, disputes will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.`,
  },
  {
    title: '9. Prohibited Activities',
    content: `Users may not: engage in fraudulent activities; harass or threaten other users; post illegal, offensive, or inappropriate content; attempt to circumvent platform fees; use the platform for money laundering or other illegal activities; create multiple accounts to manipulate the system.`,
  },
  {
    title: '10. Limitation of Liability',
    content: `SajiloKaam shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use or inability to use the service. In no event shall SajiloKaam's total liability to you exceed the amount you paid to SajiloKaam in the past twelve months.`,
  },
  {
    title: '11. Service Modifications',
    content: `SajiloKaam reserves the right to modify or discontinue the service at any time without notice. We are not liable to you or any third party for any modification, suspension, or discontinuance of the service.`,
  },
  {
    title: '12. Governing Law',
    content: `These terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.`,
  },
];

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-56 pb-20">
        {/* Header */}
        <div className="mb-12 mt-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: January 3, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-12 p-6 rounded-xl bg-muted/30 border border-border">
          <p className="text-muted-foreground">
            Welcome to SajiloKaam. These Terms of Service ("Terms") govern your use of our website 
            and services. Please read them carefully. By using SajiloKaam, you agree to be bound by 
            these Terms. If you don't agree to these Terms, please don't use our services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="pb-8 border-b border-border last:border-0">
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              <div className="text-muted-foreground leading-relaxed">
                {section.content.split('\n').map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <br key={idx} />;
                  return (
                    <p key={idx} className="mb-3">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
          <h3 className="font-semibold mb-2">Questions about our Terms?</h3>
          <p className="text-muted-foreground mb-4">
            If you have any questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@sajilokaam.com" className="text-primary hover:underline">
              legal@sajilokaam.com
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}