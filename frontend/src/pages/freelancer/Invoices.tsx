import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Download,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { invoicesApi } from "@/lib/api";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  PAID: { label: "Paid", icon: CheckCircle, color: "bg-secondary/10 text-secondary border-secondary/20" },
  PENDING: { label: "Pending", icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  UNPAID: { label: "Unpaid", icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  OVERDUE: { label: "Overdue", icon: AlertCircle, color: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [user]);

  const loadInvoices = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await invoicesApi.list({ freelancerId: user.id });
      setInvoices(data);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "NPR 0";
    return `NPR ${amount.toLocaleString()}`;
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.projectId?.toString().includes(searchQuery.toLowerCase());
    const invStatus = invoice.status?.toUpperCase() || "";
    const matchesStatus = statusFilter === "all" || invStatus === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0),
    paid: invoices.filter(i => i.status?.toUpperCase() === "PAID").reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0),
    pending: invoices.filter(i => i.status?.toUpperCase() === "PENDING" || i.status?.toUpperCase() === "UNPAID").reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0),
    overdue: invoices.filter(i => i.status?.toUpperCase() === "OVERDUE").reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0),
  };

  const handleDownloadPDF = (invoice: any) => {
    toast.success(`Downloading invoice ${invoice.invoiceNumber || invoice.id}...`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage and track your invoice payments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Invoiced</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(stats.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold text-secondary mt-1">{formatCurrency(stats.paid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{formatCurrency(stats.pending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-destructive mt-1">{formatCurrency(stats.overdue)}</p>
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
                placeholder="Search invoices..." 
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
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <p className="text-muted-foreground">No invoices found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const invStatus = invoice.status?.toUpperCase() || "PENDING";
                    const status = statusConfig[invStatus] || statusConfig.PENDING;
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber || `INV-${invoice.id}`}</TableCell>
                        <TableCell>Project ID: {invoice.projectId}</TableCell>
                        <TableCell>Client ID: {invoice.clientId}</TableCell>
                        <TableCell className="font-semibold text-secondary">{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Not set"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDownloadPDF(invoice)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice preview modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-white font-bold text-lg">SK</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg">Sajilo Kaam</p>
                      <p className="text-xs text-muted-foreground">Freelancer Invoice</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{selectedInvoice.id}</p>
                  <Badge 
                    variant="outline" 
                    className={statusConfig[selectedInvoice.status as keyof typeof statusConfig].color}
                  >
                    {statusConfig[selectedInvoice.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Bill To</p>
                  <p className="font-medium">{selectedInvoice.client}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Project</p>
                  <p className="font-medium">{selectedInvoice.project}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{selectedInvoice.issuedDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="font-medium">{selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">NPR {item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{selectedInvoice.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (0%)</span>
                    <span>NPR 0</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-secondary">{selectedInvoice.amount}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
                <Button onClick={() => handleDownloadPDF(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
