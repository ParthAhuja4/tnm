import React, { useEffect, useMemo, useState } from "react";

import {
  Loader2,
  Search,
  SlidersHorizontal,
  PlusCircle,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";

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

type StatusFilter = "all" | "active" | "inactive";

type ClientFormValues = {
  id: number | string | null;
  name: string;
  email: string;
  status: "active" | "inactive";
  phoneNo: string;
  services: string;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const DEFAULT_PHONE_NUMBER = 9999999999;

const createEmptyForm = (): ClientFormValues => ({
  id: null,
  name: "",
  email: "",
  status: "active",
  phoneNo: "",
  services: "",
});

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
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<
    number | string | null
  >(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [formValues, setFormValues] = useState<ClientFormValues>(
    createEmptyForm()
  );
  const [formError, setFormError] = useState<string | null>(null);

  const showAdminControls = role === "Admin";

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
        const mappedClients: Client[] = payload.map((c: any) => ({
          id: c.client_id,
          name: c.client_name,
          email: c.contact_email,
          status: c.status,
          createdAt: c.created_at,
          phoneNo: c?.phoneNo || DEFAULT_PHONE_NUMBER,
          services: c?.services || "Web Dev",
        }));
        setClients(mappedClients);

        const storedClientId = userData?.id;
        if (storedClientId && storedClientId !== 1) {
          const clientExists = mappedClients.some(
            (client) => client.id === storedClientId
          );
          if (clientExists) {
            setSelectedClientId(storedClientId);
          }
        }
      } catch (error) {
        console.log(error);
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

  useEffect(() => {
    if (clients.length > 0 && !isLoading) {
      const userData = JSON.parse(localStorage.getItem("user") || "null");
      const storedClientId = userData?.id;

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

  const filteredClients = useMemo(() => {
    if (!showAdminControls) {
      return clients;
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesStatus =
        statusFilter === "all" ? true : client.status === statusFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        client.name.toLowerCase().includes(normalizedSearch) ||
        client.email.toLowerCase().includes(normalizedSearch) ||
        client.services.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [clients, searchTerm, statusFilter, showAdminControls]);

  const totalPages = showAdminControls
    ? Math.max(1, Math.ceil(filteredClients.length / pageSize))
    : 1;
  const paginatedClients = showAdminControls
    ? filteredClients.slice(
        (currentPage - 1) * pageSize,
        (currentPage - 1) * pageSize + pageSize
      )
    : filteredClients;
  const displayedClients = paginatedClients;
  const startIndex = showAdminControls ? (currentPage - 1) * pageSize : 0;
  const endIndex = showAdminControls
    ? Math.min(startIndex + paginatedClients.length, filteredClients.length)
    : filteredClients.length;

  useEffect(() => {
    if (!showAdminControls) {
      return;
    }
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize, showAdminControls]);

  useEffect(() => {
    if (!showAdminControls) {
      return;
    }
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages, showAdminControls]);

  const totalClients = clients.length;
  const activeCount = useMemo(
    () => clients.filter((client) => client.status === "active").length,
    [clients]
  );
  const inactiveCount = totalClients - activeCount;
  const selectedClient = clients.find(
    (client) => client.id === selectedClientId
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Total clients",
        value: totalClients,
        icon: Users,
        accent: "bg-violet-500/10 text-violet-600",
      },
      {
        label: "Active",
        value: activeCount,
        icon: UserCheck,
        accent: "bg-emerald-500/10 text-emerald-600",
      },
      {
        label: "Inactive",
        value: inactiveCount,
        icon: UserX,
        accent: "bg-amber-500/10 text-amber-600",
      },
    ],
    [totalClients, activeCount, inactiveCount]
  );

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  const handleCheckboxChange = (
    clientId: number | string,
    isChecked: boolean
  ) => {
    if (isChecked) {
      if (selectedClientId !== null && selectedClientId !== clientId) {
        return;
      }
      setSelectedClientId(clientId);
      const prev = JSON.parse(localStorage.getItem("user") || "null");
      const obj = JSON.stringify({ ...prev, id: clientId });
      localStorage.setItem("user", obj);
    } else {
      setSelectedClientId(null);
      const prev = JSON.parse(localStorage.getItem("user") || "null");
      const obj = JSON.stringify({ ...prev, id: 1 });
      localStorage.setItem("user", obj);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormError(null);
    setFormValues(createEmptyForm());
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseDialog();
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleOpenAddDialog = () => {
    setDialogMode("add");
    setFormError(null);
    setFormValues(createEmptyForm());
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (client: Client) => {
    setDialogMode("edit");
    setFormError(null);
    setFormValues({
      id: client.id,
      name: client.name,
      email: client.email,
      status: client.status,
      phoneNo: client.phoneNo ? String(client.phoneNo) : "",
      services: client.services || "",
    });
    setIsDialogOpen(true);
  };

  const handleDialogSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedName = formValues.name.trim();
    const trimmedEmail = formValues.email.trim();
    const trimmedServices = formValues.services.trim();

    if (!trimmedName || !trimmedEmail) {
      setFormError("Name and email are required.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    const phoneDigits = formValues.phoneNo.replace(/\D+/g, "");
    const parsedPhone =
      phoneDigits.length > 0 ? Number(phoneDigits) : DEFAULT_PHONE_NUMBER;

    if (Number.isNaN(parsedPhone)) {
      setFormError("Phone number must contain digits only.");
      return;
    }

    if (dialogMode === "add") {
      const newClient: Client = {
        id: Date.now(),
        name: trimmedName,
        email: trimmedEmail,
        status: formValues.status,
        createdAt: new Date().toISOString(),
        phoneNo: parsedPhone || DEFAULT_PHONE_NUMBER,
        services: trimmedServices || "Web Dev",
      };

      setClients((prev) => [newClient, ...prev]);
      setCurrentPage(1);
    } else if (formValues.id !== null) {
      setClients((prev) =>
        prev.map((client) =>
          client.id === formValues.id
            ? {
                ...client,
                name: trimmedName,
                email: trimmedEmail,
                status: formValues.status,
                phoneNo: parsedPhone || DEFAULT_PHONE_NUMBER,
                services: trimmedServices || "Web Dev",
              }
            : client
        )
      );
    }

    handleCloseDialog();
  };

  const handlePageChange = (direction: "prev" | "next") => {
    if (!showAdminControls) {
      return;
    }

    if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }

    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const columnCount = showAdminControls ? 8 : 6;
  const noResultsMessage =
    showAdminControls &&
    (searchTerm.trim().length > 0 || statusFilter !== "all")
      ? "No clients match your current filters."
      : "No clients found.";
  const hasResults = displayedClients.length > 0;
  const startDisplay = showAdminControls && hasResults ? startIndex + 1 : 0;
  const endDisplay =
    showAdminControls && hasResults ? endIndex : displayedClients.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-violet-600">
                Client Center
              </span>
              <h1 className="text-3xl font-semibold text-slate-900">
                Client Directory
              </h1>
              <p className="text-sm text-slate-600">
                Review accounts, track engagement, and for admins, manage
                clients in one place.
              </p>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-3 md:w-auto">
              {summaryCards.map(({ label, value, icon: Icon, accent }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">
                      {value}
                    </p>
                  </div>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-sm">
          <CardHeader className="flex flex-col gap-2 space-y-0 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold  dark:text-slate-900 text-slate-900">
                Clients
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Centralized overview of every client relationship.
              </p>
            </div>
            {showAdminControls ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
                Admin tools enabled
              </span>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-6">
            {showAdminControls &&
              selectedClientId !== null &&
              selectedClient && (
                <div className="rounded-2xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm text-violet-700 shadow-sm">
                  <p className="font-medium">
                    Client selected: {selectedClient.name}
                  </p>
                  <p className="mt-1 text-xs text-violet-600">
                    To select a different client, first uncheck the current
                    selection.
                  </p>
                </div>
              )}

            {showAdminControls && (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex w-full flex-col gap-4 lg:flex-1">
                  <div>
                    <Label
                      htmlFor="client-search"
                      className="mb-1 block text-xs font-semibold uppercase tracking-wide text-black dark:text-black"
                    >
                      Search
                    </Label>
                    <Input
                      id="client-search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search by client name, email, or service"
                      startAdornment={<Search className="h-4 w-4" />}
                      className="h-11 rounded-xl border-slate-200 bg-white/80 text-sm focus:border-violet-400 focus:ring-violet-200 text-black dark:text-black"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label
                        htmlFor="client-status-filter"
                        className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Status
                      </Label>
                      <div className="relative">
                        <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                          id="client-status-filter"
                          value={statusFilter}
                          onChange={(event) =>
                            setStatusFilter(event.target.value as StatusFilter)
                          }
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                        >
                          <option value="all">All statuses</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="client-page-size"
                        className="block text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Per page
                      </Label>
                      <select
                        id="client-page-size"
                        value={pageSize}
                        onChange={(event) =>
                          setPageSize(Number(event.target.value))
                        }
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      >
                        {PAGE_SIZE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option} per page
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleOpenAddDialog}
                  variant="gradient"
                  size="lg"
                  className="h-12 rounded-2xl px-6 font-semibold shadow-lg transition-transform hover:translate-y-[-1px]"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Client
                </Button>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
              <Table className="min-w-[720px] bg-white/95">
                <TableHeader>
                  <TableRow className="bg-slate-50/80 text-slate-600 dark:text-slate-600">
                    <TableHead className="bg-slate-50/80 text-slate-600 dark:text-slate-600">
                      Client
                    </TableHead>
                    <TableHead className="bg-slate-50/80 text-slate-600 dark:text-slate-600">
                      Email
                    </TableHead>
                    <TableHead className="bg-slate-50/80 text-slate-600 dark:text-slate-600">
                      Status
                    </TableHead>
                    <TableHead className="bg-slate-50/80 text-slate-600 dark:text-slate-600">
                      Joined
                    </TableHead>
                    <TableHead className="bg-slate-50/80 text-slate-600 dark:text-slate-600">
                      Phone No
                    </TableHead>
                    <TableHead className="bg-slate-50/80 text-slate-600 dark:text-slate-600">
                      Services
                    </TableHead>
                    {showAdminControls ? (
                      <>
                        <TableHead className="bg-slate-50/80 text-slate-600 dark:text-slate-600">
                          Manage
                        </TableHead>
                        <TableHead className="bg-slate-50/80 text-slate-600 dark:text-slate-600 text-center">
                          View
                        </TableHead>
                      </>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedClients.map((client) => {
                    const isSelected = selectedClientId === client.id;
                    const isDisabled = selectedClientId !== null && !isSelected;

                    return (
                      <TableRow
                        key={client.id}
                        className={`border-slate-200 text-black hover:bg-gray-300 transition-colors ${
                          isSelected ? "bg-violet-50/80" : ""
                        } ${isDisabled ? "opacity-60" : ""}`}
                      >
                        <TableCell className="font-medium text-black hover:bg-gray-300">
                          {client.name}
                        </TableCell>
                        <TableCell className="text-black hover:bg-gray-300">
                          {client.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              client.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-black hover:bg-gray-300">
                          {formatDate(client.createdAt)}
                        </TableCell>
                        <TableCell className="text-black hover:bg-gray-300">
                          {client.phoneNo}
                        </TableCell>
                        <TableCell className="text-black hover:bg-gray-300">
                          {client.services}
                        </TableCell>
                        {showAdminControls ? (
                          <>
                            <TableCell>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-100/80"
                                onClick={() => handleOpenEditDialog(client)}
                              >
                                <Pencil className="mr-1 h-4 w-4" />
                                Edit
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="inline-flex items-center justify-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={isDisabled}
                                  onChange={(event) =>
                                    handleCheckboxChange(
                                      client.id,
                                      event.target.checked
                                    )
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-violet-500 focus:ring-violet-400"
                                />
                                {isDisabled && (
                                  <span className="text-xs text-slate-400">
                                    Locked
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </>
                        ) : null}
                      </TableRow>
                    );
                  })}

                  {!hasResults && (
                    <TableRow>
                      <TableCell
                        colSpan={columnCount}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        {noResultsMessage}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {showAdminControls && hasResults && (
              <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {startDisplay}-{endDisplay}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredClients.length}
                  </span>{" "}
                  clients
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange("prev")}
                    disabled={currentPage === 1}
                    className="rounded-xl"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-sm font-medium text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange("next")}
                    disabled={currentPage === totalPages}
                    className="rounded-xl"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showAdminControls && (
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "add" ? "Add Client" : "Edit Client"}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === "add"
                  ? "Create a new client record. Details stay local to this dashboard."
                  : "Update client details without affecting server data."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDialogSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client name</Label>
                  <Input
                    id="client-name"
                    value={formValues.name}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Acme Corporation"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={formValues.email}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    placeholder="client@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-status">Status</Label>
                  <select
                    id="client-status"
                    value={formValues.status}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        status: event.target.value as "active" | "inactive",
                      }))
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-phone">Phone number</Label>
                  <Input
                    id="client-phone"
                    type="tel"
                    value={formValues.phoneNo}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        phoneNo: event.target.value,
                      }))
                    }
                    placeholder="9999999999"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-services">Services</Label>
                <Input
                  id="client-services"
                  value={formValues.services}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      services: event.target.value,
                    }))
                  }
                  placeholder="Web Development, SEO, Paid Ads"
                />
              </div>

              {formError ? (
                <p className="text-sm font-medium text-destructive">
                  {formError}
                </p>
              ) : null}

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient">
                  {dialogMode === "add" ? "Add Client" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
