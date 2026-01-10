import { useState } from 'react';
import { Header } from './Header';
import { ProjectWorkspace } from './projects/ProjectWorkspace';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from './Router';

export function ProjectDetailPage() {
  const { navigate } = useRouter();

  const project = {
    id: 1,
    title: 'E-commerce Platform Development',
    client: 'TechVentures Inc',
    freelancer: 'Sarah Johnson',
    status: 'active' as const,
    budget: 8500,
    budgetType: 'fixed' as const,
    startDate: '2024-01-15',
    endDate: '2024-03-30',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('freelancer-dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Project Workspace */}
        <ProjectWorkspace project={project} />
      </main>
    </div>
  );
}