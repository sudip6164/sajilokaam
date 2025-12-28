import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  MessageSquare,
  Star,
  CheckCircle,
  Shield,
  User,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const jobData = {
  id: 1,
  title: "E-commerce Website Development",
  category: "Web Development",
  budget: "NPR 80,000",
  deadline: "Dec 25, 2024",
  posted: "Dec 10, 2024",
  status: "active",
  description: `Looking for an experienced full-stack developer to build a complete e-commerce platform for our retail business.

Requirements:
- User authentication and authorization
- Product catalog with categories and search
- Shopping cart and checkout system
- Payment gateway integration (eSewa, Khalti)
- Admin dashboard for inventory management
- Mobile responsive design
- SEO optimization

Technology Stack:
- React.js or Next.js for frontend
- Node.js with Express for backend
- PostgreSQL or MongoDB for database
- Cloud deployment (AWS or similar)`,
  skills: ["React", "Node.js", "PostgreSQL", "Payment Integration", "AWS"],
  attachments: [
    { name: "requirements.pdf", size: "245 KB" },
    { name: "wireframes.zip", size: "1.2 MB" },
  ],
};

const bids = [
  {
    id: 1,
    freelancer: {
      name: "Sita Sharma",
      avatar: "https://i.pravatar.cc/150?img=5",
      title: "Full Stack Developer",
      rating: 4.9,
      reviews: 48,
      verified: true,
      completedJobs: 52,
    },
    amount: "NPR 75,000",
    duration: "3 weeks",
    proposal: "I have 5+ years of experience building e-commerce platforms. I've completed similar projects for clients in Nepal...",
    submitted: "Dec 11, 2024",
  },
  {
    id: 2,
    freelancer: {
      name: "Ram Karki",
      avatar: "https://i.pravatar.cc/150?img=12",
      title: "Senior Web Developer",
      rating: 4.7,
      reviews: 35,
      verified: true,
      completedJobs: 41,
    },
    amount: "NPR 82,000",
    duration: "2.5 weeks",
    proposal: "With extensive experience in React and Node.js, I can deliver a high-quality e-commerce solution...",
    submitted: "Dec 11, 2024",
  },
  {
    id: 3,
    freelancer: {
      name: "Maya KC",
      avatar: "https://i.pravatar.cc/150?img=9",
      title: "MERN Stack Developer",
      rating: 4.5,
      reviews: 22,
      verified: false,
      completedJobs: 28,
    },
    amount: "NPR 65,000",
    duration: "4 weeks",
    proposal: "I specialize in building scalable web applications. Your project requirements align perfectly with my expertise...",
    submitted: "Dec 12, 2024",
  },
];

const chatMessages = [
  {
    id: 1,
    sender: "freelancer",
    name: "Sita Sharma",
    avatar: "https://i.pravatar.cc/150?img=5",
    message: "Hello! I'd like to discuss the project requirements in more detail.",
    time: "10:30 AM",
  },
  {
    id: 2,
    sender: "client",
    name: "You",
    message: "Sure! What would you like to know?",
    time: "10:32 AM",
  },
  {
    id: 3,
    sender: "freelancer",
    name: "Sita Sharma",
    avatar: "https://i.pravatar.cc/150?img=5",
    message: "Could you share more details about the payment gateway preferences? eSewa, Khalti, or both?",
    time: "10:35 AM",
  },
];

const JobDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<typeof bids[0] | null>(null);
  const [chatMessage, setChatMessage] = useState("");

  const handleAcceptBid = (bid: typeof bids[0]) => {
    setSelectedBid(bid);
    setAcceptDialogOpen(true);
  };

  const confirmAcceptBid = () => {
    toast({
      title: "Bid Accepted!",
      description: `You've hired ${selectedBid?.freelancer.name} for this project.`,
    });
    setAcceptDialogOpen(false);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      toast({
        title: "Message Sent",
        description: "Your message has been delivered.",
      });
      setChatMessage("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2 -ml-2">
        <Link to="/client/jobs">
          <ArrowLeft className="h-4 w-4" />
          Back to My Jobs
        </Link>
      </Button>

      {/* Job Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-secondary/10 text-secondary">Active</Badge>
            <span className="text-sm text-muted-foreground">{jobData.category}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            {jobData.title}
          </h1>
          <p className="text-muted-foreground mt-1">Posted on {jobData.posted}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Job</Button>
          <Button variant="outline" className="text-destructive">
            Close Job
          </Button>
        </div>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-semibold">{jobData.budget}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bids</p>
              <p className="font-semibold">{bids.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="font-semibold">{jobData.deadline}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time Left</p>
              <p className="font-semibold">15 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bids">
        <TabsList>
          <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        {/* Bids Tab */}
        <TabsContent value="bids" className="space-y-4 mt-4">
          {bids.map((bid) => (
            <Card key={bid.id} hover>
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Freelancer Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                      <AvatarImage src={bid.freelancer.avatar} />
                      <AvatarFallback>{bid.freelancer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{bid.freelancer.name}</h3>
                        {bid.freelancer.verified && (
                          <Shield className="h-4 w-4 text-secondary fill-secondary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{bid.freelancer.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-accent fill-accent" />
                          {bid.freelancer.rating} ({bid.freelancer.reviews})
                        </span>
                        <span className="text-muted-foreground">
                          {bid.freelancer.completedJobs} jobs done
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bid Details */}
                  <div className="flex flex-col sm:flex-row gap-4 lg:items-start">
                    <div className="space-y-1 text-center sm:text-right">
                      <p className="text-2xl font-bold text-primary">{bid.amount}</p>
                      <p className="text-sm text-muted-foreground">in {bid.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      <Button size="sm" onClick={() => handleAcceptBid(bid)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Proposal */}
                <div className="mt-4 p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">{bid.proposal}</p>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Submitted: {bid.submitted}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground">
                {jobData.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Required Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {jobData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {jobData.attachments.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-4">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat with Freelancers
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "client" ? "flex-row-reverse" : ""}`}
                >
                  {msg.sender === "freelancer" && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.avatar} />
                      <AvatarFallback>{msg.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === "client"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Accept Bid Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept This Bid?</DialogTitle>
            <DialogDescription>
              You're about to hire {selectedBid?.freelancer.name} for{" "}
              {selectedBid?.amount}. This will close the job for other bidders.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedBid?.freelancer.avatar} />
                <AvatarFallback>
                  {selectedBid?.freelancer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedBid?.freelancer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBid?.amount} • {selectedBid?.duration}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAcceptBid}>Confirm & Hire</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetail;
