import { Header } from './Header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
        {children}
      </main>
    </div>
  );
}