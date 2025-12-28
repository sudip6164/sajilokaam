import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  type: "Freelancer" | "Client";
  status: "Active" | "Pending" | "Suspended";
  joinDate: string;
  verified: boolean;
}

const initialUsers: User[] = [
  { id: "1", name: "Rajesh Sharma", email: "rajesh@email.com", type: "Freelancer", status: "Active", joinDate: "2024-01-15", verified: true },
  { id: "2", name: "Sita Thapa", email: "sita@email.com", type: "Client", status: "Active", joinDate: "2024-02-20", verified: true },
  { id: "3", name: "Bikash Gurung", email: "bikash@email.com", type: "Freelancer", status: "Pending", joinDate: "2024-03-10", verified: false },
  { id: "4", name: "Anita Rai", email: "anita@email.com", type: "Client", status: "Active", joinDate: "2024-03-15", verified: true },
  { id: "5", name: "Prakash KC", email: "prakash@email.com", type: "Freelancer", status: "Suspended", joinDate: "2024-01-05", verified: false },
  { id: "6", name: "Maya Tamang", email: "maya@email.com", type: "Freelancer", status: "Active", joinDate: "2024-04-01", verified: true },
  { id: "7", name: "Sunil Shrestha", email: "sunil@email.com", type: "Client", status: "Pending", joinDate: "2024-04-10", verified: false },
  { id: "8", name: "Gita Magar", email: "gita@email.com", type: "Freelancer", status: "Active", joinDate: "2024-02-28", verified: true },
];

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Freelancer" | "Client">("All");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Pending" | "Suspended">("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", type: "Freelancer" as "Freelancer" | "Client" });
  const { toast } = useToast();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || user.type === filterType;
    const matchesStatus = filterStatus === "All" || user.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreate = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      type: formData.type,
      status: "Pending",
      joinDate: new Date().toISOString().split("T")[0],
      verified: false,
    };
    setUsers([...users, newUser]);
    setIsCreateOpen(false);
    setFormData({ name: "", email: "", type: "Freelancer" });
    toast({ title: "User Created", description: `${newUser.name} has been added successfully.` });
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...formData } : u)));
    setIsEditOpen(false);
    setSelectedUser(null);
    toast({ title: "User Updated", description: "User details have been updated successfully." });
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setIsDeleteOpen(false);
    setSelectedUser(null);
    toast({ title: "User Deleted", description: "User has been removed successfully.", variant: "destructive" });
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, type: user.type });
    setIsEditOpen(true);
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage freelancers and clients on the platform</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="All">All Types</option>
                <option value="Freelancer">Freelancers</option>
                <option value="Client">Clients</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Type</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Join Date</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Verified</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <span className="text-primary-foreground font-medium">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.type === "Freelancer" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                      }`}>
                        {user.type}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">{user.joinDate}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "Active" ? "bg-secondary/10 text-secondary" :
                        user.status === "Pending" ? "bg-accent/10 text-accent" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {user.status === "Active" && <CheckCircle className="h-3 w-3" />}
                        {user.status === "Pending" && <Clock className="h-3 w-3" />}
                        {user.status === "Suspended" && <XCircle className="h-3 w-3" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      {user.verified ? (
                        <CheckCircle className="h-5 w-5 text-secondary" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDelete(user)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email address" />
            </div>
            <div className="space-y-2">
              <Label>User Type</Label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as "Freelancer" | "Client" })} className="w-full px-3 py-2 rounded-lg border border-input bg-background">
                <option value="Freelancer">Freelancer</option>
                <option value="Client">Client</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>User Type</Label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as "Freelancer" | "Client" })} className="w-full px-3 py-2 rounded-lg border border-input bg-background">
                <option value="Freelancer">Freelancer</option>
                <option value="Client">Client</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{selectedUser?.name}</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
