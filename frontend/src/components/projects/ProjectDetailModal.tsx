import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  User,
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
}

export function ProjectDetailModal({
  isOpen,
  onClose,
  project
}: ProjectDetailModalProps) {
  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
      'ACTIVE': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'PENDING_PAYMENT': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Calendar },
      'COMPLETED': { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };

    const style = statusStyles[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Briefcase };
    const Icon = style.icon;

    return (
      <Badge className={`${style.bg} ${style.text} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                {getStatusBadge(project.status)}
              </div>
              <p className="text-gray-600 text-sm">Project ID: #{project.id}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Project Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Project Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="mt-1 text-gray-900">{project.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Budget</label>
                  <p className="mt-1 text-lg font-semibold text-primary">
                    Rs. {project.budget?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(project.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Freelancer Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Freelancer Details
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="font-medium">{project.freelancer?.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="font-medium">{project.freelancer?.email}</span>
              </div>
              {project.freelancer?.id && (
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {project.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed:</span>
                  <span className="font-medium">
                    {new Date(project.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment Status */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Payment Status
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Payment Secured in Escrow</p>
                  <p className="text-sm text-green-700">
                    Rs. {project.budget?.toLocaleString()} is held securely until project completion
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
