import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle, ArrowRight, RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const failureTypes = {
  generic: {
    icon: XCircle,
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again or contact support if the problem persists.",
    primaryAction: { label: "Try Again", href: "/" },
    secondaryAction: { label: "Contact Support", href: "/contact" },
  },
  payment: {
    icon: XCircle,
    title: "Payment Failed",
    message: "Your payment could not be processed. Please check your payment details and try again.",
    primaryAction: { label: "Retry Payment", href: "/client-invoices" },
    secondaryAction: { label: "Go to Dashboard", href: "/client" },
  },
  verification: {
    icon: AlertTriangle,
    title: "Verification Failed",
    message: "We couldn't verify your email address. The link may have expired. Please request a new verification email.",
    primaryAction: { label: "Resend Verification", href: "/verify-email" },
    secondaryAction: { label: "Contact Support", href: "/contact" },
  },
  access: {
    icon: AlertTriangle,
    title: "Access Denied",
    message: "You don't have permission to access this resource. Please contact your administrator if you believe this is an error.",
    primaryAction: { label: "Go to Dashboard", href: "/freelancer" },
    secondaryAction: { label: "Go Home", href: "/" },
  },
};

const Failure = () => {
  const [searchParams] = useSearchParams();
  const type = (searchParams.get("type") as keyof typeof failureTypes) || "generic";
  const errorCode = searchParams.get("code");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = failureTypes[type] || failureTypes.generic;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div
            className={`mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6 transition-all duration-700 ${
              mounted ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <Icon className="h-10 w-10 text-destructive" />
          </div>

          <h1
            className={`text-2xl md:text-3xl font-display font-bold mb-3 transition-all duration-500 delay-200 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {config.title}
          </h1>

          <p
            className={`text-muted-foreground mb-4 transition-all duration-500 delay-300 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {config.message}
          </p>

          {errorCode && (
            <p
              className={`text-sm text-muted-foreground mb-6 font-mono bg-muted px-3 py-1 rounded inline-block transition-all duration-500 delay-350 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              Error Code: {errorCode}
            </p>
          )}

          <div
            className={`space-y-3 transition-all duration-500 delay-400 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <Button asChild className="w-full gap-2">
              <Link to={config.primaryAction.href}>
                <RefreshCw className="h-4 w-4" />
                {config.primaryAction.label}
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full gap-2">
              <Link to={config.secondaryAction.href}>
                {config.secondaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Still having issues?{" "}
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

export default Failure;
