import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Client = {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
  totalSpend: number;
};

const sampleClients: Client[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", status: "active", createdAt: "2023-09-01T10:00:00Z", totalSpend: 1200 },
  { id: 2, name: "Bob Smith", email: "bob@example.com", status: "inactive", createdAt: "2023-08-15T12:30:00Z", totalSpend: 450 },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", status: "active", createdAt: "2023-07-20T09:15:00Z", totalSpend: 980 },
];

type UserRole = "admin" | "client";

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>("admin");
  const [currentUserId, setCurrentUserId] = useState<number | null>(1);

  // Add / Edit modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form state
  const [formClientId, setFormClientId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    setTimeout(() => {
      setClients(sampleClients);
      if (userRole === "client" && currentUserId) {
        setSelectedClientId(currentUserId);
      } else {
        setSelectedClientId(null);
      }
      setIsLoading(false);
    }, 200);
  }, [userRole, currentUserId]);

  const deleteClient = (id: number) => {
    setClients(prev => prev.filter(c => c.id !== id));
    if (selectedClientId === id) setSelectedClientId(null);
  };

  const openAddModal = () => {
    setFormClientId(null);
    setFormName("");
    setFormEmail("");
    setFormStatus("active");
    setIsAddModalOpen(true);
  };

  const addClient = () => {
    const newClient: Client = {
      id: Math.max(...clients.map(c => c.id)) + 1,
      name: formName,
      email: formEmail,
      status: formStatus,
      createdAt: new Date().toISOString(),
      totalSpend: 0,
    };
    setClients(prev => [...prev, newClient]);
    setIsAddModalOpen(false);
  };

  const openEditModal = (client: Client) => {
    setFormClientId(client.id);
    setFormName(client.name);
    setFormEmail(client.email);
    setFormStatus(client.status);
    setIsEditModalOpen(true);
  };

  const saveEditClient = () => {
    if (formClientId === null) return;
    setClients(prev =>
      prev.map(c => (c.id === formClientId ? { ...c, name: formName, email: formEmail, status: formStatus } : c))
    );
    setIsEditModalOpen(false);
  };

  const filteredClients = clients.filter(c => {
    if (userRole === "client" && currentUserId) return c.id === currentUserId;
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const displayedClients = selectedClientId
    ? filteredClients.filter(c => c.id === selectedClientId)
    : filteredClients;

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h2 className="text-3xl font-bold">Clients</h2>

        {/* Role Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Role: {userRole}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setUserRole("admin")}>Admin</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setUserRole("client")}>Client</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Client Dropdown for Admin */}
        {userRole === "admin" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Select Client</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {clients.map(c => (
                <DropdownMenuItem key={c.id} onClick={() => setSelectedClientId(c.id)}>
                  {c.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => setSelectedClientId(null)}>All Clients</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Add Client Button (only admin) */}
        {userRole === "admin" && (
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" /> Add Client
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-sm"
          startAdornment={<Search className="h-4 w-4 text-gray-400" />}
        />
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <Card className="rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Spend</TableHead>
                <TableHead>Joined</TableHead>
                {userRole === "admin" && <TableHead className="w-[50px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedClients.map(c => (
                <TableRow key={c.id} className="hover:bg-gray-100 cursor-pointer">
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "active" ? "default" : "secondary"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${c.totalSpend.toLocaleString()}</TableCell>
                  <TableCell>{formatDate(c.createdAt)}</TableCell>
                  {userRole === "admin" && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(c)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteClient(c.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {displayedClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={userRole === "admin" ? 6 : 5} className="text-center text-gray-500 py-6">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Client Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Name" value={formName} onChange={e => setFormName(e.target.value)} />
            <Input placeholder="Email" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>{formStatus}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFormStatus("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFormStatus("inactive")}>Inactive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={addClient}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Name" value={formName} onChange={e => setFormName(e.target.value)} />
            <Input placeholder="Email" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>{formStatus}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFormStatus("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFormStatus("inactive")}>Inactive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={saveEditClient}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
