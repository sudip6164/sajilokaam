import { useState } from "react";
import { 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Trash2,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const bids = [
  {
    id: 1,
    job: "E-commerce Website Development",
    client: "TechMart Nepal",
    bidAmount: "NPR 95,000",
    clientBudget: "NPR 80,000 - 120,000",
    duration: "2 months",
    status: "pending",
    submittedAt: "Dec 15, 2024",
    proposal: "I have 5+ years of experience in e-commerce development...",
  },
  {
    id: 2,
    job: "Mobile App UI Design",
    client: "FinPay Solutions",
    bidAmount: "NPR 45,000",
    clientBudget: "NPR 40,000 - 60,000",
    duration: "3 weeks",
    status: "accepted",
    submittedAt: "Dec 12, 2024",
    proposal: "As a senior UI/UX designer with fintech experience...",
  },
  {
    id: 3,
    job: "WordPress Theme Development",
    client: "Nepal News Network",
    bidAmount: "NPR 30,000",
    clientBudget: "NPR 25,000 - 35,000",
    duration: "2 weeks",
    status: "rejected",
    submittedAt: "Dec 10, 2024",
    proposal: "I specialize in custom WordPress themes...",
  },
  {
    id: 4,
    job: "Data Analytics Dashboard",
    client: "Growth Analytics",
    bidAmount: "NPR 60,000",
    clientBudget: "NPR 50,000 - 70,000",
    duration: "1 month",
    status: "pending",
    submittedAt: "Dec 8, 2024",
    proposal: "I can build interactive dashboards using React and D3.js...",
  },
  {
    id: 5,
    job: "API Integration Project",
    client: "ShopNepal",
    bidAmount: "NPR 35,000",
    clientBudget: "NPR 30,000 - 45,000",
    duration: "2 weeks",
    status: "shortlisted",
    submittedAt: "Dec 5, 2024",
    proposal: "Expert in REST API integrations with payment gateways...",
  },
];

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  accepted: { label: "Accepted", icon: CheckCircle, color: "bg-secondary/10 text-secondary border-secondary/20" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/20" },
  shortlisted: { label: "Shortlisted", icon: AlertCircle, color: "bg-primary/10 text-primary border-primary/20" },
};

export default function MyBids() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBid, setSelectedBid] = useState<typeof bids[0] | null>(null);

  const filteredBids = bids.filter(bid => {
    const matchesSearch = bid.job.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || bid.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bids.length,
    pending: bids.filter(b => b.status === "pending").length,
    accepted: bids.filter(b => b.status === "accepted").length,
    shortlisted: bids.filter(b => b.status === "shortlisted").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Bids</h1>
        <p className="text-muted-foreground mt-1">Track and manage your job proposals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Bids</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.shortlisted}</p>
            <p className="text-sm text-muted-foreground">Shortlisted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-secondary">{stats.accepted}</p>
            <p className="text-sm text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by job title or client..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bids table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Your Bid</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBids.map((bid) => {
                  const status = statusConfig[bid.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={bid.id}>
                      <TableCell>
                        <div className="font-medium max-w-[200px] truncate">{bid.job}</div>
                        <div className="text-xs text-muted-foreground">Budget: {bid.clientBudget}</div>
                      </TableCell>
                      <TableCell>{bid.client}</TableCell>
                      <TableCell className="font-medium text-secondary">{bid.bidAmount}</TableCell>
                      <TableCell>{bid.duration}</TableCell>
                      <TableCell>{bid.submittedAt}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                              <ChevronDown className="h-4 w-4 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedBid(bid)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {bid.status === "accepted" && (
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message Client
                              </DropdownMenuItem>
                            )}
                            {bid.status === "pending" && (
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Withdraw Bid
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bid details modal */}
      <Dialog open={!!selectedBid} onOpenChange={() => setSelectedBid(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bid Details</DialogTitle>
            <DialogDescription>{selectedBid?.job}</DialogDescription>
          </DialogHeader>
          {selectedBid && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedBid.client}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusConfig[selectedBid.status as keyof typeof statusConfig].color}>
                    {statusConfig[selectedBid.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Your Bid</p>
                  <p className="font-medium text-secondary">{selectedBid.bidAmount}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Client Budget</p>
                  <p className="font-medium">{selectedBid.clientBudget}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedBid.duration}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-medium">{selectedBid.submittedAt}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Your Proposal</p>
                <p className="text-sm">{selectedBid.proposal}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
