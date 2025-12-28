import { useState } from "react";
import { 
  Search, 
  Download,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus
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
import { useToast } from "@/hooks/use-toast";

const invoices = [
  {
    id: "INV-001",
    project: "TechStartup Website",
    client: "ABC Corp",
    amount: "NPR 25,000",
    status: "paid",
    issuedDate: "Dec 1, 2024",
    dueDate: "Dec 15, 2024",
    paidDate: "Dec 10, 2024",
    items: [
      { description: "Design Phase - Milestone 1", amount: 25000 }
    ]
  },
  {
    id: "INV-002",
    project: "Mobile Banking App",
    client: "XYZ Bank",
    amount: "NPR 50,000",
    status: "pending",
    issuedDate: "Dec 10, 2024",
    dueDate: "Dec 25, 2024",
    paidDate: null,
    items: [
      { description: "UI/UX Design", amount: 30000 },
      { description: "Prototype Development", amount: 20000 }
    ]
  },
  {
    id: "INV-003",
    project: "CRM Dashboard",
    client: "Sales Pro",
    amount: "NPR 60,000",
    status: "overdue",
    issuedDate: "Nov 25, 2024",
    dueDate: "Dec 10, 2024",
    paidDate: null,
    items: [
      { description: "Full Project Development", amount: 60000 }
    ]
  },
  {
    id: "INV-004",
    project: "E-commerce Platform",
    client: "ShopNepal",
    amount: "NPR 120,000",
    status: "paid",
    issuedDate: "Nov 15, 2024",
    dueDate: "Nov 30, 2024",
    paidDate: "Nov 28, 2024",
    items: [
      { description: "Frontend Development", amount: 50000 },
      { description: "Backend Integration", amount: 40000 },
      { description: "Payment Gateway Setup", amount: 30000 }
    ]
  },
];

const statusConfig = {
  paid: { label: "Paid", icon: CheckCircle, color: "bg-secondary/10 text-secondary border-secondary/20" },
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  overdue: { label: "Overdue", icon: AlertCircle, color: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);
  const { toast } = useToast();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.reduce((sum, inv) => sum + parseInt(inv.amount.replace(/[^0-9]/g, '')), 0),
    paid: invoices.filter(i => i.status === "paid").reduce((sum, inv) => sum + parseInt(inv.amount.replace(/[^0-9]/g, '')), 0),
    pending: invoices.filter(i => i.status === "pending").reduce((sum, inv) => sum + parseInt(inv.amount.replace(/[^0-9]/g, '')), 0),
    overdue: invoices.filter(i => i.status === "overdue").reduce((sum, inv) => sum + parseInt(inv.amount.replace(/[^0-9]/g, '')), 0),
  };

  const handleDownloadPDF = (invoice: typeof invoices[0]) => {
    toast({
      title: "Downloading Invoice",
      description: `${invoice.id} is being downloaded as PDF.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage and track your invoice payments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Invoiced</p>
            <p className="text-2xl font-bold mt-1">NPR {stats.total.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold text-secondary mt-1">NPR {stats.paid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">NPR {stats.pending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-destructive mt-1">NPR {stats.overdue.toLocaleString()}</p>
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
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
                {filteredInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.project}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell className="font-semibold text-secondary">{invoice.amount}</TableCell>
                      <TableCell>{invoice.issuedDate}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
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
                })}
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
