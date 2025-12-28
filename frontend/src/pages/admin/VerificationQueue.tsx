import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  FileText,
  Download,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface VerificationRequest {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  documents: { name: string; type: string; url: string }[];
  skills: string[];
  experience: string;
  status: "Pending" | "Approved" | "Rejected";
  notes?: string;
}

const initialRequests: VerificationRequest[] = [
  {
    id: "1",
    name: "Bikash Gurung",
    email: "bikash@email.com",
    submittedAt: "2024-06-15",
    documents: [
      { name: "ID Card", type: "Identity", url: "#" },
      { name: "Degree Certificate", type: "Education", url: "#" },
      { name: "Portfolio", type: "Work", url: "#" },
    ],
    skills: ["Web Development", "React", "Node.js"],
    experience: "5 years",
    status: "Pending",
  },
  {
    id: "2",
    name: "Sarita Poudel",
    email: "sarita@email.com",
    submittedAt: "2024-06-14",
    documents: [
      { name: "Citizenship", type: "Identity", url: "#" },
      { name: "Certificate", type: "Education", url: "#" },
    ],
    skills: ["Graphic Design", "UI/UX", "Figma"],
    experience: "3 years",
    status: "Pending",
  },
  {
    id: "3",
    name: "Ram Bahadur",
    email: "ram@email.com",
    submittedAt: "2024-06-13",
    documents: [
      { name: "License", type: "Identity", url: "#" },
    ],
    skills: ["Content Writing", "SEO"],
    experience: "2 years",
    status: "Pending",
  },
  {
    id: "4",
    name: "Sunita Maharjan",
    email: "sunita@email.com",
    submittedAt: "2024-06-10",
    documents: [
      { name: "ID Card", type: "Identity", url: "#" },
      { name: "Masters Degree", type: "Education", url: "#" },
    ],
    skills: ["Data Analysis", "Python", "Machine Learning"],
    experience: "4 years",
    status: "Approved",
  },
  {
    id: "5",
    name: "Kiran Thapa",
    email: "kiran@email.com",
    submittedAt: "2024-06-08",
    documents: [
      { name: "Passport", type: "Identity", url: "#" },
    ],
    skills: ["Mobile Development", "Flutter"],
    experience: "1 year",
    status: "Rejected",
    notes: "Incomplete documentation",
  },
];

const VerificationQueue = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>(initialRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const { toast } = useToast();

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  const handleApprove = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "Approved" as const } : r)));
    setIsViewOpen(false);
    toast({
      title: "Freelancer Approved",
      description: "Verification badge has been granted.",
    });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    setRequests(
      requests.map((r) =>
        r.id === selectedRequest.id ? { ...r, status: "Rejected" as const, notes: rejectNotes } : r
      )
    );
    setIsRejectOpen(false);
    setIsViewOpen(false);
    setRejectNotes("");
    toast({
      title: "Verification Rejected",
      description: "The freelancer has been notified.",
      variant: "destructive",
    });
  };

  const openView = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Verification Queue</h1>
        <p className="text-muted-foreground mt-1">Review and approve freelancer verification requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-secondary/10">
              <CheckCircle className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Queue List */}
      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">{request.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{request.name}</h3>
                      {request.status === "Approved" && (
                        <ShieldCheck className="h-5 w-5 text-secondary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {request.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Experience: {request.experience} • Submitted: {request.submittedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === "Pending"
                        ? "bg-accent/10 text-accent"
                        : request.status === "Approved"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {request.status === "Pending" && <Clock className="h-4 w-4" />}
                    {request.status === "Approved" && <CheckCircle className="h-4 w-4" />}
                    {request.status === "Rejected" && <XCircle className="h-4 w-4" />}
                    {request.status}
                  </span>
                  <Button variant="outline" onClick={() => openView(request)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No verification requests found.
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Review Verification Request
              {selectedRequest?.status === "Approved" && <ShieldCheck className="h-5 w-5 text-secondary" />}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Profile Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">
                    {selectedRequest.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl">{selectedRequest.name}</h3>
                  <p className="text-muted-foreground">{selectedRequest.email}</p>
                  <p className="text-sm text-muted-foreground">Experience: {selectedRequest.experience}</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-medium mb-2">Submitted Documents</h4>
                <div className="space-y-2">
                  {selectedRequest.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rejection Notes */}
              {selectedRequest.notes && (
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Rejection Reason</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === "Pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRejectOpen(true);
                  }}
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Grant Badge
                </Button>
              </>
            )}
            {selectedRequest?.status !== "Pending" && (
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">Reason for Rejection</label>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Provide a reason for rejection..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificationQueue;
