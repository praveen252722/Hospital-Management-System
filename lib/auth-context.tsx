"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth, getAuthToken, removeAuthToken, type Admin } from "@/lib/api";

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function verifyAuth() {
      const token = getAuthToken();
      
      if (!token) {
        setLoading(false);
        router.push("/admin/login");
        return;
      }

      try {
        const data = await fetchWithAuth<{ admin: Admin }>("/auth/verify");
        setAdmin(data.admin);
      } catch (error) {
        removeAuthToken();
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, [router]);

  function logout() {
    removeAuthToken();
    setAdmin(null);
    router.push("/admin/login");
  }

  return (
    <AuthContext.Provider value={{ admin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
