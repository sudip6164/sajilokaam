import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Page Loading Skeleton
export const PageSkeleton = () => (
  <div className="space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </CardContent>
    </Card>
  </div>
);

// Dashboard Card Skeleton
export const DashboardCardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </CardContent>
  </Card>
);

// Table Row Skeleton
export const TableRowSkeleton = () => (
  <div className="flex items-center justify-between p-4 border-b">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

// Job Card Skeleton
export const JobCardSkeleton = () => (
  <Card>
    <CardContent className="p-5">
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Profile Skeleton
export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-6">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  </div>
);

// Chat Skeleton
export const ChatSkeleton = () => (
  <div className="space-y-4 p-4">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
      >
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className={`space-y-2 ${i % 2 === 0 ? "" : "items-end"}`}>
          <Skeleton className="h-16 w-64 rounded-lg" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);

// Invoice Skeleton
export const InvoiceSkeleton = () => (
  <Card>
    <CardContent className="p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Full Page Loading
export const FullPageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/30 rounded-full animate-pulse" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
      </div>
      <p className="text-muted-foreground animate-pulse">Loading...</p>
    </div>
  </div>
);

export default {
  PageSkeleton,
  DashboardCardSkeleton,
  TableRowSkeleton,
  JobCardSkeleton,
  ProfileSkeleton,
  ChatSkeleton,
  InvoiceSkeleton,
  FullPageLoading,
};
