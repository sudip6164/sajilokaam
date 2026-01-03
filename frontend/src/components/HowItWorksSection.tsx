import { UserPlus, Search, Handshake } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Sign up and build a compelling profile showcasing your skills, experience, and portfolio.',
    step: '01',
  },
  {
    icon: Search,
    title: 'Find Perfect Match',
    description: 'Browse thousands of jobs or freelancers. Use filters to find exactly what you need.',
    step: '02',
  },
  {
    icon: Handshake,
    title: 'Work & Get Paid',
    description: 'Collaborate seamlessly, deliver quality work, and receive secure payments.',
    step: '03',
  },
];

export function HowItWorksSection() {
  return (
    <section className="w-full py-20 bg-background">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection Lines (Desktop only) */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-20" 
               style={{ width: '66%', left: '17%' }} />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Step Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                  {step.step}
                </div>

                {/* Card */}
                <div className="bg-card rounded-xl border border-border p-8 pt-10 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 mb-6">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}