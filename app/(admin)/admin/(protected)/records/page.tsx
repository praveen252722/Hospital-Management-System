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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, FileText, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { fetchAPI, type Patient, type Visit } from "@/lib/api";

export default function AdminRecordsPage() {
  const { loading: authLoading } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientVisits, setPatientVisits] = useState<Visit[]>([]);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [loadingVisits, setLoadingVisits] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadPatients();
    }
  }, [authLoading]);

  useEffect(() => {
    setFilteredPatients(patients);
  }, [patients]);

  async function loadPatients() {
    setLoading(true);
    try {
      const data = await fetchAPI<Patient[]>("/patients");
      setPatients(data);
    } catch (error) {
      toast.error("Failed to load patient records");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }
    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.disease?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }

  async function viewPatientDetails(patient: Patient) {
    setSelectedPatient(patient);
    setIsDetailDialogOpen(true);
    setLoadingVisits(true);

    try {
      const visits = await fetchAPI<Visit[]>("/visits");
      const patientVisits = visits.filter((v) => v.patientId === patient._id);
      setPatientVisits(patientVisits);
    } catch (error) {
      toast.error("Failed to load visit history");
    } finally {
      setLoadingVisits(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Patient Records
        </h1>
        <p className="text-muted-foreground mt-1">
          View complete patient records and visit history (Read-only)
        </p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name or disease..."
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
          <CardTitle>All Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No patient records found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Disease</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient._id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      {patient.email || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {patient.disease ? (
                        <span className="bg-secondary px-2 py-1 rounded text-sm">
                          {patient.disease}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewPatientDetails(patient)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Patient Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete record for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age / Gender</p>
                  <p className="font-medium">
                    {selectedPatient.age} years, {selectedPatient.gender}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedPatient.email || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedPatient.address || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disease</p>
                  <p className="font-medium">{selectedPatient.disease || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-medium">
                    {new Date(selectedPatient.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Visit History</h4>
                {loadingVisits ? (
                  <Skeleton className="h-20 w-full" />
                ) : patientVisits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No visit records</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {patientVisits.map((visit) => (
                      <div key={visit._id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Dr. {visit.doctorName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(visit.visitDate).toLocaleDateString()}
                            </p>
                          </div>
                          {visit.disease && (
                            <span className="text-xs bg-secondary px-2 py-1 rounded">
                              {visit.disease}
                            </span>
                          )}
                        </div>
                        {visit.prescription && (
                          <p className="text-sm mt-2">
                            <span className="text-muted-foreground">Rx: </span>
                            {visit.prescription}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
