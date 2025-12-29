import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  UserPlus,
  Crown,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { teamsApi } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
  });
  const [memberEmail, setMemberEmail] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const data = await teamsApi.list();
      setTeams(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    try {
      setIsCreatingTeam(true);
      await teamsApi.create(teamForm);
      await loadTeams();
      setIsTeamDialogOpen(false);
      setTeamForm({ name: "", description: "" });
      toast.success("Team created successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create team");
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      await teamsApi.delete(teamId);
      await loadTeams();
      toast.success("Team deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete team");
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !memberEmail.trim()) return;
    try {
      // Note: Backend expects userId, but we're using email for now
      // This would need a user lookup endpoint
      toast.info("Member addition requires user ID. Please use the backend API directly.");
      setIsMemberDialogOpen(false);
      setMemberEmail("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Teams</h1>
          <p className="text-muted-foreground mt-1">Create and manage your freelancer teams</p>
        </div>
        <Button onClick={() => setIsTeamDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teams..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No teams yet. Create your first team to collaborate with other freelancers!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {team.name}
                    </CardTitle>
                    {team.description && (
                      <p className="text-sm text-muted-foreground mt-1">{team.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTeam(team);
                          setIsMemberDialogOpen(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Team Leader</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {team.leader.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{team.leader.fullName}</p>
                    </div>
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">
                    Members ({team.members.length})
                  </p>
                  {team.members.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No members yet</p>
                  ) : (
                    <div className="space-y-2">
                      {team.members.slice(0, 3).map((member: any) => (
                        <div key={member.id} className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback>
                              {member.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">{member.fullName}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      ))}
                      {team.members.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{team.members.length - 3} more members
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Created {format(new Date(team.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="Design Team"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamDescription">Description</Label>
              <Textarea
                id="teamDescription"
                value={teamForm.description}
                onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                placeholder="What is this team for?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTeamDialogOpen(false)}
              disabled={isCreatingTeam}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} disabled={isCreatingTeam || !teamForm.name}>
              {isCreatingTeam ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="memberEmail">User Email</Label>
              <Input
                id="memberEmail"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="user@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Enter the email of the freelancer you want to add
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!memberEmail.trim()}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


