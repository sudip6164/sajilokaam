import { FileText, Users, CheckCircle } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: FileText,
    title: "Post a Job",
    description: "Describe your project and get proposals from qualified freelancers within minutes."
  },
  {
    number: 2,
    icon: Users,
    title: "Hire Talent",
    description: "Review profiles, portfolios, and proposals. Interview and hire the best freelancer for your project."
  },
  {
    number: 3,
    icon: CheckCircle,
    title: "Get Work Done",
    description: "Collaborate, track progress, and receive high-quality work on time and on budget."
  }
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get your project done in three simple steps
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.number} className="relative text-center">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-16 hidden h-0.5 w-full bg-gradient-to-r from-primary to-primary/30 md:block" />
                )}
                
                {/* Step Icon */}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <IconComponent className="h-8 w-8" />
                  <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground text-xs font-bold text-primary">
                    {step.number}
                  </div>
                </div>

                {/* Step Content */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}