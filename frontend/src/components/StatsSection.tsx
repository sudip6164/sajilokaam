import { Users, Briefcase, DollarSign, Star } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Active Freelancers',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Briefcase,
    value: '10,000+',
    label: 'Projects Completed',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    icon: DollarSign,
    value: '$5M+',
    label: 'Total Earnings Paid',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: Star,
    value: '4.9/5',
    label: 'Average Rating',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
];

export function StatsSection() {
  return (
    <section className="w-full bg-gradient-to-br from-primary to-secondary py-16 md:py-20" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw' }}>
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-4xl font-bold text-white md:text-5xl">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-white/90 md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}