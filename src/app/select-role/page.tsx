"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SelectRolePage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    // If user already has a role, redirect away
    if (profile && (profile.role === "teacher" || profile.role === "parent")) {
      router.replace("/");
    }
    // If not logged in, redirect to auth
    if (!user) {
      router.replace("/auth");
    }
  }, [user, profile, router]);

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
    const { error } = await supabase
      .from("profiles")
      .update({ role: selectedRole })
      .eq("id", user.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to update role: " + error.message);
    } else {
      toast.success("Role updated successfully!");
      await refreshProfile();
      router.replace("/");
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