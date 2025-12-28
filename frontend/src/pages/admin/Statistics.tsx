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

// User Growth (Pie Chart)
const userGrowthData = [
  { name: "Freelancers", value: 1847, color: "hsl(var(--primary))" },
  { name: "Clients", value: 1000, color: "hsl(var(--secondary))" },
  { name: "Admins", value: 15, color: "hsl(var(--accent))" },
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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Statistics</h1>
        <p className="text-muted-foreground mt-1">Platform analytics and performance metrics</p>
      </div>

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

        {/* Revenue by Month - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month (NPR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`NPR ${value.toLocaleString()}`, "Revenue"]}
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

        {/* Top 5 Freelancers by Earnings - Horizontal Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Freelancers by Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topFreelancersData.map((freelancer, index) => (
                <div key={freelancer.name} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {freelancer.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{freelancer.name}</span>
                      <span className="text-sm text-muted-foreground">
                        NPR {freelancer.earnings.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                        style={{
                          width: `${(freelancer.earnings / topFreelancersData[0].earnings) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
