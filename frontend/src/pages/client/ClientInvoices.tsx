import { useState } from "react";
import {
  FileText,
  Search,
  Download,
  Eye,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const invoices = [
  {
    id: "INV-2024-001",
    project: "Company Portfolio Website",
    freelancer: "Sita Sharma",
    amount: "NPR 12,000",
    milestone: "Frontend Development",
    date: "Dec 15, 2024",
    dueDate: "Dec 22, 2024",
    status: "pending",
  },
  {
    id: "INV-2024-002",
    project: "Logo Design Package",
    freelancer: "Hari Thapa",
    amount: "NPR 5,000",
    milestone: "Final Delivery",
    date: "Dec 14, 2024",
    dueDate: "Dec 21, 2024",
    status: "pending",
  },
  {
    id: "INV-2024-003",
    project: "Content Writing",
    freelancer: "Maya KC",
    amount: "NPR 5,000",
    milestone: "Research & Outline",
    date: "Dec 10, 2024",
    dueDate: "Dec 17, 2024",
    status: "paid",
    paidDate: "Dec 12, 2024",
  },
  {
    id: "INV-2024-004",
    project: "Company Portfolio Website",
    freelancer: "Sita Sharma",
    amount: "NPR 8,000",
    milestone: "Design Mockups",
    date: "Dec 5, 2024",
    dueDate: "Dec 12, 2024",
    status: "paid",
    paidDate: "Dec 8, 2024",
  },
  {
    id: "INV-2024-005",
    project: "Mobile App Design",
    freelancer: "Raj Gurung",
    amount: "NPR 20,000",
    milestone: "UI/UX Design",
    date: "Nov 25, 2024",
    dueDate: "Dec 2, 2024",
    status: "paid",
    paidDate: "Nov 28, 2024",
  },
  {
    id: "INV-2024-006",
    project: "SEO Services",
    freelancer: "Binod Adhikari",
    amount: "NPR 15,000",
    milestone: "Monthly Retainer",
    date: "Nov 20, 2024",
    dueDate: "Nov 27, 2024",
    status: "overdue",
  },
];

const ClientInvoices = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-secondary/10 text-secondary gap-1">
            <CheckCircle className="h-3 w-3" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-accent/10 text-accent-foreground gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-destructive/10 text-destructive gap-1">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePayNow = (invoice: typeof invoices[0]) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const processPayment = () => {
    if (!paymentMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Payment Successful!",
      description: `${selectedInvoice?.amount} has been paid via ${paymentMethod}.`,
    });
    setPaymentDialogOpen(false);
    setPaymentMethod("");
  };

  const filterInvoices = (status: string) => {
    return invoices.filter((inv) => {
      const matchesStatus = status === "all" || inv.status === status;
      const matchesSearch =
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.freelancer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const totalPending = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "overdue")
    .reduce((sum, inv) => sum + parseInt(inv.amount.replace(/[^\d]/g, "")), 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + parseInt(inv.amount.replace(/[^\d]/g, "")), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Invoices
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage payments and view invoice history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-accent">
                  NPR {totalPending.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-secondary">
                  NPR {totalPaid.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <CheckCircle className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({invoices.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({invoices.filter((i) => i.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({invoices.filter((i) => i.status === "paid").length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({invoices.filter((i) => i.status === "overdue").length})
          </TabsTrigger>
        </TabsList>

        {["all", "pending", "paid", "overdue"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
            {filterInvoices(tab).map((invoice) => (
              <Card key={invoice.id} hover>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-mono font-medium">{invoice.id}</p>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="font-medium">{invoice.project}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.milestone} • {invoice.freelancer}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold">{invoice.amount}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.status === "paid"
                            ? `Paid: ${invoice.paidDate}`
                            : `Due: ${invoice.dueDate}`}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        {(invoice.status === "pending" || invoice.status === "overdue") && (
                          <Button size="sm" onClick={() => handlePayNow(invoice)}>
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filterInvoices(tab).length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No invoices found</h3>
                  <p className="text-muted-foreground">
                    {tab === "all"
                      ? "You don't have any invoices yet."
                      : `No ${tab} invoices at the moment.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Invoice</DialogTitle>
            <DialogDescription>
              Complete payment for {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Invoice</span>
                <span className="font-mono">{selectedInvoice?.id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Project</span>
                <span>{selectedInvoice?.project}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Freelancer</span>
                <span>{selectedInvoice?.freelancer}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold text-lg">{selectedInvoice?.amount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="esewa">eSewa</SelectItem>
                  <SelectItem value="khalti">Khalti</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processPayment}>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {selectedInvoice?.amount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientInvoices;
