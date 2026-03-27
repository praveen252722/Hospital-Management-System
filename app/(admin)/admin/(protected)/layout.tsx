import { AdminSidebar } from "@/components/admin-sidebar";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="pl-64">
          <div className="min-h-screen">{children}</div>
        </main>
        <Toaster position="top-right" richColors />
      </div>
    </AuthProvider>
  );
}
