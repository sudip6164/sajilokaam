import { MapPin, Clock, DollarSign, Star, Heart, Bookmark, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';

export interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: {
    type: 'fixed' | 'hourly';
    amount: number;
    max?: number;
  };
  skills: string[];
  postedTime: string;
  client: {
    name: string;
    rating: number;
    reviews: number;
    location: string;
    verified: boolean;
  };
  proposals: number;
  experienceLevel: 'Entry Level' | 'Intermediate' | 'Expert';
  projectLength: string;
  isUrgent?: boolean;
  isFeatured?: boolean;
}

interface EnhancedJobCardProps {
  job: Job;
  onViewDetails: (id: number) => void;
  showSaveButton?: boolean;
}

export function EnhancedJobCard({ job, onViewDetails, showSaveButton = true }: EnhancedJobCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div 
      className={`bg-card rounded-xl border-2 transition-all hover:border-primary/50 hover:shadow-lg cursor-pointer ${
        job.isFeatured ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5' : 'border-border'
      }`}
      onClick={() => onViewDetails(job.id)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {job.isFeatured && (
                <Badge className="bg-gradient-to-r from-primary to-secondary">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {job.isUrgent && (
                <Badge variant="destructive">
                  <Clock className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
              <Badge variant="outline">{job.category}</Badge>
              <Badge variant="outline">{job.experienceLevel}</Badge>
            </div>
            <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              {job.title}
            </h3>
          </div>
          
          {showSaveButton && (
            <div className="flex gap-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-lg border border-border hover:border-primary transition-all ${
                  isLiked ? 'bg-red-50 border-red-300' : 'bg-background'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </button>
              <button
                onClick={handleSave}
                className={`p-2 rounded-lg border border-border hover:border-primary transition-all ${
                  isSaved ? 'bg-primary/10 border-primary' : 'bg-background'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {job.description}
        </p>

        {/* Budget & Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-semibold">
                {job.budget.type === 'fixed' 
                  ? `Rs. ${job.budget.amount.toLocaleString()}`
                  : `Rs. ${job.budget.amount}-${job.budget.max || job.budget.amount * 2}/hr`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Clock className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-semibold text-sm">{job.projectLength}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Proposals</p>
              <p className="font-semibold">{job.proposals}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Posted</p>
              <p className="font-semibold text-sm">{job.postedTime}</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-muted text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 6 && (
              <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium text-muted-foreground">
                +{job.skills.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-semibold">
                {job.client.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{job.client.name}</p>
                {job.client.verified && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{job.client.rating}</span>
                  <span>({job.client.reviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{job.client.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
