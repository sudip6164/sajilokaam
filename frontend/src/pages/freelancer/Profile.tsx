import { useState } from "react";
import { 
  Camera,
  Edit2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Star,
  CheckCircle,
  Upload,
  Plus,
  X,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const profileData = {
  name: "Ram Kumar Shrestha",
  title: "Full Stack Developer",
  location: "Kathmandu, Nepal",
  email: "ram.kumar@email.com",
  phone: "+977 98XXXXXXXX",
  website: "ramkumar.dev",
  linkedin: "linkedin.com/in/ramkumar",
  github: "github.com/ramkumar",
  hourlyRate: "NPR 1,500",
  bio: "Passionate full-stack developer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies. I love turning complex problems into simple, beautiful solutions.",
  verified: true,
  memberSince: "January 2022",
  completedProjects: 28,
  rating: 4.9,
  totalReviews: 45,
  totalEarnings: "NPR 850,000",
};

const skills = [
  "React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL", 
  "AWS", "Docker", "GraphQL", "Next.js", "Tailwind CSS"
];

const certifications = [
  { id: 1, name: "AWS Certified Developer", issuer: "Amazon Web Services", date: "2024", image: "/placeholder.svg" },
  { id: 2, name: "Meta Front-End Developer", issuer: "Meta", date: "2023", image: "/placeholder.svg" },
  { id: 3, name: "MongoDB Developer", issuer: "MongoDB University", date: "2023", image: "/placeholder.svg" },
];

const pastProjects = [
  {
    id: 1,
    title: "E-commerce Platform",
    description: "Built a complete e-commerce solution with payment integration, inventory management, and admin dashboard.",
    client: "ShopNepal",
    rating: 5,
    review: "Excellent work! Ram delivered beyond our expectations.",
    images: ["/placeholder.svg", "/placeholder.svg"],
    skills: ["React", "Node.js", "MongoDB", "Stripe"],
    completedAt: "November 2024"
  },
  {
    id: 2,
    title: "Real Estate Portal",
    description: "Developed a property listing platform with advanced search, virtual tours, and agent management.",
    client: "GharJagga Pro",
    rating: 5,
    review: "Professional developer, great communication throughout the project.",
    images: ["/placeholder.svg"],
    skills: ["Next.js", "PostgreSQL", "AWS"],
    completedAt: "September 2024"
  },
  {
    id: 3,
    title: "Learning Management System",
    description: "Created an LMS with video streaming, quiz modules, and progress tracking features.",
    client: "EduTech Nepal",
    rating: 4,
    review: "Good work, delivered on time with all features as requested.",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    skills: ["React", "Node.js", "MongoDB", "WebRTC"],
    completedAt: "July 2024"
  },
];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profileData);
  const [editSkills, setEditSkills] = useState(skills);
  const [newSkill, setNewSkill] = useState("");
  const { toast } = useToast();

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const addSkill = () => {
    if (newSkill && !editSkills.includes(newSkill)) {
      setEditSkills([...editSkills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setEditSkills(editSkills.filter(s => s !== skill));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your professional profile</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=freelancer" />
                <AvatarFallback className="text-3xl">RK</AvatarFallback>
              </Avatar>
              {profileData.verified && (
                <div className="absolute -bottom-1 -right-1 bg-secondary text-secondary-foreground rounded-full p-1">
                  <CheckCircle className="h-6 w-6" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{profileData.name}</h2>
                {profileData.verified && (
                  <Badge className="bg-secondary text-secondary-foreground">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground">{profileData.title}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profileData.location}
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {profileData.email}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {profileData.phone}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <a href="#" className="flex items-center gap-1 text-sm text-primary hover:underline">
                  <Globe className="h-4 w-4" />
                  {profileData.website}
                </a>
                <a href="#" className="flex items-center gap-1 text-sm text-primary hover:underline">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
                <a href="#" className="flex items-center gap-1 text-sm text-primary hover:underline">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-2xl font-bold">{profileData.completedProjects}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">{profileData.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">{profileData.totalReviews} reviews</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary/10 col-span-2">
                <p className="text-lg font-bold text-secondary">{profileData.totalEarnings}</p>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">About Me</h3>
            <p className="text-muted-foreground">{profileData.bio}</p>
          </div>

          {/* Skills */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="mt-6 pt-6 border-t flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Hourly Rate</h3>
              <p className="text-muted-foreground text-sm">Member since {profileData.memberSince}</p>
            </div>
            <p className="text-2xl font-bold text-secondary">{profileData.hourlyRate}/hr</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for certifications and projects */}
      <Tabs defaultValue="certifications">
        <TabsList>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="projects">Past Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="certifications" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {certifications.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{cert.name}</h4>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      <p className="text-xs text-muted-foreground mt-1">Issued: {cert.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed">
              <CardContent className="p-4 flex items-center justify-center h-full min-h-[120px]">
                <Button variant="ghost" className="flex flex-col gap-2 h-auto py-4">
                  <Upload className="h-6 w-6" />
                  <span>Upload Certificate</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <div className="space-y-4">
            {pastProjects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Project images */}
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                      {project.images.map((img, index) => (
                        <div 
                          key={index}
                          className="w-32 h-24 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center"
                        >
                          <span className="text-xs text-muted-foreground">Preview {index + 1}</span>
                        </div>
                      ))}
                    </div>

                    {/* Project info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Client: {project.client} • Completed: {project.completedAt}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(project.rating)}
                        </div>
                      </div>

                      <p className="text-muted-foreground mt-2">{project.description}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {project.skills.map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>

                      <div className="mt-4 p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-sm">{project.client}'s Review</span>
                        </div>
                        <p className="text-sm text-muted-foreground italic">"{project.review}"</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=freelancer" />
                <AvatarFallback>RK</AvatarFallback>
              </Avatar>
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input 
                  id="title" 
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Hourly Rate (NPR)</Label>
                <Input 
                  id="rate" 
                  value={editData.hourlyRate}
                  onChange={(e) => setEditData({ ...editData, hourlyRate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                rows={4}
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button variant="outline" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  value={editData.website}
                  onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input 
                  id="linkedin" 
                  value={editData.linkedin}
                  onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input 
                  id="github" 
                  value={editData.github}
                  onChange={(e) => setEditData({ ...editData, github: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
