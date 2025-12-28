import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

// Active Jobs vs Completed (Line Chart)
const jobsData = [
  { month: "Jan", active: 45, completed: 32 },
  { month: "Feb", active: 52, completed: 48 },
  { month: "Mar", active: 61, completed: 55 },
  { month: "Apr", active: 78, completed: 62 },
  { month: "May", active: 85, completed: 74 },
  { month: "Jun", active: 92, completed: 88 },
  { month: "Jul", active: 105, completed: 95 },
  { month: "Aug", active: 118, completed: 108 },
  { month: "Sep", active: 132, completed: 120 },
  { month: "Oct", active: 145, completed: 135 },
  { month: "Nov", active: 158, completed: 148 },
  { month: "Dec", active: 172, completed: 162 },
];

// Total Bids Over Time (Area Chart)
const bidsData = [
  { month: "Jan", bids: 120 },
  { month: "Feb", bids: 180 },
  { month: "Mar", bids: 240 },
  { month: "Apr", bids: 320 },
  { month: "May", bids: 420 },
  { month: "Jun", bids: 550 },
  { month: "Jul", bids: 680 },
  { month: "Aug", bids: 820 },
  { month: "Sep", bids: 950 },
  { month: "Oct", bids: 1100 },
  { month: "Nov", bids: 1280 },
  { month: "Dec", bids: 1450 },
];

// Revenue by Month (Bar Chart)
const revenueData = [
  { month: "Jan", revenue: 180000 },
  { month: "Feb", revenue: 220000 },
  { month: "Mar", revenue: 310000 },
  { month: "Apr", revenue: 420000 },
  { month: "May", revenue: 580000 },
  { month: "Jun", revenue: 720000 },
  { month: "Jul", revenue: 850000 },
  { month: "Aug", revenue: 920000 },
  { month: "Sep", revenue: 1050000 },
  { month: "Oct", revenue: 1180000 },
  { month: "Nov", revenue: 1350000 },
  { month: "Dec", revenue: 1520000 },
];


// Top 5 Freelancers by Earnings (Horizontal Bar)
const topFreelancersData = [
  { name: "Rajesh Sharma", earnings: 425000, avatar: "RS" },
  { name: "Maya Tamang", earnings: 380000, avatar: "MT" },
  { name: "Bikash Gurung", earnings: 342000, avatar: "BG" },
  { name: "Sunita Maharjan", earnings: 298000, avatar: "SM" },
  { name: "Gita Magar", earnings: 265000, avatar: "GM" },
];

const Statistics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<{
    totalUsers: number;
    totalJobs: number;
    totalBids: number;
    totalProjects: number;
    totalTasks: number;
  } | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [overviewData, paymentDashboard] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getPaymentDashboard().catch(() => null), // Gracefully handle if endpoint doesn't exist
      ]);
      setOverview(overviewData);
      setPaymentData(paymentDashboard);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  // Transform payment data for charts
  const userGrowthData = overview ? [
    { name: "Total Users", value: overview.totalUsers, color: "hsl(var(--primary))" },
    { name: "Freelancers", value: Math.floor(overview.totalUsers * 0.6), color: "hsl(var(--secondary))" },
    { name: "Clients", value: Math.floor(overview.totalUsers * 0.4), color: "hsl(var(--accent))" },
  ] : [];

  const revenueData = paymentData?.summary ? [
    { month: "Total", revenue: Number(paymentData.summary.totalCollected) },
    { month: "Pending", revenue: Number(paymentData.summary.pendingAmount) },
    { month: "Refunded", revenue: Number(paymentData.summary.refundedAmount) },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Statistics</h1>
        <p className="text-muted-foreground mt-1">Platform analytics and performance metrics</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-32 mb-4"></div>
                  <div className="h-64 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !overview ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No statistics data available.
          </CardContent>
        </Card>
      ) : (
        <>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs vs Completed - Line Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Jobs vs Completed Jobs</span>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Completed</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={jobsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Total Bids Over Time - Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Total Bids Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bidsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), "Bids"]}
                  />
                  <defs>
                    <linearGradient id="bidsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="bids"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#bidsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Growth - Pie Chart */}
        {userGrowthData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userGrowthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {userGrowthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [value.toLocaleString(), "Users"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                {userGrowthData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue Summary - Bar Chart */}
        {revenueData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary (NPR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`NPR ${value.toLocaleString()}`, "Amount"]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--accent))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Overview Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold mt-1">{overview.totalUsers.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold mt-1">{overview.totalJobs.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Bids</p>
                <p className="text-2xl font-bold mt-1">{overview.totalBids.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold mt-1">{overview.totalProjects.toLocaleString()}</p>
              </div>
            </div>
            {paymentData?.summary && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">Payment Statistics</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Collected</p>
                    <p className="text-lg font-semibold">NPR {Number(paymentData.summary.totalCollected).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Transactions</p>
                    <p className="text-lg font-semibold">{paymentData.summary.totalTransactions.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
};

export default Statistics;
