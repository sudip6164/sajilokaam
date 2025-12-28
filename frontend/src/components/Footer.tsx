import { Link } from "react-router-dom";
import { 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Heart
} from "lucide-react";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Blog", href: "/blog" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Community", href: "/community" },
  ],
  legal: [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Licenses", href: "/licenses" },
  ],
  services: [
    { name: "Find Freelancers", href: "/freelancers" },
    { name: "Post a Job", href: "/post-job" },
    { name: "Pricing", href: "/pricing" },
    { name: "Enterprise", href: "/enterprise" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-background">
                  Sajilo<span className="text-primary-light">Kaam</span>
                </span>
                <span className="text-[10px] text-background/60 -mt-1">Easy Work for Nepal</span>
              </div>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed mb-6 max-w-xs">
              Connecting Nepal's best freelance talent with amazing clients. 
              Build your dream team or grow your freelance career with us.
            </p>
            <div className="space-y-3">
              <a 
                href="mailto:info@sajilokaam.com" 
                className="flex items-center gap-3 text-sm text-background/70 hover:text-primary-light transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@sajilokaam.com
              </a>
              <a 
                href="tel:+9771234567890" 
                className="flex items-center gap-3 text-sm text-background/70 hover:text-primary-light transition-colors"
              >
                <Phone className="w-4 h-4" />
                +977 1234567890
              </a>
              <p className="flex items-center gap-3 text-sm text-background/70">
                <MapPin className="w-4 h-4" />
                Kathmandu, Nepal
              </p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-background mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-background/70 hover:text-primary-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-background mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-background/70 hover:text-primary-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-background mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-background/70 hover:text-primary-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-background mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-background/70 hover:text-primary-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/60 flex items-center gap-1">
            © {new Date().getFullYear()} Sajilo Kaam. Made with 
            <Heart className="w-4 h-4 text-destructive fill-destructive" /> 
            in Nepal
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center text-background/70 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                aria-label={social.name}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
