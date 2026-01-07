import { useState } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, Download, 
  CreditCard, PieChart, BarChart3, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface EarningsData {
  totalEarnings: number;
  availableBalance: number;
  pendingClearance: number;
  withdrawn: number;
  monthlyEarnings: Array<{ month: string; amount: number }>;
  earningsByProject: Array<{ project: string; amount: number; percentage: number }>;
  recentTransactions: Array<{
    id: number;
    type: 'payment' | 'withdrawal' | 'refund' | 'fee';
    description: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
}

export function EarningsDashboard() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  const earningsData: EarningsData = {
    totalEarnings: 45680,
    availableBalance: 12450,
    pendingClearance: 3200,
    withdrawn: 29030,
    monthlyEarnings: [
      { month: 'Jan', amount: 3200 },
      { month: 'Feb', amount: 4100 },
      { month: 'Mar', amount: 3800 },
      { month: 'Apr', amount: 5200 },
      { month: 'May', amount: 6800 },
      { month: 'Jun', amount: 7500 },
    ],
    earningsByProject: [
      { project: 'E-commerce Platform', amount: 15200, percentage: 33.3 },
      { project: 'Mobile App Design', amount: 12800, percentage: 28.0 },
      { project: 'Website Redesign', amount: 9600, percentage: 21.0 },
      { project: 'Content Writing', amount: 5080, percentage: 11.1 },
      { project: 'Logo Design', amount: 3000, percentage: 6.6 },
    ],
    recentTransactions: [
      {
        id: 1,
        type: 'payment',
        description: 'Milestone payment - E-commerce Platform',
        amount: 3000,
        date: '2024-01-15',
        status: 'completed',
      },
      {
        id: 2,
        type: 'withdrawal',
        description: 'Withdrawal to bank account',
        amount: -5000,
        date: '2024-01-14',
        status: 'completed',
      },
      {
        id: 3,
        type: 'payment',
        description: 'Project completion - Mobile App Design',
        amount: 2500,
        date: '2024-01-12',
        status: 'pending',
      },
      {
        id: 4,
        type: 'fee',
        description: 'Platform service fee',
        amount: -250,
        date: '2024-01-12',
        status: 'completed',
      },
      {
        id: 5,
        type: 'payment',
        description: 'Hourly work - Website Redesign',
        amount: 800,
        date: '2024-01-10',
        status: 'completed',
      },
    ],
  };

  const currentMonthEarnings = earningsData.monthlyEarnings[earningsData.monthlyEarnings.length - 1].amount;
  const previousMonthEarnings = earningsData.monthlyEarnings[earningsData.monthlyEarnings.length - 2].amount;
  const growthPercentage = ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100;

  const maxEarnings = Math.max(...earningsData.monthlyEarnings.map(m => m.amount));

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            {growthPercentage > 0 ? (
              <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-lg">
                <TrendingUp className="h-3 w-3" />
                <span>{growthPercentage.toFixed(1)}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-lg">
                <TrendingDown className="h-3 w-3" />
                <span>{Math.abs(growthPercentage).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <p className="text-sm opacity-90 mb-1">Total Earnings</p>
          <p className="text-3xl font-bold">Rs. {earningsData.totalEarnings.toLocaleString()}</p>
        </div>

        {/* Available Balance */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-success" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-success">
            Rs. {earningsData.availableBalance.toLocaleString()}
          </p>
        </div>

        {/* Pending Clearance */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Pending Clearance</p>
          <p className="text-3xl font-bold text-yellow-500">
            Rs. {earningsData.pendingClearance.toLocaleString()}
          </p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ArrowDownRight className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Withdrawn</p>
          <p className="text-3xl font-bold">
            Rs. {earningsData.withdrawn.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Monthly Earnings Chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold mb-1">Earnings Overview</h3>
              <p className="text-sm text-muted-foreground">
                Your earnings over the last 6 months
              </p>
            </div>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-primary text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-4">
            {earningsData.monthlyEarnings.map((item, index) => {
              const heightPercentage = (item.amount / maxEarnings) * 100;
              return (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-12">{item.month}</span>
                  <div className="flex-1 h-10 bg-muted rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all flex items-center justify-end px-3"
                      style={{ width: `${heightPercentage}%` }}
                    >
                      <span className="text-white text-sm font-semibold">
                        Rs. {item.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Earnings by Project */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-5 w-5 text-primary" />
            <h3 className="font-bold">Earnings by Project</h3>
          </div>

          <div className="space-y-4">
            {earningsData.earningsByProject.map((item, index) => {
              const colors = [
                'from-primary to-secondary',
                'from-purple-500 to-pink-500',
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500',
                'from-orange-500 to-yellow-500',
              ];

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.project}</span>
                    <div className="text-right">
                      <p className="text-sm font-bold">${item.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colors[index]}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-bold">Recent Transactions</h3>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold">Description</th>
                <th className="text-left p-4 text-sm font-semibold">Date</th>
                <th className="text-left p-4 text-sm font-semibold">Status</th>
                <th className="text-right p-4 text-sm font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {earningsData.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'payment' ? 'bg-success/10' :
                        transaction.type === 'withdrawal' ? 'bg-primary/10' :
                        transaction.type === 'fee' ? 'bg-destructive/10' :
                        'bg-yellow-500/10'
                      }`}>
                        {transaction.type === 'payment' ? (
                          <ArrowUpRight className="h-4 w-4 text-success" />
                        ) : transaction.type === 'withdrawal' ? (
                          <ArrowDownRight className="h-4 w-4 text-primary" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{transaction.description}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        transaction.status === 'completed' ? 'default' :
                        transaction.status === 'pending' ? 'outline' : 'destructive'
                      }
                      className={
                        transaction.status === 'completed' ? 'bg-success' :
                        transaction.status === 'pending' ? 'border-yellow-500 text-yellow-500' : ''
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className={`p-4 text-right font-semibold ${
                    transaction.amount > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}Rs. {Math.abs(transaction.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold mb-1">Ready to withdraw?</h3>
            <p className="text-sm text-muted-foreground">
              You have ${earningsData.availableBalance.toLocaleString()} available for withdrawal
            </p>
          </div>
          <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
            <CreditCard className="h-4 w-4 mr-2" />
            Withdraw Funds
          </Button>
        </div>
      </div>
    </div>
  );
}
