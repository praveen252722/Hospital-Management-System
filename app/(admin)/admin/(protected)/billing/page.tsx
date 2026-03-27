"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Receipt, DollarSign, TrendingUp, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { fetchAPI, type Billing, type BillingSummary, type Patient } from "@/lib/api";

interface BillingFormData {
  patientId: string;
  patientName: string;
  amount: string;
  description: string;
  status: string;
}

const initialFormData: BillingFormData = {
  patientId: "",
  patientName: "",
  amount: "",
  description: "",
  status: "pending",
};

export default function AdminBillingPage() {
  const { loading: authLoading } = useAuth();
  const [billings, setBillings] = useState<Billing[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBilling, setEditingBilling] = useState<Billing | null>(null);
  const [formData, setFormData] = useState<BillingFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  async function loadData() {
    setLoading(true);
    try {
      const [billingsData, patientsData, summaryData] = await Promise.all([
        fetchAPI<Billing[]>("/billing"),
        fetchAPI<Patient[]>("/patients"),
        fetchAPI<BillingSummary>("/billing/summary"),
      ]);
      setBillings(billingsData);
      setPatients(patientsData);
      setSummary(summaryData);
    } catch (error) {
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  }

  function openAddDialog() {
    setEditingBilling(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }

  function openEditDialog(billing: Billing) {
    setEditingBilling(billing);
    setFormData({
      patientId: billing.patientId,
      patientName: billing.patientName,
      amount: billing.amount.toString(),
      description: billing.description || "",
      status: billing.status,
    });
    setIsDialogOpen(true);
  }

  function handlePatientChange(patientId: string) {
    const patient = patients.find((p) => p._id === patientId);
    setFormData({
      ...formData,
      patientId,
      patientName: patient?.name || "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      patientId: formData.patientId,
      patientName: formData.patientName,
      amount: parseFloat(formData.amount),
      description: formData.description || undefined,
      status: formData.status,
      paymentDate: formData.status === "paid" ? new Date().toISOString() : undefined,
    };

    try {
      if (editingBilling) {
        await fetchAPI(`/billing/${editingBilling._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Billing record updated successfully");
      } else {
        await fetchAPI("/billing", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Billing record created successfully");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error("Failed to save billing record");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Receipt className="h-8 w-8 text-primary" />
            Billing Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage patient bills and track payments
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Billing
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-5">
              ${summary?.totalRevenue.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.paidRecords || 0} paid bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Payments
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">
              ${summary?.pendingPayments.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.pendingRecords || 0} pending bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Records
            </CardTitle>
            <Receipt className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.totalRecords || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All billing records</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : billings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No billing records found. Create a new billing record to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billings.map((billing) => (
                  <TableRow key={billing._id}>
                    <TableCell className="font-medium">{billing.patientName}</TableCell>
                    <TableCell className="font-semibold">
                      ${billing.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {billing.description || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-sm capitalize ${
                          billing.status === "paid"
                            ? "bg-chart-5/20 text-chart-5"
                            : "bg-chart-3/20 text-chart-3"
                        }`}
                      >
                        {billing.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {billing.paymentDate
                        ? new Date(billing.paymentDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(billing.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(billing)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingBilling ? "Edit Billing Record" : "Add Billing Record"}
            </DialogTitle>
            <DialogDescription>
              {editingBilling
                ? "Update the billing details below."
                : "Fill in the details to create a new billing record."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={handlePatientChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Consultation fee, Lab tests..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingBilling ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
