"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  LogOut,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Search,
} from "lucide-react";

interface PatientVisit {
  _id: string;
  patientName: string;
  phone: string;
  date: string;
  disease: string;
  paymentMethod: string;
  weight: number;
  bloodGroup: string;
  status: "pending" | "in-progress" | "completed";
  doctorAssigned?: string;
  amount: number;
}

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientVisit[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalRevenue: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientVisit | null>(null);
  const [newPatient, setNewPatient] = useState({
    patientName: "",
    phone: "",
    date: "",
    disease: "",
    paymentMethod: "Cash",
    weight: "",
    bloodGroup: "O+",
    amount: "",
    doctorAssigned: "",
  });

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    if (loggedIn !== "true") {
      router.push("/admin/login");
    } else {
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/patient-visits");
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setPatients(data);
          updateStats(data);
          localStorage.setItem("patients", JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error("API not available, using localStorage");
    } finally {
      const stored = localStorage.getItem("patients");
      if (stored) {
        const data = JSON.parse(stored);
        setPatients(data);
        updateStats(data);
      }
      setLoading(false);
    }
  };

  const updateStats = (data: PatientVisit[]) => {
    setStats({
      total: data.length,
      pending: data.filter((p: PatientVisit) => p.status === "pending").length,
      inProgress: data.filter((p: PatientVisit) => p.status === "in-progress").length,
      completed: data.filter((p: PatientVisit) => p.status === "completed").length,
      totalRevenue: data.reduce((sum: number, p: PatientVisit) => sum + (p.amount || 0), 0),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const patientData = {
      _id: Date.now().toString(),
      ...newPatient,
      weight: Number(newPatient.weight),
      amount: Number(newPatient.amount),
      date: new Date(newPatient.date).toISOString(),
      status: "pending",
    };
    
    try {
      const res = await fetch("http://localhost:3001/api/patient-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });
      if (res.ok) {
        setShowAddModal(false);
        resetForm();
        fetchData();
        return;
      }
    } catch (error) {
      console.log("Using localStorage fallback");
    }
    
    const stored = localStorage.getItem("patients");
    const patients = stored ? JSON.parse(stored) : [];
    patients.unshift(patientData);
    localStorage.setItem("patients", JSON.stringify(patients));
    setPatients(patients);
    updateStats(patients);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewPatient({
      patientName: "",
      phone: "",
      date: "",
      disease: "",
      paymentMethod: "Cash",
      weight: "",
      bloodGroup: "O+",
      amount: "",
      doctorAssigned: "",
    });
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/patient-visits/${editingPatient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPatient),
      });
      if (res.ok) {
        setEditingPatient(null);
        fetchData();
        return;
      }
    } catch (error) {
      console.log("Using localStorage fallback");
    }
    
    const stored = localStorage.getItem("patients");
    const patients = stored ? JSON.parse(stored) : [];
    const index = patients.findIndex((p: PatientVisit) => p._id === editingPatient._id);
    if (index !== -1) {
      patients[index] = editingPatient;
      localStorage.setItem("patients", JSON.stringify(patients));
      setPatients(patients);
      updateStats(patients);
    }
    setEditingPatient(null);
  };

  const handleDeletePatient = async (id: string) => {
    if (confirm("Are you sure you want to delete this patient record?")) {
      try {
        const res = await fetch(`http://localhost:3001/api/patient-visits/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchData();
          return;
        }
      } catch (error) {
        console.log("Using localStorage fallback");
      }
      
      const stored = localStorage.getItem("patients");
      const patients = stored ? JSON.parse(stored) : [];
      const filtered = patients.filter((p: PatientVisit) => p._id !== id);
      localStorage.setItem("patients", JSON.stringify(filtered));
      setPatients(filtered);
      updateStats(filtered);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/patient-visits/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchData();
        return;
      }
    } catch (error) {
      console.log("Using localStorage fallback");
    }
    
    const stored = localStorage.getItem("patients");
    const patients = stored ? JSON.parse(stored) : [];
    const index = patients.findIndex((p: PatientVisit) => p._id === id);
    if (index !== -1) {
      patients[index].status = status;
      localStorage.setItem("patients", JSON.stringify(patients));
      setPatients(patients);
      updateStats(patients);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.disease.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">MediCare</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {localStorage.getItem("adminUser")}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">Rs{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Records Table */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Patient Records</CardTitle>
                <CardDescription>Secure patient data and payment records</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                      <Plus className="w-4 h-4" />
                      Add Patient
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Patient</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddPatient} className="space-y-4 py-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Patient Name *</label>
                          <Input
                            placeholder="Enter patient name"
                            value={newPatient.patientName}
                            onChange={(e) => setNewPatient({ ...newPatient, patientName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number *</label>
                          <Input
                            placeholder="Enter phone number"
                            value={newPatient.phone}
                            onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Date *</label>
                          <Input
                            type="date"
                            value={newPatient.date}
                            onChange={(e) => setNewPatient({ ...newPatient, date: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Disease *</label>
                          <Input
                            placeholder="Enter disease/symptoms"
                            value={newPatient.disease}
                            onChange={(e) => setNewPatient({ ...newPatient, disease: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Weight (kg)</label>
                          <Input
                            type="number"
                            placeholder="Weight"
                            value={newPatient.weight}
                            onChange={(e) => setNewPatient({ ...newPatient, weight: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Blood Group</label>
                          <select
                            className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                            value={newPatient.bloodGroup}
                            onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                          >
                            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Amount (Rs)</label>
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={newPatient.amount}
                            onChange={(e) => setNewPatient({ ...newPatient, amount: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Method</label>
                        <select
                          className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                          value={newPatient.paymentMethod}
                          onChange={(e) => setNewPatient({ ...newPatient, paymentMethod: e.target.value })}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="Insurance">Insurance</option>
                        </select>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          Save Patient
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No patients found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Disease</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient._id}>
                        <TableCell className="font-medium">{patient.patientName}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>{new Date(patient.date).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{patient.disease}</TableCell>
                        <TableCell><Badge variant="outline">{patient.bloodGroup}</Badge></TableCell>
                        <TableCell>{patient.weight} kg</TableCell>
                        <TableCell>{patient.paymentMethod}</TableCell>
                        <TableCell className="font-semibold">Rs{patient.amount || 0}</TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingPatient(patient)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {patient.status !== "completed" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(patient._id, "completed")}>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeletePatient(patient._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="bg-white mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Payment Summary</CardTitle>
            <CardDescription>Overview of all payments received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Cash Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs{patients.filter((p) => p.paymentMethod === "Cash").reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Card Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs{patients.filter((p) => p.paymentMethod === "Card").reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">UPI Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs{patients.filter((p) => p.paymentMethod === "UPI").reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Insurance</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs{patients.filter((p) => p.paymentMethod === "Insurance").reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit Patient Modal */}
      <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <form onSubmit={handleUpdatePatient} className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Patient Name</label>
                <Input
                  value={editingPatient.patientName}
                  onChange={(e) => setEditingPatient({ ...editingPatient, patientName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                <Input
                  value={editingPatient.phone}
                  onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Disease</label>
                <Input
                  value={editingPatient.disease}
                  onChange={(e) => setEditingPatient({ ...editingPatient, disease: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Weight</label>
                  <Input
                    type="number"
                    value={editingPatient.weight}
                    onChange={(e) => setEditingPatient({ ...editingPatient, weight: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Amount</label>
                  <Input
                    type="number"
                    value={editingPatient.amount}
                    onChange={(e) => setEditingPatient({ ...editingPatient, amount: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Update
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingPatient(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
