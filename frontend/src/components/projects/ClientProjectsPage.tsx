import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '../Router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Loader2,
  Briefcase,
  User,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Upload
} from 'lucide-react';
import { DocumentUploadModal } from './DocumentUploadModal';
import { ProjectDetailModal } from './ProjectDetailModal';

export function ClientProjectsPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/projects/client/${user?.id}`);
      setProjects(response.data);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'PENDING_PAYMENT': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-blue-100 text-blue-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={`${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleUploadDocument = (project: any) => {
    setSelectedProject(project);
    setShowDocumentModal(true);
  };

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleCompleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to mark this project as complete? This will release the escrow funds to the freelancer.')) {
      return;
    }

    try {
      await api.put(`/api/projects/${projectId}/complete`);
      toast.success('Project marked as complete! Funds released to freelancer.');
      fetchProjects();
    } catch (error: any) {
      console.error('Error completing project:', error);
      toast.error(error.response?.data?.error || 'Failed to complete project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-1">Manage and track your active projects</p>
          </div>
          <Button onClick={() => navigate('client-dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <Briefcase className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {projects.filter(p => p.status === 'ACTIVE').length}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {projects.filter(p => p.status === 'COMPLETED').length}
                  </p>
                </div>
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-primary">
                    Rs. {projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-600 mb-6">
                Start by posting a job and accepting proposals from freelancers.
              </p>
              <Button onClick={() => navigate('post-job')}>
                Post a Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        {getStatusBadge(project.status)}
                      </div>
                      <p className="text-gray-600 text-sm">{project.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Freelancer</p>
                        <p className="font-medium">{project.freelancer?.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="font-medium">Rs. {project.budget?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Started</p>
                        <p className="font-medium">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => handleViewProject(project)}>
                      View Details
                    </Button>
                    {project.status === 'ACTIVE' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleUploadDocument(project)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Requirements
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleCompleteProject(project.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Project
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => navigate('messages', { recipientId: project.freelancer?.id })}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Document Upload Modal */}
        {selectedProject && showDocumentModal && (
          <DocumentUploadModal
            isOpen={showDocumentModal}
            onClose={() => {
              setShowDocumentModal(false);
              setSelectedProject(null);
            }}
            projectId={selectedProject.id}
            onUploadSuccess={() => {
              fetchProjects();
            }}
          />
        )}

        {/* Project Detail Modal */}
        {selectedProject && showProjectModal && (
          <ProjectDetailModal
            isOpen={showProjectModal}
            onClose={() => {
              setShowProjectModal(false);
              setSelectedProject(null);
            }}
            project={selectedProject}
          />
        )}
      </div>
    </div>
  );
}
