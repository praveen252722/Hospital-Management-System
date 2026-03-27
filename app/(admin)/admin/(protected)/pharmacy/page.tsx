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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, Pill, AlertTriangle, Package } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { fetchAPI, type Pharmacy, type PharmacyAlerts } from "@/lib/api";

interface PharmacyFormData {
  medicineName: string;
  quantity: string;
  expiryDate: string;
  price: string;
  supplier: string;
}

const initialFormData: PharmacyFormData = {
  medicineName: "",
  quantity: "",
  expiryDate: "",
  price: "",
  supplier: "",
};

export default function AdminPharmacyPage() {
  const { loading: authLoading } = useAuth();
  const [inventory, setInventory] = useState<Pharmacy[]>([]);
  const [alerts, setAlerts] = useState<PharmacyAlerts | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInventory, setFilteredInventory] = useState<Pharmacy[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pharmacy | null>(null);
  const [deletingItem, setDeletingItem] = useState<Pharmacy | null>(null);
  const [formData, setFormData] = useState<PharmacyFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  useEffect(() => {
    setFilteredInventory(inventory);
  }, [inventory]);

  async function loadData() {
    setLoading(true);
    try {
      const [inventoryData, alertsData] = await Promise.all([
        fetchAPI<Pharmacy[]>("/pharmacy"),
        fetchAPI<PharmacyAlerts>("/pharmacy/alerts"),
      ]);
      setInventory(inventoryData);
      setAlerts(alertsData);
    } catch (error) {
      toast.error("Failed to load pharmacy data");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    if (!searchTerm.trim()) {
      setFilteredInventory(inventory);
      return;
    }
    const filtered = inventory.filter(
      (item) =>
        item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(filtered);
  }

  function openAddDialog() {
    setEditingItem(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }

  function openEditDialog(item: Pharmacy) {
    setEditingItem(item);
    setFormData({
      medicineName: item.medicineName,
      quantity: item.quantity.toString(),
      expiryDate: item.expiryDate.split("T")[0],
      price: item.price.toString(),
      supplier: item.supplier || "",
    });
    setIsDialogOpen(true);
  }

  function openDeleteDialog(item: Pharmacy) {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      medicineName: formData.medicineName,
      quantity: parseInt(formData.quantity),
      expiryDate: formData.expiryDate,
      price: parseFloat(formData.price),
      supplier: formData.supplier || undefined,
    };

    try {
      if (editingItem) {
        await fetchAPI(`/pharmacy/${editingItem._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Medicine updated successfully");
      } else {
        await fetchAPI("/pharmacy", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Medicine added successfully");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error("Failed to save medicine");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingItem) return;
    setSubmitting(true);

    try {
      await fetchAPI(`/pharmacy/${deletingItem._id}`, {
        method: "DELETE",
      });
      toast.success("Medicine deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
      loadData();
    } catch (error) {
      toast.error("Failed to delete medicine");
    } finally {
      setSubmitting(false);
    }
  }

  function isLowStock(quantity: number) {
    return quantity < 10;
  }

  function isExpiringSoon(expiryDate: string) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(expiryDate) <= thirtyDaysFromNow;
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
            <Pill className="h-8 w-8 text-primary" />
            Pharmacy Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage medicine inventory and track stock levels
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Medicine
        </Button>
      </div>

      {/* Alert Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">In inventory</p>
          </CardContent>
        </Card>

        <Card className={alerts?.lowStock.length ? "border-destructive/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {alerts?.lowStock.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Need restocking</p>
          </CardContent>
        </Card>

        <Card className={alerts?.expiringSoon.length ? "border-chart-3/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expiring Soon
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">
              {alerts?.expiringSoon.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by medicine name or supplier..."
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
          <CardTitle>Inventory List</CardTitle>
          <CardDescription>
            Items with low stock or expiring soon are highlighted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No medicines found. Add a new medicine to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.medicineName}</TableCell>
                    <TableCell>
                      <span
                        className={
                          isLowStock(item.quantity)
                            ? "text-destructive font-semibold"
                            : ""
                        }
                      >
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          isExpiringSoon(item.expiryDate)
                            ? "text-chart-3 font-semibold"
                            : ""
                        }
                      >
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.supplier || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {isLowStock(item.quantity) && (
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                            Low Stock
                          </span>
                        )}
                        {isExpiringSoon(item.expiryDate) && (
                          <span className="text-xs bg-chart-3/20 text-chart-3 px-2 py-1 rounded">
                            Expiring
                          </span>
                        )}
                        {!isLowStock(item.quantity) && !isExpiringSoon(item.expiryDate) && (
                          <span className="text-xs bg-chart-5/20 text-chart-5 px-2 py-1 rounded">
                            OK
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(item)}
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
              {editingItem ? "Edit Medicine" : "Add Medicine"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the medicine details below."
                : "Fill in the details to add a new medicine."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="medicineName">Medicine Name *</Label>
                <Input
                  id="medicineName"
                  value={formData.medicineName}
                  onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingItem ? "Update" : "Add Medicine"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Medicine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingItem?.medicineName}? This action cannot be undone.
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
