"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  AlertTriangle,
  Pill,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchAPI,
  type AppointmentStats,
  type Patient,
  type BillingSummary,
  type PharmacyAlerts,
} from "@/lib/api";

export default function AdminDashboardPage() {
  const { admin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [pharmacyAlerts, setPharmacyAlerts] = useState<PharmacyAlerts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsData = await fetchAPI<{
          appointmentStats: AppointmentStats;
          totalPatients: number;
          billingSummary: BillingSummary;
          pharmacyAlerts: PharmacyAlerts;
        }>("/stats");

        setStats(statsData.appointmentStats);
        setTotalPatients(statsData.totalPatients);
        setBillingSummary(statsData.billingSummary);
        setPharmacyAlerts(statsData.pharmacyAlerts);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {admin?.name}. Here is your hospital overview.
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Patients
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Appointments
            </CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scheduled
            </CardTitle>
            <Clock className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.scheduled || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.completed || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial & Inventory Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-chart-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${billingSummary?.totalRevenue.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From paid bills</p>
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
            <div className="text-3xl font-bold">
              ${billingSummary?.pendingPayments.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {billingSummary?.pendingRecords || 0} pending bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Items
            </CardTitle>
            <Pill className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {pharmacyAlerts?.lowStock.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expiring Soon
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {pharmacyAlerts?.expiringSoon.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-destructive" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Medicines that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {!pharmacyAlerts?.lowStock.length ? (
              <p className="text-sm text-muted-foreground">No low stock items</p>
            ) : (
              <div className="space-y-3">
                {pharmacyAlerts.lowStock.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                  >
                    <div>
                      <p className="font-medium">{item.medicineName}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                      Low Stock
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-chart-3" />
              Expiring Soon
            </CardTitle>
            <CardDescription>Medicines expiring within 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {!pharmacyAlerts?.expiringSoon.length ? (
              <p className="text-sm text-muted-foreground">No items expiring soon</p>
            ) : (
              <div className="space-y-3">
                {pharmacyAlerts.expiringSoon.slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-lg border border-chart-3/20 bg-chart-3/5 p-3"
                  >
                    <div>
                      <p className="font-medium">{item.medicineName}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs bg-chart-3/20 text-chart-3 px-2 py-1 rounded">
                      Expiring
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
