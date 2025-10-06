import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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

import { api } from "@/services/api";

type Client = {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
  totalSpend: number;
};

let sampleClients: Client[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    status: "active",
    createdAt: "2023-09-01T10:00:00Z",
    totalSpend: 1200,
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    status: "inactive",
    createdAt: "2023-08-15T12:30:00Z",
    totalSpend: 450,
  },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    status: "active",
    createdAt: "2023-07-20T09:15:00Z",
    totalSpend: 980,
  },
];

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response: any = await api.get("/api/clients");

        if (response.status !== 200) {
          throw new Error("Failed to fetch");
        }

        const payload: any = response?.data?.data;
        console.log(payload);

        // Map the API response to match the expected Client type
        const mappedClients: Client[] = payload.map((c: any) => ({
          id: c.id,
          name: c.client_name,
          email: c.contact_email,
          status: c.status,
          createdAt: c.created_at,
          totalSpend: Number(c.total_spend),
        }));

        setClients(mappedClients);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Spend</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.status === "active" ? "default" : "secondary"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${c.totalSpend}</TableCell>
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {clients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No clients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
