import { useState } from 'react';
import { Star, ThumbsUp, Flag, MoreVertical, Calendar, Award } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export interface Review {
  id: number;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  projectTitle: string;
  date: string;
  helpful: number;
  response?: {
    text: string;
    date: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export function ReviewsList({ reviews, averageRating, totalReviews, ratingDistribution }: ReviewsListProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'highest') {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

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

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="grid md:grid-cols-[200px_1fr] gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
            {renderStars(Math.round(averageRating), 'lg')}
            <p className="text-sm text-muted-foreground mt-2">
              Based on {totalReviews} reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
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
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sort & Filter */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">All Reviews ({totalReviews})</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <div key={review.id} className="bg-card rounded-xl border border-border p-6">
            {/* Reviewer Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">
                    {review.reviewerName.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{review.reviewerName}</span>
                    {review.rating === 5 && (
                      <Badge variant="outline" className="gap-1">
                        <Award className="h-3 w-3" />
                        Top Rated
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {renderStars(review.rating, 'sm')}
                    <span>•</span>
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Review Content */}
            <div className="mb-4">
              <p className="font-semibold mb-2">{review.title}</p>
              <p className="text-muted-foreground">{review.comment}</p>
            </div>

            {/* Project Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-3 w-3" />
              <span>Project: {review.projectTitle}</span>
            </div>

            {/* Response (if any) */}
            {review.response && (
              <div className="p-4 rounded-lg bg-muted mt-4 border-l-4 border-primary">
                <p className="font-semibold text-sm mb-1">Response from Freelancer</p>
                <p className="text-sm text-muted-foreground mb-2">{review.response.text}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.response.date).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ThumbsUp className="h-4 w-4" />
                <span>Helpful ({review.helpful})</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Flag className="h-4 w-4" />
                <span>Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LeaveReviewProps {
  projectTitle: string;
  freelancerName: string;
  onSubmit: (review: { rating: number; title: string; comment: string }) => void;
  onCancel: () => void;
  initialRating?: number;
  initialTitle?: string;
  initialComment?: string;
}

export function LeaveReview({ projectTitle, freelancerName, onSubmit, onCancel, initialRating, initialTitle, initialComment }: LeaveReviewProps) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(initialTitle || '');
  const [comment, setComment] = useState(initialComment || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && title.trim() && comment.trim()) {
      onSubmit({ rating, title: title.trim(), comment: comment.trim() });
    }
  };

  const isValid = rating > 0 && title.length >= 10 && comment.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl border border-border max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold mb-1">{initialRating ? 'Edit Review' : 'Leave a Review'}</h2>
          <p className="text-sm text-muted-foreground">
            {initialRating 
              ? `Update your review for ${freelancerName}`
              : `Share your experience working with ${freelancerName}${projectTitle !== 'General Review' ? ` on "${projectTitle}"` : ''}`
            }
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block font-semibold mb-3">
              Overall Rating <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 font-semibold text-lg">
                  {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Below Average' : 'Poor'}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold mb-2">
              Review Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience in one sentence"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {title.length} / 10 characters minimum
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block font-semibold mb-2">
              Detailed Review <span className="text-destructive">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience, the quality of work, communication, and professionalism..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {comment.length} characters
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm">
              <strong>Note:</strong> Reviews are public and help other users make informed decisions. 
              Please be honest, constructive, and respectful in your feedback.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid}
            size="lg"
          >
            {initialRating ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </div>
  );
}
