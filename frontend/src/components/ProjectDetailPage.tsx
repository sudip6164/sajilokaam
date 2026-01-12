import { useState, useEffect } from 'react';
import { Header } from './Header';
import { ProjectWorkspace } from './projects/ProjectWorkspace';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from './Router';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi } from '@/lib/api';
import { toast } from 'sonner';

export function ProjectDetailPage() {
  const { navigate, pageParams } = useRouter();
  const { hasRole } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const getDashboardRoute = () => {
    if (hasRole('CLIENT')) return 'client-dashboard';
    if (hasRole('FREELANCER')) return 'freelancer-dashboard';
    return 'home';
  };

  useEffect(() => {
    const projectId = pageParams?.projectId;
    if (projectId) {
      fetchProject(projectId);
    } else {
      toast.error('Project ID not provided');
      navigate(getDashboardRoute());
    }
  }, [pageParams?.projectId]);

  const fetchProject = async (projectId: number) => {
    try {
      setLoading(true);
      const data = await projectsApi.get(projectId);
      setProject(data);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
      navigate(getDashboardRoute());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading project...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Project not found</p>
            <Button onClick={() => navigate(getDashboardRoute())} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(getDashboardRoute())}
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