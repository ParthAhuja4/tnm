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
  id: number | string;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
  phoneNo: number;
  services: string;
};

let sampleClients: Client[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    status: "active",
    createdAt: "2023-09-01T10:00:00Z",
    phoneNo: 9999999999,
    services: "Web Dev",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    status: "inactive",
    createdAt: "2023-08-15T12:30:00Z",
    phoneNo: 9999999999,
    services: "Web Dev",
  },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    status: "active",
    createdAt: "2023-07-20T09:15:00Z",
    phoneNo: 9999999999,
    services: "Web Dev",
  },
];

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState(sampleClients);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<
    number | string | null
  >(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setRole(userData?.role || "");

    const fetchClients = async () => {
      try {
        const response: any = await api.get("/api/clients");
        if (response.status !== 200) {
          throw new Error("Failed to fetch");
        }

        const payload: any = response?.data?.data;
        // Map the API response to match the expected Client type
        const mappedClients: Client[] = payload.map((c: any) => ({
          id: c.client_id,
          name: c.client_name,
          email: c.contact_email,
          status: c.status,
          createdAt: c.created_at,
          phoneNo: c?.phoneNo || 9999999999,
          services: c?.phoneNo || "Web Dev",
        }));
        setClients(mappedClients);

        // Check if localStorage has a selected client ID that matches one of the clients
        const storedClientId = userData?.id;
        if (storedClientId && storedClientId !== 1) {
          const clientExists = mappedClients.some(
            (client) => client.id === storedClientId
          );
          if (clientExists) {
            setSelectedClientId(storedClientId);
          }
        }
      } catch (e) {
        console.log(e);
        // Even if API fails, check localStorage against sample clients
        const storedClientId = userData?.id;
        if (storedClientId && storedClientId !== 1) {
          const clientExists = sampleClients.some(
            (client) => client.id === storedClientId
          );
          if (clientExists) {
            setSelectedClientId(storedClientId);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Additional useEffect to handle localStorage sync when clients state changes
  useEffect(() => {
    if (clients.length > 0 && !isLoading) {
      const userData = JSON.parse(localStorage.getItem("user") || "null");
      const storedClientId = userData?.id;

      // Only set selected client if it exists in the current clients list and is not the default value (1)
      if (storedClientId && storedClientId !== 1) {
        const clientExists = clients.some(
          (client) => client.id === storedClientId
        );
        if (clientExists && selectedClientId === null) {
          setSelectedClientId(storedClientId);
        }
      }
    }
  }, [clients, isLoading, selectedClientId]);

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  const handleCheckboxChange = (
    clientId: number | string,
    isChecked: boolean
  ) => {
    if (isChecked) {
      // If trying to check a new checkbox when one is already selected, do nothing
      if (selectedClientId !== null && selectedClientId !== clientId) {
        return;
      }
      // Set this client as selected
      setSelectedClientId(clientId);
      const prev = JSON.parse(localStorage.getItem("user") || "null");
      const obj = JSON.stringify({ ...prev, id: clientId });
      localStorage.setItem("user", obj);
    } else {
      // Uncheck the current selection
      setSelectedClientId(null);
      const prev = JSON.parse(localStorage.getItem("user") || "null");
      const obj = JSON.stringify({ ...prev, id: 1 });
      localStorage.setItem("user", obj);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {role === "Admin" && selectedClientId !== null && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700 font-medium">
                Client selected:{" "}
                {clients.find((c) => c.id === selectedClientId)?.name}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                To select a different client, first uncheck the current
                selection
              </p>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Phone No</TableHead>
                <TableHead>Services</TableHead>
                {role === "Admin" ? <TableHead>View</TableHead> : <></>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => {
                const isSelected = selectedClientId === c.id;
                const isDisabled = selectedClientId !== null && !isSelected;
                return (
                  <TableRow
                    key={c.id}
                    className={isDisabled ? "opacity-50" : ""}
                  >
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
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                    <TableCell>{c.phoneNo}</TableCell>
                    <TableCell>{c.services}</TableCell>
                    {role === "Admin" ? (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={(e: any) => {
                              handleCheckboxChange(c.id, e.target.checked);
                            }}
                            className={`
${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
`}
                          />
                          {isDisabled && (
                            <span className="text-xs text-gray-500">
                              Disabled
                            </span>
                          )}
                        </div>
                      </TableCell>
                    ) : (
                      <></>
                    )}
                  </TableRow>
                );
              })}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
