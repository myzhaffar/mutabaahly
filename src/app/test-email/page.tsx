"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TestEmailPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ data: unknown; error: unknown } | null>(null);

  const testEmailSignup = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: "testpassword123",
        options: {
          data: {
            full_name: "Test User",
            role: "teacher",
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      setResult({ data, error });
      
      if (error) {
        toast.error(`Signup error: ${error.message}`);
      } else {
        toast.success("Test signup completed! Check the result below.");
      }
    } catch (error) {
      console.error("Test signup error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const testEmailReset = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm`,
      });

      setResult({ data, error });
      
      if (error) {
        toast.error(`Password reset error: ${error.message}`);
      } else {
        toast.success("Password reset email sent! Check the result below.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Configuration Test</h1>
          <p className="text-gray-600">
            This page helps test and debug email configuration issues with Supabase.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Test Signup */}
          <Card>
            <CardHeader>
              <CardTitle>Test Email Signup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="signup-email">Email Address</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <Button 
                onClick={testEmailSignup} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Testing..." : "Test Signup"}
              </Button>
            </CardContent>
          </Card>

          {/* Test Password Reset */}
          <Card>
            <CardHeader>
              <CardTitle>Test Password Reset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <Button 
                onClick={testEmailReset} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? "Testing..." : "Test Password Reset"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Response:</h4>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Troubleshooting Guide */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Troubleshooting Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-600">Common Issues:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mt-2">
                  <li>Email provider not configured in Supabase Dashboard</li>
                  <li>Email templates not set up</li>
                  <li>Domain not verified in Supabase</li>
                  <li>Environment variables not set correctly</li>
                  <li>Email service provider issues</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-600">To Fix:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mt-2">
                  <li>Go to Supabase Dashboard → Settings → Auth → Email Templates</li>
                  <li>Configure SMTP settings or use Supabase&apos;s email service</li>
                  <li>Verify your domain in Supabase</li>
                  <li>Check environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY</li>
                  <li>Test with a different email address</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 