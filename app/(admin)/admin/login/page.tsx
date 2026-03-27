"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Loader2, UserPlus } from "lucide-react";
import { fetchAPI, setAuthToken } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSetupMode) {
        // Create new admin account
        await fetchAPI<{ message: string }>("/auth/setup", {
          method: "POST",
          body: JSON.stringify({ email, password, name }),
        });
        toast.success("Admin account created! Please login.");
        setIsSetupMode(false);
        setName("");
      } else {
        // Login
        const data = await fetchAPI<{ token: string; admin: { name: string } }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        setAuthToken(data.token);
        toast.success(`Welcome back, ${data.admin.name}!`);
        router.push("/admin/dashboard");
      }
    } catch (error) {
      if (isSetupMode) {
        toast.error("Failed to create admin. An admin may already exist.");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {isSetupMode ? (
              <UserPlus className="h-8 w-8 text-primary" />
            ) : (
              <ShieldCheck className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isSetupMode ? "Create Admin Account" : "Admin Login"}
          </CardTitle>
          <CardDescription>
            {isSetupMode 
              ? "Set up your first admin account to get started"
              : "Enter your credentials to access the admin panel"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSetupMode && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSetupMode ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                isSetupMode ? "Create Admin Account" : "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-6 space-y-2 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSetupMode(!isSetupMode);
                setName("");
              }}
              className="text-sm text-primary hover:underline"
            >
              {isSetupMode 
                ? "Already have an account? Sign in" 
                : "First time? Create admin account"
              }
            </button>
            <p className="text-sm text-muted-foreground">
              Not an admin?{" "}
              <a href="/dashboard" className="text-primary hover:underline">
                Go to User Panel
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
