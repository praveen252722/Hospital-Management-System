import { Sidebar } from "@/components/sidebar";
import { Toaster } from "sonner";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        <div className="min-h-screen">{children}</div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
