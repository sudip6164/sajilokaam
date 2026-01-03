import { DashboardHeader } from './DashboardHeader';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="w-full px-4 md:px-8 lg:px-12 py-8">
        {children}
      </main>
    </div>
  );
}