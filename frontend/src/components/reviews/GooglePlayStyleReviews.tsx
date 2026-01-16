import { useState, useEffect } from 'react';
import { Star, Filter, ChevronDown, ThumbsUp, Flag, MoreVertical, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { reviewsApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { LeaveReview } from './ReviewsComponents';

interface Review {
  id: number;
  reviewerId?: number;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  projectTitle?: string;
  date: string;
  helpful?: number;
}

interface GooglePlayStyleReviewsProps {
  userId: number;
  userType: 'freelancer' | 'client';
  userName: string;
  canLeaveReview?: boolean;
  completedProjects?: Array<{ id: number; title: string; freelancerId?: number; clientId?: number }>;
}

export function GooglePlayStyleReviews({ 
  userId, 
  userType, 
  userName,
  canLeaveReview = false,
  completedProjects = []
}: GooglePlayStyleReviewsProps) {
  const { user: currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [showLeaveReviewModal, setShowLeaveReviewModal] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [userId, currentUser?.id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsApi.listByUser(userId);
      const mappedReviews = Array.isArray(data) ? data.map((r: any) => ({
        id: r.id,
        reviewerId: r.reviewer?.id,
        reviewerName: r.reviewer?.fullName || 'Anonymous',
        reviewerAvatar: r.reviewer?.profilePictureUrl || r.reviewer?.profilePicture,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        projectTitle: r.project?.title,
        date: r.createdAt,
        helpful: 0,
      })) : [];
      setReviews(mappedReviews);
      
      // Check if current user has already reviewed this person
      if (currentUser) {
        const userReviewFound = mappedReviews.find((r: Review) => r.reviewerId === currentUser.id);
        if (userReviewFound) {
          setHasUserReviewed(true);
          setUserReview(userReviewFound);
        } else {
          setHasUserReviewed(false);
          setUserReview(null);
        }
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      // Don't show error toast if it's just 404 (endpoint not available or no reviews yet)
      if (error.response?.status !== 404) {
        toast.error('Failed to load reviews');
      }
      // Set empty array on error - backend endpoint may not be available yet
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await reviewsApi.delete(reviewId);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleUpdateReview = async (reviewId: number, data: { rating: number; title: string; comment: string }) => {
    try {
      await reviewsApi.update(reviewId, data);
      toast.success('Review updated successfully');
      setEditingReview(null);
      await fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update review');
    }
  };

  const filteredAndSortedReviews = reviews
    .filter(r => filterRating === null || r.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'highest') {
        return b.rating - a.rating;
      } else if (sortBy === 'lowest') {
        return a.rating - b.rating;
      } else {
        return (b.helpful || 0) - (a.helpful || 0);
      }
    });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;
  
  const ratingDistribution = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      {/* Rating Overview - Google Play Style */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-[200px_1fr] gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              {renderStars(Math.round(averageRating), 'lg')}
              <p className="text-sm text-muted-foreground mt-2">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                return (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      filterRating === rating ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">Filter by rating:</span>
          {filterRating && (
            <Badge variant="secondary" className="gap-1">
              {filterRating} stars
              <button
                onClick={() => setFilterRating(null)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Edit Review Button (if user already reviewed) */}
      {canLeaveReview && currentUser && hasUserReviewed && userReview && (
        <Button 
          onClick={() => setEditingReview(userReview)}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Your Review
        </Button>
      )}

      {/* Leave Review Button */}
      {canLeaveReview && currentUser && !hasUserReviewed && (
        <div className="flex flex-col gap-2">
          {completedProjects.length > 1 ? (
            <>
              <Button 
                onClick={() => {
                  // If multiple projects, show a selector
                  setShowProjectSelector(true);
                }}
                className="w-full sm:w-auto"
              >
                <Star className="h-4 w-4 mr-2" />
                Write a Review ({completedProjects.length} projects)
              </Button>
              
              {/* Project Selector Modal */}
              {showProjectSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle>Select a Project to Review (Optional)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                        <button
                          onClick={() => {
                            setSelectedProject(null);
                            setShowProjectSelector(false);
                            setShowLeaveReviewModal(true);
                          }}
                          className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                          <p className="font-medium">General Review (No specific project)</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Leave a general review without linking to a specific project
                          </p>
                        </button>
                        {completedProjects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => {
                              setSelectedProject(project);
                              setShowProjectSelector(false);
                              setShowLeaveReviewModal(true);
                            }}
                            className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                          >
                            <p className="font-medium">{project.title}</p>
                            {project.budget && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Budget: ${project.budget.toLocaleString()}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowProjectSelector(false)}
                      >
                        Cancel
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <Button 
              onClick={() => {
                // Use the first project if available, otherwise null (no project)
                setSelectedProject(completedProjects.length === 1 ? completedProjects[0] : null);
                setShowLeaveReviewModal(true);
              }}
              className="w-full sm:w-auto"
            >
              <Star className="h-4 w-4 mr-2" />
              Write a Review
            </Button>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="font-semibold mb-2">No reviews yet</h3>
            <p className="text-sm text-muted-foreground">
              {filterRating 
                ? `No ${filterRating}-star reviews found`
                : 'Be the first to leave a review'}
            </p>
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Reviewer Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={review.reviewerAvatar ? (
                          review.reviewerAvatar.startsWith('http') 
                            ? review.reviewerAvatar 
                            : `http://localhost:8080/api/profile/freelancer/picture/${review.reviewerAvatar}`
                        ) : undefined} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                        {review.reviewerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{review.reviewerName}</span>
                        {review.rating === 5 && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            Top Rated
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {renderStars(review.rating, 'sm')}
                        <span>•</span>
                        <span>{formatDate(review.date)}</span>
                        {review.projectTitle && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {review.projectTitle}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {currentUser && review.reviewerId === currentUser.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingReview(review)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Review
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this review?')) {
                              handleDeleteReview(review.id);
                            }
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <p className="font-semibold mb-2">{review.title}</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{review.comment}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Helpful ({review.helpful || 0})</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Flag className="h-4 w-4" />
                    <span>Report</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Leave Review Modal */}
      {showLeaveReviewModal && (
        <LeaveReview
          projectTitle={selectedProject?.title || `General Review`}
          freelancerName={userName}
          onSubmit={async (review) => {
            try {
              console.log('GooglePlayStyleReviews: Creating review with revieweeId:', userId, 'for userType:', userType);
              console.log('GooglePlayStyleReviews: Current user:', currentUser?.id, 'Reviewing user:', userId);
              await reviewsApi.createReview({
                projectId: selectedProject?.id,
                revieweeId: userId, // This should be the USER ID, not profile ID
                rating: review.rating,
                title: review.title,
                comment: review.comment,
              });
              toast.success('Review submitted successfully');
              setShowLeaveReviewModal(false);
              setSelectedProject(null);
              await fetchReviews();
            } catch (error: any) {
              toast.error(error.response?.data?.message || 'Failed to submit review');
            }
          }}
          onCancel={() => {
            setShowLeaveReviewModal(false);
            setSelectedProject(null);
          }}
        />
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <LeaveReview
          projectTitle={editingReview.projectTitle || `General Review`}
          freelancerName={userName}
          initialRating={editingReview.rating}
          initialTitle={editingReview.title}
          initialComment={editingReview.comment}
          onSubmit={async (review) => {
            await handleUpdateReview(editingReview.id, review);
          }}
          onCancel={() => {
            setEditingReview(null);
          }}
        />
      )}
    </div>
  );
}
