import { useState } from "react";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Briefcase,
  Star
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const jobs = [
  {
    id: 1,
    title: "E-commerce Website Development",
    description: "Looking for an experienced developer to build a complete e-commerce platform with payment integration, inventory management, and admin dashboard.",
    client: "TechMart Nepal",
    clientRating: 4.8,
    budget: "NPR 80,000 - 120,000",
    duration: "2-3 months",
    location: "Remote",
    skills: ["React", "Node.js", "MongoDB", "Stripe"],
    bids: 12,
    postedAt: "2 hours ago",
    saved: false,
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design",
    description: "Need a creative UI/UX designer for a fintech mobile application. Must have experience with banking/finance apps and modern design trends.",
    client: "FinPay Solutions",
    clientRating: 4.5,
    budget: "NPR 40,000 - 60,000",
    duration: "3-4 weeks",
    location: "Kathmandu",
    skills: ["Figma", "Adobe XD", "UI Design", "Prototyping"],
    bids: 8,
    postedAt: "5 hours ago",
    saved: true,
  },
  {
    id: 3,
    title: "WordPress Custom Theme Development",
    description: "Create a custom WordPress theme for a news portal with custom post types, SEO optimization, and fast loading times.",
    client: "Nepal News Network",
    clientRating: 4.2,
    budget: "NPR 25,000 - 35,000",
    duration: "2-3 weeks",
    location: "Remote",
    skills: ["WordPress", "PHP", "JavaScript", "CSS"],
    bids: 15,
    postedAt: "1 day ago",
    saved: false,
  },
  {
    id: 4,
    title: "Data Analysis Dashboard",
    description: "Build an interactive dashboard for visualizing sales and marketing data. Must integrate with Google Analytics and CRM systems.",
    client: "Growth Analytics",
    clientRating: 4.9,
    budget: "NPR 50,000 - 70,000",
    duration: "1 month",
    location: "Remote",
    skills: ["Python", "React", "D3.js", "SQL"],
    bids: 6,
    postedAt: "3 days ago",
    saved: false,
  },
  {
    id: 5,
    title: "API Integration Specialist",
    description: "Integrate multiple third-party APIs including payment gateways, SMS services, and shipping providers into existing platform.",
    client: "ShopNepal",
    clientRating: 4.6,
    budget: "NPR 30,000 - 45,000",
    duration: "2-3 weeks",
    location: "Remote",
    skills: ["Node.js", "REST API", "eSewa", "Khalti"],
    bids: 9,
    postedAt: "4 days ago",
    saved: false,
  },
];

const categories = ["All Categories", "Web Development", "Mobile Development", "UI/UX Design", "Data Science", "DevOps"];
const budgetRanges = ["Any Budget", "Under NPR 25,000", "NPR 25,000 - 50,000", "NPR 50,000 - 100,000", "Above NPR 100,000"];
const durations = ["Any Duration", "Less than 1 week", "1-2 weeks", "2-4 weeks", "1-3 months", "3+ months"];

export default function AvailableJobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [budgetRange, setBudgetRange] = useState("Any Budget");
  const [duration, setDuration] = useState("Any Duration");
  const [savedJobs, setSavedJobs] = useState<number[]>([2]);
  const [selectedJob, setSelectedJob] = useState<typeof jobs[0] | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidProposal, setBidProposal] = useState("");
  const [bidDuration, setBidDuration] = useState("");
  const { toast } = useToast();

  const toggleSave = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSubmitBid = () => {
    if (!bidAmount || !bidProposal || !bidDuration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all bid details.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bid Submitted!",
      description: `Your bid for "${selectedJob?.title}" has been submitted successfully.`,
    });
    setSelectedJob(null);
    setBidAmount("");
    setBidProposal("");
    setBidDuration("");
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Jobs</h1>
        <p className="text-muted-foreground mt-1">Find and bid on projects that match your skills</p>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search jobs by title, skills, or keywords..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={budgetRange} onValueChange={setBudgetRange}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map(dur => (
                    <SelectItem key={dur} value={dur}>{dur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredJobs.length}</span> jobs
        </p>
        <Select defaultValue="newest">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="budget-high">Highest Budget</SelectItem>
            <SelectItem value="budget-low">Lowest Budget</SelectItem>
            <SelectItem value="bids-low">Fewest Bids</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job listings */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                      {job.title}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {job.bids} bids
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">{job.client[0]}</AvatarFallback>
                      </Avatar>
                      <span>{job.client}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{job.clientRating}</span>
                    </div>
                    <span>•</span>
                    <span>{job.postedAt}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => toggleSave(job.id)}
                >
                  {savedJobs.includes(job.id) ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-muted-foreground text-sm line-clamp-2">
                {job.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-secondary font-medium">
                  <DollarSign className="h-4 w-4" />
                  {job.budget}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {job.duration}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
              </div>
              <Button onClick={() => setSelectedJob(job)}>
                Place Bid
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Bid Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Your Bid</DialogTitle>
            <DialogDescription>
              {selectedJob?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="text-muted-foreground">Client's Budget:</p>
              <p className="font-semibold text-secondary">{selectedJob?.budget}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidAmount">Your Bid Amount (NPR)</Label>
              <Input 
                id="bidAmount"
                type="number"
                placeholder="e.g., 75000"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidDuration">Delivery Time</Label>
              <Select value={bidDuration} onValueChange={setBidDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-week">Within 1 week</SelectItem>
                  <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                  <SelectItem value="1-month">Within 1 month</SelectItem>
                  <SelectItem value="2-months">Within 2 months</SelectItem>
                  <SelectItem value="3-months">Within 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposal">Your Proposal</Label>
              <Textarea 
                id="proposal"
                placeholder="Describe why you're the best fit for this project..."
                rows={5}
                value={bidProposal}
                onChange={(e) => setBidProposal(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedJob(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitBid}>
              Submit Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
