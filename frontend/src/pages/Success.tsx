import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Mail, CreditCard, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const successTypes = {
  generic: {
    icon: CheckCircle,
    title: "Success!",
    message: "Your action has been completed successfully.",
    primaryAction: { label: "Go to Dashboard", href: "/freelancer" },
    secondaryAction: { label: "Go Home", href: "/" },
  },
  payment: {
    icon: CreditCard,
    title: "Payment Successful!",
    message: "Your payment has been processed successfully. A confirmation email has been sent to your registered email address.",
    primaryAction: { label: "View Invoices", href: "/client/invoices" },
    secondaryAction: { label: "Go to Dashboard", href: "/client" },
  },
  email: {
    icon: Mail,
    title: "Email Verified!",
    message: "Your email has been verified successfully. You can now access all features of Sajilo Kaam.",
    primaryAction: { label: "Go to Login", href: "/login" },
    secondaryAction: { label: "Go Home", href: "/" },
  },
  registration: {
    icon: CheckCircle,
    title: "Registration Complete!",
    message: "Your account has been created successfully. Please check your email to verify your account.",
    primaryAction: { label: "Go to Login", href: "/login" },
    secondaryAction: { label: "Go Home", href: "/" },
  },
};

const Success = () => {
  const [searchParams] = useSearchParams();
  const type = (searchParams.get("type") as keyof typeof successTypes) || "generic";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = successTypes[type] || successTypes.generic;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div
            className={`mx-auto w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6 transition-all duration-700 ${
              mounted ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <Icon className="h-10 w-10 text-secondary" />
          </div>

          <h1
            className={`text-2xl md:text-3xl font-display font-bold mb-3 transition-all duration-500 delay-200 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {config.title}
          </h1>

          <p
            className={`text-muted-foreground mb-8 transition-all duration-500 delay-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {config.message}
          </p>

          <div
            className={`space-y-3 transition-all duration-500 delay-400 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <Button asChild className="w-full gap-2">
              <Link to={config.primaryAction.href}>
                {config.primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full gap-2">
              <Link to={config.secondaryAction.href}>
                <Home className="h-4 w-4" />
                {config.secondaryAction.label}
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
