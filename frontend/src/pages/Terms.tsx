import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="py-20">
      <div className="container max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms & Conditions</h1>
          <p className="text-muted-foreground">Last updated: December 19, 2024</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Welcome to Sajilo Kaam ("Company", "we", "our", "us"). These Terms of Service ("Terms", "Terms of Service") 
              govern your use of our website located at sajilokaam.com and our mobile application (together or individually "Service") 
              operated by Sajilo Kaam Pvt. Ltd.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, 
              then you may not access the Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To use certain features of our Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access or security breaches</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Freelancer Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a freelancer on Sajilo Kaam, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate information about your skills, experience, and qualifications</li>
              <li>Complete projects according to the agreed-upon terms with clients</li>
              <li>Communicate professionally and respond to messages in a timely manner</li>
              <li>Not engage in fraudulent activities or misrepresent your capabilities</li>
              <li>Pay applicable service fees as outlined in our pricing</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Client Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              As a client on Sajilo Kaam, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide clear and accurate project requirements</li>
              <li>Fund escrow accounts for milestones as agreed</li>
              <li>Review and approve work in a reasonable timeframe</li>
              <li>Not request work outside of the platform to avoid fees</li>
              <li>Pay freelancers promptly upon satisfactory completion of work</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All payments are processed through our secure payment system:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Clients must fund milestones before freelancers begin work</li>
              <li>Funds are held in escrow until work is approved</li>
              <li>Service fees are deducted from payments as per your plan</li>
              <li>Withdrawals are processed within 3-5 business days</li>
              <li>All transactions are in Nepali Rupees (NPR)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You may not use our Service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>For any unlawful purpose or to solicit illegal activities</li>
              <li>To harass, abuse, or harm another person</li>
              <li>To impersonate another user or person</li>
              <li>To upload viruses or malicious code</li>
              <li>To spam or send unsolicited communications</li>
              <li>To circumvent platform fees by taking transactions off-platform</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              In case of disputes between freelancers and clients, Sajilo Kaam will mediate and make a final decision 
              based on evidence provided by both parties. Our decision is final and binding. We encourage users to 
              communicate openly and resolve issues amicably before escalating to our support team.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sajilo Kaam is not liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of or inability to use the Service. We do not guarantee the quality of work 
              provided by freelancers or the accuracy of client requirements.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of significant changes 
              via email or through our platform. Continued use of the Service after changes constitutes acceptance 
              of the modified terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <ul className="list-none text-muted-foreground space-y-2">
              <li><strong>Email:</strong> legal@sajilokaam.com</li>
              <li><strong>Address:</strong> Putalisadak, Kathmandu, Nepal</li>
              <li><strong>Phone:</strong> +977 1-4XXXXXX</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-muted-foreground text-sm">
            By using Sajilo Kaam, you agree to these terms.
          </p>
          <Button variant="outline" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
