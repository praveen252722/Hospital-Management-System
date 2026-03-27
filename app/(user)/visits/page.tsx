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
import { Search, Plus, Pencil, Trash2, ClipboardList } from "lucide-react";
import { fetchAPI, type Visit, type Patient, type Doctor } from "@/lib/api";

interface VisitFormData {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  disease: string;
  prescription: string;
  notes: string;
}

const initialFormData: VisitFormData = {
  patientId: "",
  patientName: "",
  doctorId: "",
  doctorName: "",
  visitDate: "",
  disease: "",
  prescription: "",
  notes: "",
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [deletingVisit, setDeletingVisit] = useState<Visit | null>(null);
  const [formData, setFormData] = useState<VisitFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [visitsData, patientsData, doctorsData] = await Promise.all([
        fetchAPI<Visit[]>("/visits"),
        fetchAPI<Patient[]>("/patients"),
        fetchAPI<Doctor[]>("/doctors"),
      ]);
      setVisits(visitsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }
    setLoading(true);
    try {
      const data = await fetchAPI<Visit[]>(
        `/visits/search?name=${encodeURIComponent(searchTerm)}`
      );
      setVisits(data);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }

  function openAddDialog() {
    setEditingVisit(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }

  function openEditDialog(visit: Visit) {
    setEditingVisit(visit);
    setFormData({
      patientId: visit.patientId,
      patientName: visit.patientName,
      doctorId: visit.doctorId,
      doctorName: visit.doctorName,
      visitDate: visit.visitDate.split("T")[0],
      disease: visit.disease || "",
      prescription: visit.prescription || "",
      notes: visit.notes || "",
    });
    setIsDialogOpen(true);
  }

  function openDeleteDialog(visit: Visit) {
    setDeletingVisit(visit);
    setIsDeleteDialogOpen(true);
  }

  function handlePatientChange(patientId: string) {
    const patient = patients.find((p) => p._id === patientId);
    setFormData({
      ...formData,
      patientId,
      patientName: patient?.name || "",
      disease: patient?.disease || formData.disease,
    });
  }

  function handleDoctorChange(doctorId: string) {
    const doctor = doctors.find((d) => d._id === doctorId);
    setFormData({
      ...formData,
      doctorId,
      doctorName: doctor?.name || "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      patientId: formData.patientId,
      patientName: formData.patientName,
      doctorId: formData.doctorId,
      doctorName: formData.doctorName,
      visitDate: formData.visitDate,
      disease: formData.disease || undefined,
      prescription: formData.prescription || undefined,
      notes: formData.notes || undefined,
    };

    try {
      if (editingVisit) {
        await fetchAPI(`/visits/${editingVisit._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Visit record updated successfully");
      } else {
        await fetchAPI("/visits", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Visit record created successfully");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error(editingVisit ? "Failed to update visit record" : "Failed to create visit record");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingVisit) return;
    setSubmitting(true);

    try {
      await fetchAPI(`/visits/${deletingVisit._id}`, {
        method: "DELETE",
      });
      toast.success("Visit record deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingVisit(null);
      loadData();
    } catch (error) {
      toast.error("Failed to delete visit record");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            Patients Visited
          </h1>
          <p className="text-muted-foreground mt-1">
            Track patient visit records and prescriptions
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Visit Record
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient or doctor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              Fetch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : visits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No visit records found. Add a new record to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Disease</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit) => (
                  <TableRow key={visit._id}>
                    <TableCell className="font-medium">{visit.patientName}</TableCell>
                    <TableCell>Dr. {visit.doctorName}</TableCell>
                    <TableCell>{new Date(visit.visitDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {visit.disease ? (
                        <span className="bg-secondary px-2 py-1 rounded text-sm">
                          {visit.disease}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(visit)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(visit)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
              {editingVisit ? "Edit Visit Record" : "Add Visit Record"}
            </DialogTitle>
            <DialogDescription>
              {editingVisit
                ? "Update the visit details below."
                : "Fill in the details to add a new visit record."}
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
                <Label htmlFor="doctor">Doctor *</Label>
                <Select
                  value={formData.doctorId}
                  onValueChange={handleDoctorChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} ({doctor.specialization})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="visitDate">Visit Date *</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="disease">Disease/Diagnosis</Label>
                <Input
                  id="disease"
                  value={formData.disease}
                  onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                  placeholder="e.g., Common Cold, Fever"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prescription">Prescription</Label>
                <Textarea
                  id="prescription"
                  value={formData.prescription}
                  onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                  placeholder="Medications and dosage..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingVisit ? "Update" : "Add Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Visit Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the visit record for {deletingVisit?.patientName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
