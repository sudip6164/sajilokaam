import { useState, useEffect } from 'react';
import { Star, Filter, TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { reviewsApi } from '@/lib/api';
import { toast } from 'sonner';
import { GooglePlayStyleReviews } from './GooglePlayStyleReviews';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewManagementPageProps {
  userId: number;
  userType: 'freelancer' | 'client';
  userName: string;
}

export function ReviewManagementPage({ userId, userType, userName }: ReviewManagementPageProps) {
  const { user: currentUser } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log('ReviewManagementPage: Fetching reviews for userId:', userId, 'userType:', userType);
      if (!userId) {
        console.error('ReviewManagementPage: userId is undefined or null');
        setReviews([]);
        setLoading(false);
        return;
      }
      // Make sure userId is a number
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      console.log('ReviewManagementPage: Using numeric userId:', numericUserId);
      const data = await reviewsApi.listByUser(numericUserId);
      console.log('ReviewManagementPage: Received reviews data:', data);
      console.log('ReviewManagementPage: Reviews count:', Array.isArray(data) ? data.length : 0);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error URL:', error.config?.url);
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

  const filteredReviews = reviews
    .filter(r => filterRating === null || r.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'highest') {
        return b.rating - a.rating;
      } else {
        return a.rating - b.rating;
      }
    });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
    : 0;
  
  const totalReviews = reviews.length;
  const fiveStar = reviews.filter((r: any) => r.rating === 5).length;
  const oneStar = reviews.filter((r: any) => r.rating === 1).length;
  const ratingDistribution = reviews.reduce((acc: any, r: any) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
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
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
                <p className="text-3xl font-bold">{totalReviews}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">5-Star Reviews</p>
                <p className="text-3xl font-bold">{fiveStar}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">1-Star Reviews</p>
                <p className="text-3xl font-bold">{oneStar}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Section */}
      <GooglePlayStyleReviews
        userId={userId}
        userType={userType}
        userName={userName}
        canLeaveReview={false}
      />
    </div>
  );
}
