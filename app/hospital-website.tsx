"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  UserCheck,
  Phone,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CalendarDays,
  Activity,
  Droplet,
  Scale,
  CreditCard,
  Stethoscope,
  Bed,
  Shield,
  LogOut,
  Bell,
  FileText,
  X,
  User,
  ChevronDown,
  ChevronUp,
  Eye,
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

interface Appointment {
  _id: string;
  patientName: string;
  phone: string;
  doctorName: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  reason: string;
}

interface Stats {
  totalPatients: number;
  pending: number;
  inProgress: number;
  completed: number;
  totalRevenue: number;
}

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

const doctors = [
  "Dr. Priya Sharma (General Physician)",
  "Dr. Rajesh Kumar (Cardiologist)",
  "Dr. Ananya Singh (Dermatologist)",
  "Dr. Vikram Patel (Orthopedic)",
  "Dr. Meera Gupta (Pediatrician)",
  "Dr. Sanjay Verma (Neurologist)",
];

export default function HospitalDashboard() {
  const [patients, setPatients] = useState<PatientVisit[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalRevenue: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientVisit | null>(null);
  const [showAppointments, setShowAppointments] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [showInProgress, setShowInProgress] = useState(false);
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
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    phone: "",
    doctorName: "",
    date: "",
    time: "",
    reason: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/patient-visits");
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setPatients(data);
          updateStats(data);
        }
      }
    } catch (error) {
      console.log("API not available, using local storage");
    }
    // Fallback to localStorage for patients
    const stored = localStorage.getItem("patients");
    if (stored) {
      const data = JSON.parse(stored);
      setPatients(data);
      updateStats(data);
    }
    
    // Fetch appointments from localStorage
    const storedAppointments = localStorage.getItem("appointments");
    if (storedAppointments) {
      setAppointments(JSON.parse(storedAppointments));
    }
  };

  const saveToStorage = (data: PatientVisit[]) => {
    localStorage.setItem("patients", JSON.stringify(data));
  };

  const updateStats = (data: PatientVisit[]) => {
    setStats({
      totalPatients: data.length,
      pending: data.filter((p: PatientVisit) => p.status === "pending").length,
      inProgress: data.filter((p: PatientVisit) => p.status === "in-progress").length,
      completed: data.filter((p: PatientVisit) => p.status === "completed").length,
      totalRevenue: data.reduce((sum: number, p: PatientVisit) => sum + (p.amount || 0), 0),
    });
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const patientData = {
      _id: Date.now().toString(),
      ...newPatient,
      weight: Number(newPatient.weight),
      amount: Number(newPatient.amount),
      date: new Date(newPatient.date),
      status: "pending" as const,
    };
    
    try {
      const res = await fetch("http://localhost:3001/api/patient-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });
      if (res.ok) {
        fetchData();
        setShowPatientModal(false);
        resetForm();
        return;
      }
    } catch (error) {
      console.log("Using local storage");
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem("patients");
    const patients = stored ? JSON.parse(stored) : [];
    patients.unshift(patientData);
    saveToStorage(patients);
    setPatients(patients);
    updateStats(patients);
    setShowPatientModal(false);
    resetForm();
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    
    const updatedPatient = {
      ...editingPatient,
      weight: Number(editingPatient.weight),
      amount: Number(editingPatient.amount),
    };
    
    try {
      const res = await fetch(`http://localhost:3001/api/patient-visits/${editingPatient._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPatient),
      });
      if (res.ok) {
        setEditingPatient(null);
        fetchData();
        return;
      }
    } catch (error) {
      console.log("Using local storage");
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem("patients");
    const patients = stored ? JSON.parse(stored) : [];
    const index = patients.findIndex((p: PatientVisit) => p._id === editingPatient._id);
    if (index !== -1) {
      patients[index] = updatedPatient;
      saveToStorage(patients);
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
        console.log("Using local storage");
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem("patients");
      const patients = stored ? JSON.parse(stored) : [];
      const filtered = patients.filter((p: PatientVisit) => p._id !== id);
      saveToStorage(filtered);
      setPatients(filtered);
      updateStats(filtered);
    }
  };

  const markPatientStatus = async (id: string, status: string) => {
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
      console.log("Using local storage");
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem("patients");
    const patients = stored ? JSON.parse(stored) : [];
    const index = patients.findIndex((p: PatientVisit) => p._id === id);
    if (index !== -1) {
      patients[index].status = status;
      saveToStorage(patients);
      setPatients(patients);
      updateStats(patients);
    }
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const appointmentData: Appointment = {
      _id: Date.now().toString(),
      ...newAppointment,
      status: "scheduled",
    };
    
    const stored = localStorage.getItem("appointments");
    const appointments = stored ? JSON.parse(stored) : [];
    appointments.unshift(appointmentData);
    localStorage.setItem("appointments", JSON.stringify(appointments));
    setAppointments(appointments);
    setShowAppointmentModal(false);
    setNewAppointment({
      patientName: "",
      phone: "",
      doctorName: "",
      date: "",
      time: "",
      reason: "",
    });
  };

  const handleCancelAppointment = (id: string) => {
    const stored = localStorage.getItem("appointments");
    const appointments = stored ? JSON.parse(stored) : [];
    const index = appointments.findIndex((a: Appointment) => a._id === id);
    if (index !== -1) {
      appointments[index].status = "cancelled";
      localStorage.setItem("appointments", JSON.stringify(appointments));
      setAppointments([...appointments]);
    }
  };

  const handleCompleteAppointment = (id: string) => {
    const stored = localStorage.getItem("appointments");
    const appointments = stored ? JSON.parse(stored) : [];
    const index = appointments.findIndex((a: Appointment) => a._id === id);
    if (index !== -1) {
      appointments[index].status = "completed";
      localStorage.setItem("appointments", JSON.stringify(appointments));
      setAppointments([...appointments]);
    }
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

  const openEditModal = (patient: PatientVisit) => {
    setEditingPatient({ ...patient });
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.disease.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPatients = patients.filter((p) => p.status === "pending");
  const inProgressPatients = patients.filter((p) => p.status === "in-progress");
  const completedPatients = patients.filter((p) => p.status === "completed");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">In Progress</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">MediCare HMS</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Hospital Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="outline" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
                <Bell className="w-4 h-4" />
                {pendingPatients.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                    {pendingPatients.length}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/admin/login"}
                className="gap-1 sm:gap-2 px-2 sm:px-3"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Patients</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Pending</p>
                  <p className="text-xl sm:text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">In Progress</p>
                  <p className="text-xl sm:text-3xl font-bold text-orange-600">{stats.inProgress}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Completed</p>
                  <p className="text-xl sm:text-3xl font-bold text-green-600">{completedPatients.length}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button 
            onClick={() => setShowPatientModal(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Patient Entry</span>
            <span className="xs:hidden">Entry</span>
          </Button>
          <Button 
            onClick={() => setShowAppointmentModal(true)}
            className="bg-purple-600 hover:bg-purple-700 gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Doctor Appointment</span>
            <span className="xs:hidden">Appointment</span>
          </Button>
          <Button 
            onClick={() => markPatientStatus(pendingPatients[0]?._id, "in-progress")}
            disabled={pendingPatients.length === 0}
            variant="outline"
            className="gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
          >
            <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Start Next Patient</span>
            <span className="sm:hidden">Next Patient</span>
          </Button>
        </div>

        {/* Appointments Section - Collapsible */}
        <Card className="bg-white border-0 shadow-md mb-4 sm:mb-8">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3 sm:py-4"
            onClick={() => setShowAppointments(!showAppointments)}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-lg">Doctor Appointments</CardTitle>
                  <CardDescription className="hidden sm:block">Manage scheduled appointments</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-700 text-xs">{appointments.filter(a => a.status === "scheduled").length} scheduled</Badge>
                {showAppointments ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
              </div>
            </div>
          </CardHeader>
          {showAppointments && (
            <CardContent className="p-2 sm:p-4 md:p-6">
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4 sm:py-8">No appointments scheduled</p>
              ) : (
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Patient</TableHead>
                        <TableHead className="whitespace-nowrap hidden md:table-cell">Phone</TableHead>
                        <TableHead className="whitespace-nowrap hidden sm:table-cell">Doctor</TableHead>
                        <TableHead className="whitespace-nowrap hidden lg:table-cell">Date</TableHead>
                        <TableHead className="whitespace-nowrap hidden lg:table-cell">Time</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((apt) => (
                        <TableRow key={apt._id}>
                          <TableCell className="font-medium whitespace-nowrap">{apt.patientName}</TableCell>
                          <TableCell className="hidden md:table-cell">{apt.phone}</TableCell>
                          <TableCell className="hidden sm:table-cell max-w-[150px] truncate">{apt.doctorName}</TableCell>
                          <TableCell className="hidden lg:table-cell">{apt.date}</TableCell>
                          <TableCell className="hidden lg:table-cell">{apt.time}</TableCell>
                          <TableCell>
                            <Badge className={
                              apt.status === "completed" ? "bg-green-100 text-green-700" :
                              apt.status === "cancelled" ? "bg-red-100 text-red-700" :
                              "bg-purple-100 text-purple-700"
                            }>
                              {apt.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {apt.status === "scheduled" && (
                              <div className="flex gap-1 sm:gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleCompleteAppointment(apt._id)}
                                  className="bg-green-600 hover:bg-green-700 px-2 py-1 text-xs sm:text-sm"
                                >
                                  Complete
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleCancelAppointment(apt._id)}
                                  className="text-red-600 px-2 py-1 text-xs sm:text-sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Patient Tables by Status */}
        <div className="space-y-8">
          {/* Pending Patients - PA Queue - Collapsible */}
          <Card className="bg-white border-0 shadow-md">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors py-3 sm:py-4"
              onClick={() => setShowPending(!showPending)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-lg">Patient Requests - PA Queue</CardTitle>
                    <CardDescription className="hidden sm:block">Patients waiting to be called by PA</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 text-xs">{pendingPatients.length} pending</Badge>
                  {showPending ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                </div>
              </div>
            </CardHeader>
            {showPending && (
              <CardContent className="p-2 sm:p-4 md:p-6">
                {pendingPatients.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 sm:py-8">No pending patients</p>
                ) : (
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Patient</TableHead>
                          <TableHead className="whitespace-nowrap">Phone</TableHead>
                          <TableHead className="whitespace-nowrap hidden sm:table-cell">Disease</TableHead>
                          <TableHead className="whitespace-nowrap hidden md:table-cell">Blood Grp</TableHead>
                          <TableHead className="whitespace-nowrap hidden lg:table-cell">Payment</TableHead>
                          <TableHead className="whitespace-nowrap hidden lg:table-cell">Amount</TableHead>
                          <TableHead className="whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingPatients.map((patient) => (
                          <TableRow key={patient._id}>
                            <TableCell className="font-medium whitespace-nowrap">{patient.patientName}</TableCell>
                            <TableCell className="whitespace-nowrap">{patient.phone}</TableCell>
                            <TableCell className="hidden sm:table-cell max-w-[120px] truncate">{patient.disease}</TableCell>
                            <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-xs">{patient.bloodGroup}</Badge></TableCell>
                            <TableCell className="hidden lg:table-cell">{patient.paymentMethod}</TableCell>
                            <TableCell className="hidden lg:table-cell font-semibold">₹{patient.amount || 0}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => markPatientStatus(patient._id, "in-progress")}
                                  className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 text-xs sm:text-sm"
                                >
                                  Call
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditModal(patient)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
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
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* In Progress - Doctor Consultation - Collapsible */}
          <Card className="bg-white border-0 shadow-md">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors py-3 sm:py-4"
              onClick={() => setShowInProgress(!showInProgress)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-lg">In Progress - Doctor Consultation</CardTitle>
                    <CardDescription className="hidden sm:block">Patients currently being treated</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-700 text-xs">{inProgressPatients.length} in progress</Badge>
                  {showInProgress ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                </div>
              </div>
            </CardHeader>
            {showInProgress && (
              <CardContent className="p-2 sm:p-4 md:p-6">
                {inProgressPatients.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 sm:py-8">No patients in progress</p>
                ) : (
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Patient</TableHead>
                          <TableHead className="whitespace-nowrap">Phone</TableHead>
                          <TableHead className="whitespace-nowrap hidden sm:table-cell">Disease</TableHead>
                          <TableHead className="whitespace-nowrap hidden md:table-cell">Doctor</TableHead>
                          <TableHead className="whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inProgressPatients.map((patient) => (
                          <TableRow key={patient._id}>
                            <TableCell className="font-medium whitespace-nowrap">{patient.patientName}</TableCell>
                            <TableCell className="whitespace-nowrap">{patient.phone}</TableCell>
                            <TableCell className="hidden sm:table-cell max-w-[120px] truncate">{patient.disease}</TableCell>
                            <TableCell className="hidden md:table-cell max-w-[150px] truncate">{patient.doctorAssigned || "-"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => markPatientStatus(patient._id, "completed")}
                                  className="bg-green-600 hover:bg-green-700 px-2 py-1 text-xs sm:text-sm"
                                >
                                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditModal(patient)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
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
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Completed - Count Only */}
          <Card className="bg-white border-0 shadow-md">
            <CardHeader className="py-3 sm:py-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-lg">Completed</CardTitle>
                    <CardDescription className="hidden sm:block">Treated patients - completed today</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 text-xs">{completedPatients.length} completed</Badge>
                  <p className="text-xs sm:text-sm text-gray-500">Admin Panel</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>

      {/* Add Patient Modal */}
      <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Patient</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPatient} className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Patient Name *</label>
                <Input
                  placeholder="Enter patient name"
                  value={newPatient.patientName}
                  onChange={(e) => setNewPatient({ ...newPatient, patientName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Phone Number *</label>
                <Input
                  placeholder="Enter phone number"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Date *</label>
                <Input
                  type="date"
                  value={newPatient.date}
                  onChange={(e) => setNewPatient({ ...newPatient, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Disease *</label>
                <Input
                  placeholder="Enter disease/symptoms"
                  value={newPatient.disease}
                  onChange={(e) => setNewPatient({ ...newPatient, disease: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Weight (kg) *</label>
                <Input
                  type="number"
                  placeholder="Weight"
                  value={newPatient.weight}
                  onChange={(e) => setNewPatient({ ...newPatient, weight: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Blood Group *</label>
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
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Amount (₹)</label>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newPatient.amount}
                  onChange={(e) => setNewPatient({ ...newPatient, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Payment Method *</label>
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
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Doctor Assigned</label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  value={newPatient.doctorAssigned}
                  onChange={(e) => setNewPatient({ ...newPatient, doctorAssigned: e.target.value })}
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
                Save Patient
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowPatientModal(false)} className="text-sm sm:text-base">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <form onSubmit={handleUpdatePatient} className="space-y-3 sm:space-y-4 py-2 sm:py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Patient Name *</label>
                  <Input
                    value={editingPatient.patientName}
                    onChange={(e) => setEditingPatient({ ...editingPatient, patientName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Phone Number *</label>
                  <Input
                    value={editingPatient.phone}
                    onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Disease *</label>
                  <Input
                    value={editingPatient.disease}
                    onChange={(e) => setEditingPatient({ ...editingPatient, disease: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Blood Group *</label>
                  <select
                    className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                    value={editingPatient.bloodGroup}
                    onChange={(e) => setEditingPatient({ ...editingPatient, bloodGroup: e.target.value })}
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Weight (kg)</label>
                  <Input
                    type="number"
                    value={editingPatient.weight}
                    onChange={(e) => setEditingPatient({ ...editingPatient, weight: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Amount (₹)</label>
                  <Input
                    type="number"
                    value={editingPatient.amount}
                    onChange={(e) => setEditingPatient({ ...editingPatient, amount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Doctor Assigned</label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  value={editingPatient.doctorAssigned || ""}
                  onChange={(e) => setEditingPatient({ ...editingPatient, doctorAssigned: e.target.value })}
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
                  Update Patient
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingPatient(null)} className="text-sm sm:text-base">
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Appointment Modal */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Book Doctor Appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAppointment} className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Patient Name *</label>
                <Input
                  placeholder="Enter patient name"
                  value={newAppointment.patientName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Phone Number *</label>
                <Input
                  placeholder="Enter phone number"
                  value={newAppointment.phone}
                  onChange={(e) => setNewAppointment({ ...newAppointment, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Select Doctor *</label>
              <select
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                value={newAppointment.doctorName}
                onChange={(e) => setNewAppointment({ ...newAppointment, doctorName: e.target.value })}
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((doc) => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Date *</label>
                <Input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Time *</label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  required
                >
                  <option value="">Select time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Reason for Visit</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md text-sm min-h-[60px] sm:min-h-[80px]"
                placeholder="Enter reason for appointment..."
                value={newAppointment.reason}
                onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
              />
            </div>

            <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-sm sm:text-base">
                Book Appointment
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAppointmentModal(false)} className="text-sm sm:text-base">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
