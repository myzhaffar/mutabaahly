"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { toast } from "sonner";

export default function SelectRolePage() {
  const { user, profile, updateUserRole } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    // If not logged in, redirect to auth
    if (!user && !loading) {
      router.replace("/auth");
      return;
    }
    
    // If user already has a role, redirect to dashboard
    if (profile && (profile.role === "teacher" || profile.role === "parent")) {
      router.replace("/dashboard");
      return;
    }
    
    // If user is not an OAuth user (email signup), redirect to dashboard
    // OAuth users have provider in app_metadata, email users don't
    if (user && !user.app_metadata.provider) {
      router.replace("/dashboard");
      return;
    }
  }, [user, profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select a role.");
      return;
    }
    if (!user) {
      toast.error("User not found. Please log in again.");
      router.replace("/auth");
      return;
    }
    
    setLoading(true);
    
    try {
      // Add a timeout to prevent indefinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Role update timeout after 15 seconds')), 15000);
      });
      
      const roleUpdatePromise = updateUserRole(selectedRole as 'teacher' | 'parent');
      
      // Race between timeout and role update
      const { error } = await Promise.race([roleUpdatePromise, timeoutPromise]) as { error: string | Error | null };
      
      if (error) {
        const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error';
        toast.error("Failed to update role: " + errorMessage);
        
        // If it's a timeout, offer manual redirect
        if (typeof error === 'string' ? error.includes('timeout') : error.message?.includes('timeout')) {
          toast.error("Role update timed out. You can try refreshing the page or contact support.");
        }
      } else {
        toast.success("Role updated successfully!");
        // Add a small delay to ensure state propagation
        setTimeout(() => {
          router.replace("/dashboard");
        }, 100);
      }
    } catch (error) {
      // Check if it's a timeout error
      if (error instanceof Error && error.message.includes('timeout')) {
        toast.error("Role update timed out. You can try refreshing the page or contact support.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-emerald-700">Select Your Role</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-4">
                <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all duration-200 font-medium text-lg shadow-sm
                  ${selectedRole === "teacher"
                    ? "border-emerald-500 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700"
                    : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={selectedRole === "teacher"}
                    onChange={() => setSelectedRole("teacher")}
                    className="accent-emerald-500"
                  />
                  <span>Teacher / Mentor</span>
                </label>
                <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-3 transition-all duration-200 font-medium text-lg shadow-sm
                  ${selectedRole === "parent"
                    ? "border-orange-500 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700"
                    : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50"}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="parent"
                    checked={selectedRole === "parent"}
                    onChange={() => setSelectedRole("parent")}
                    className="accent-orange-500"
                  />
                  <span>Parent</span>
                </label>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-lg font-semibold rounded-lg py-3 flex items-center justify-center gap-2 hover:opacity-90" disabled={loading}>
                {loading ? "Saving..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 