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
    if (profile && profile.role) {
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
        <Card className="rounded-2xl shadow-xl border-0">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Select Your Role</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-4">
                <label className={`border rounded-lg p-4 cursor-pointer flex items-center gap-3 ${selectedRole === "teacher" ? "border-emerald-500 bg-emerald-50" : "border-gray-200"}`}> 
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={selectedRole === "teacher"}
                    onChange={() => setSelectedRole("teacher")}
                    className="accent-emerald-500"
                  />
                  <span className="font-medium">Teacher / Mentor</span>
                </label>
                <label className={`border rounded-lg p-4 cursor-pointer flex items-center gap-3 ${selectedRole === "parent" ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}> 
                  <input
                    type="radio"
                    name="role"
                    value="parent"
                    checked={selectedRole === "parent"}
                    onChange={() => setSelectedRole("parent")}
                    className="accent-orange-500"
                  />
                  <span className="font-medium">Parent</span>
                </label>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 