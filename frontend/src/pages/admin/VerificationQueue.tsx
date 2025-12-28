import { useState, useEffect } from "react";
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
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface VerificationRequest {
  profileId: number;
  userId: number;
  name: string;
  email: string;
  submittedAt?: string;
  documents: { name: string; type: string; url: string }[];
  skills: string[];
  experience?: string;
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PENDING";
  profileType: "FREELANCER" | "CLIENT";
  notes?: string;
}

const VerificationQueue = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "UNDER_REVIEW" | "APPROVED" | "REJECTED">("All");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [selectedProfileDetails, setSelectedProfileDetails] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    loadPendingProfiles();
  }, []);

  const loadPendingProfiles = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getPendingProfiles();
      // Transform backend data to match our interface
      const transformed = data.map((item: any) => ({
        profileId: item.profileId,
        userId: item.userId,
        name: item.displayName || "Unknown",
        email: item.userEmail,
        submittedAt: item.submittedAt,
        documents: [], // Will be loaded when viewing details
        skills: [], // Will be loaded from profile details
        experience: undefined,
        status: item.status || "UNDER_REVIEW",
        profileType: item.profileType || "FREELANCER",
      }));
      setRequests(transformed);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load verification requests");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter((r) => r.status === "UNDER_REVIEW" || r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  const loadProfileDetails = async (request: VerificationRequest) => {
    try {
      setIsLoadingDetails(true);
      if (request.profileType === "FREELANCER") {
        const [profile, documents] = await Promise.all([
          adminApi.getFreelancerProfile(request.profileId),
          adminApi.getFreelancerDocuments(request.profileId),
        ]);
        setSelectedProfileDetails(profile);
        setSelectedDocuments(documents);
      } else {
        // Client profile loading can be added later
        setSelectedProfileDetails(null);
        setSelectedDocuments([]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load profile details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await adminApi.reviewProfile(selectedRequest.profileId, {
        profileType: selectedRequest.profileType,
        decision: "APPROVED",
        verificationNotes: "Profile approved by admin",
      });
      toast.success("Profile approved successfully");
      setIsViewOpen(false);
      loadPendingProfiles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve profile");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      await adminApi.reviewProfile(selectedRequest.profileId, {
        profileType: selectedRequest.profileType,
        decision: "REJECTED",
        rejectionReason: rejectNotes,
      });
      toast.success("Profile rejected");
      setIsRejectOpen(false);
      setIsViewOpen(false);
      setRejectNotes("");
      loadPendingProfiles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject profile");
    }
  };

  const openView = async (request: VerificationRequest) => {
    setSelectedRequest(request);
    setIsViewOpen(true);
    await loadProfileDetails(request);
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
              <option value="UNDER_REVIEW">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Queue List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Loading verification requests...
            </CardContent>
          </Card>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No verification requests found.
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
          <Card key={request.profileId} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">{request.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{request.name}</h3>
                      {request.status === "APPROVED" && (
                        <ShieldCheck className="h-5 w-5 text-secondary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <Badge variant="outline" className="mt-2">
                      {request.profileType}
                    </Badge>
                    {request.submittedAt && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === "UNDER_REVIEW" || request.status === "PENDING"
                        ? "bg-accent/10 text-accent"
                        : request.status === "APPROVED"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {(request.status === "UNDER_REVIEW" || request.status === "PENDING") && <Clock className="h-4 w-4" />}
                    {request.status === "APPROVED" && <CheckCircle className="h-4 w-4" />}
                    {request.status === "REJECTED" && <XCircle className="h-4 w-4" />}
                    {request.status === "UNDER_REVIEW" ? "Pending" : request.status}
                  </span>
                  <Button variant="outline" onClick={() => openView(request)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
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
              {isLoadingDetails ? (
                <div className="text-center py-8 text-muted-foreground">Loading profile details...</div>
              ) : (
                <>
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
                      {selectedProfileDetails?.bio && (
                        <p className="text-sm text-muted-foreground mt-2">{selectedProfileDetails.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="font-medium mb-2">Submitted Documents</h4>
                    {selectedDocuments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No documents submitted</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{doc.fileName}</p>
                                <p className="text-xs text-muted-foreground">{doc.documentType}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

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
            {(selectedRequest?.status === "UNDER_REVIEW" || selectedRequest?.status === "PENDING") && (
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
                  onClick={handleApprove}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Grant Badge
                </Button>
              </>
            )}
            {selectedRequest?.status !== "UNDER_REVIEW" && selectedRequest?.status !== "PENDING" && (
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
