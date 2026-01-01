import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { invoicesApi, paymentsApi } from "@/lib/api";
import { toast } from "sonner";
import { ESewaPaymentForm } from "@/components/ESewaPaymentForm";

const ClientInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [esewaPaymentData, setEsewaPaymentData] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [user]);

  const loadInvoices = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await invoicesApi.list({ clientId: user.id });
      setInvoices(data);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

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

  const processPayment = async () => {
    if (!paymentMethod || !selectedInvoice) {
      toast.error("Please select a payment method to continue.");
      return;
    }

    try {
      // Create payment record first
      const payment = await paymentsApi.create({
        invoiceId: selectedInvoice.id,
        amount: selectedInvoice.totalAmount,
        paymentMethod: paymentMethod.toUpperCase(),
        status: "PENDING",
      });

      // Handle eSewa separately (form-based payment)
      if (paymentMethod === "esewa") {
        try {
          // Use new eSewa v2 form-based API
          const esewaData = await paymentsApi.initiateESewa(
            Number(selectedInvoice.totalAmount),
            selectedInvoice.id
          );
          setEsewaPaymentData(esewaData);
          setPaymentDialogOpen(false);
          // Form will auto-submit via ESewaPaymentForm component
        } catch (error: any) {
          const message = error.response?.data?.error || error.response?.data?.message || "Failed to initiate eSewa payment";
          toast.error(message);
        }
        return;
      }

      // Map payment method to gateway
      const gateway = paymentMethod === "khalti" ? "KHALTI" : null;
      
      if (!gateway) {
        // For non-gateway methods (bank, card), just mark as pending
        toast.success("Payment request created. Please complete the payment manually.");
        setPaymentDialogOpen(false);
        setPaymentMethod("");
        loadInvoices();
        return;
      }

      // Initiate gateway payment (Khalti)
      const initiationResponse = await paymentsApi.initiate(
        payment.id,
        gateway,
        `${window.location.origin}/success?type=payment&invoiceId=${selectedInvoice.id}`,
        `${window.location.origin}/failure?type=payment&invoiceId=${selectedInvoice.id}`
      );

      if (initiationResponse.success && initiationResponse.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = initiationResponse.paymentUrl;
      } else {
        toast.error(initiationResponse.message || "Failed to initiate payment");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to process payment";
      toast.error(message);
    }
  };

  const filterInvoices = (status: string) => {
    return invoices.filter((inv) => {
      const invStatus = inv.status?.toLowerCase() || "";
      let matchesStatus = true;
      
      if (status === "all") {
        matchesStatus = true;
      } else if (status === "pending") {
        matchesStatus = invStatus === "pending" || invStatus === "unpaid";
      } else if (status === "paid") {
        matchesStatus = invStatus === "paid";
      } else if (status === "overdue") {
        matchesStatus = invStatus === "overdue";
      }
      
      const matchesSearch =
        inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.projectId?.toString().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "NPR 0";
    return `NPR ${amount.toLocaleString()}`;
  };

  const totalPending = invoices
    .filter((inv) => {
      const status = inv.status?.toLowerCase() || "";
      return status === "pending" || status === "unpaid" || status === "overdue";
    })
    .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

  const totalPaid = invoices
    .filter((inv) => inv.status?.toLowerCase() === "paid")
    .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">Loading invoices...</div>
      </div>
    );
  }

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
                  {formatCurrency(totalPending)}
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
                  {formatCurrency(totalPaid)}
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
            Pending ({filterInvoices("pending").length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({filterInvoices("paid").length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({filterInvoices("overdue").length})
          </TabsTrigger>
        </TabsList>

        {["all", "pending", "paid", "overdue"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
            {filterInvoices(tab).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No invoices found</h3>
                  <p className="text-muted-foreground">
                    {tab === "all"
                      ? "You don't have any invoices yet."
                      : `No ${tab} invoices at the moment.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filterInvoices(tab).map((invoice) => (
                <Card key={invoice.id} hover>
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="font-mono font-medium">{invoice.invoiceNumber || `INV-${invoice.id}`}</p>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <p className="font-medium">Project ID: {invoice.projectId}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(invoice.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold">{formatCurrency(invoice.totalAmount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.status?.toLowerCase() === "paid" && invoice.paidAt
                              ? `Paid: ${new Date(invoice.paidAt).toLocaleDateString()}`
                              : invoice.dueDate
                              ? `Due: ${new Date(invoice.dueDate).toLocaleDateString()}`
                              : "No due date"}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/client-invoices/${invoice.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          {(invoice.status?.toLowerCase() === "pending" || invoice.status?.toLowerCase() === "overdue" || invoice.status?.toLowerCase() === "unpaid") && (
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
              ))
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
              Complete payment for {selectedInvoice?.invoiceNumber || `INV-${selectedInvoice?.id}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Invoice</span>
                <span className="font-mono">{selectedInvoice?.invoiceNumber || `INV-${selectedInvoice?.id}`}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Project ID</span>
                <span>{selectedInvoice?.projectId}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold text-lg">{formatCurrency(selectedInvoice?.totalAmount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="khalti">Khalti</SelectItem>
                  <SelectItem value="esewa">eSewa</SelectItem>
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
              Pay {formatCurrency(selectedInvoice?.totalAmount)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* eSewa Payment Form (auto-submits) */}
      {esewaPaymentData && (
        <ESewaPaymentForm paymentData={esewaPaymentData} />
      )}
    </div>
  );
};

export default ClientInvoices;
