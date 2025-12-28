import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  File,
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  type: "users" | "jobs" | "revenue" | "performance";
  lastGenerated: string;
}

const reports: Report[] = [
  {
    id: "1",
    name: "User Registration Report",
    description: "Detailed breakdown of new user registrations by type, status, and date",
    icon: Users,
    type: "users",
    lastGenerated: "2024-06-15 10:30 AM",
  },
  {
    id: "2",
    name: "Job Posting Analytics",
    description: "Analysis of job postings including categories, budgets, and completion rates",
    icon: Briefcase,
    type: "jobs",
    lastGenerated: "2024-06-14 02:15 PM",
  },
  {
    id: "3",
    name: "Revenue Summary",
    description: "Monthly and yearly revenue breakdown with growth metrics",
    icon: DollarSign,
    type: "revenue",
    lastGenerated: "2024-06-13 09:45 AM",
  },
  {
    id: "4",
    name: "Platform Performance",
    description: "Key performance indicators including active users, session duration, and engagement",
    icon: TrendingUp,
    type: "performance",
    lastGenerated: "2024-06-12 04:20 PM",
  },
  {
    id: "5",
    name: "Freelancer Earnings Report",
    description: "Comprehensive earnings report for all freelancers with payment history",
    icon: FileSpreadsheet,
    type: "revenue",
    lastGenerated: "2024-06-11 11:00 AM",
  },
  {
    id: "6",
    name: "Client Activity Report",
    description: "Client engagement metrics including job postings, payments, and feedback",
    icon: FileText,
    type: "users",
    lastGenerated: "2024-06-10 03:30 PM",
  },
];

const Reports = () => {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [filterType, setFilterType] = useState<"all" | "users" | "jobs" | "revenue" | "performance">("all");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredReports = reports.filter(
    (report) => filterType === "all" || report.type === filterType
  );

  const handleExport = async (reportId: string, format: "csv" | "pdf") => {
    setIsGenerating(reportId);
    
    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsGenerating(null);
    toast({
      title: "Report Exported",
      description: `Your ${format.toUpperCase()} report has been downloaded.`,
    });
  };

  const handleGenerateAll = async () => {
    toast({
      title: "Generating Reports",
      description: "All reports are being generated. This may take a moment.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and export platform reports</p>
        </div>
        <Button onClick={handleGenerateAll} className="gap-2">
          <Download className="h-4 w-4" />
          Generate All Reports
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Date Range */}
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="max-w-[160px]"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="max-w-[160px]"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="all">All Reports</option>
                <option value="users">User Reports</option>
                <option value="jobs">Job Reports</option>
                <option value="revenue">Revenue Reports</option>
                <option value="performance">Performance Reports</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      report.type === "users"
                        ? "bg-primary/10"
                        : report.type === "jobs"
                        ? "bg-secondary/10"
                        : report.type === "revenue"
                        ? "bg-accent/10"
                        : "bg-muted"
                    }`}
                  >
                    <report.icon
                      className={`h-6 w-6 ${
                        report.type === "users"
                          ? "text-primary"
                          : report.type === "jobs"
                          ? "text-secondary"
                          : report.type === "revenue"
                          ? "text-accent"
                          : "text-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last generated: {report.lastGenerated}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(report.id, "csv")}
                  disabled={isGenerating === report.id}
                  className="flex-1"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {isGenerating === report.id ? "Generating..." : "Export CSV"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(report.id, "pdf")}
                  disabled={isGenerating === report.id}
                  className="flex-1"
                >
                  <File className="h-4 w-4 mr-2" />
                  {isGenerating === report.id ? "Generating..." : "Export PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Export Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">156</p>
              <p className="text-sm text-muted-foreground">Reports Generated (This Month)</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-secondary">89</p>
              <p className="text-sm text-muted-foreground">CSV Exports</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-accent">67</p>
              <p className="text-sm text-muted-foreground">PDF Exports</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">Scheduled Reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
