import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { useRouter } from "./Router";

const footerLinks = {
  "For Clients": [
    { label: "How to Hire", page: "features" as const },
    { label: "Find Freelancers", page: "find-freelancers" as const },
    { label: "Post a Job", page: "post-job" as const },
    { label: "Pricing", page: "pricing" as const },
  ],
  "For Freelancers": [
    { label: "How to Find Work", page: "features" as const },
    { label: "Find Jobs", page: "find-work" as const },
    { label: "Success Stories", page: "about" as const },
  ],
  "Resources": [
    { label: "Help & Support", page: "contact" as const },
    { label: "Contact", page: "contact" as const },
    { label: "Blog", page: "about" as const },
  ],
  "Company": [
    { label: "About Us", page: "about" as const },
    { label: "Careers", page: "contact" as const },
    { label: "Contact Us", page: "contact" as const },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

export function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16">
        {/* Top Section */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-semibold">SajiloKaam</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Connecting talent with opportunity worldwide.
            </p>
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-foreground">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.page ? (
                      <button
                        onClick={() => navigate(link.page)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href="#"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 SajiloKaam Inc. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-6 md:mt-0">
            <button
              onClick={() => navigate('privacy')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate('terms')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </button>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}