"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Session } from "@supabase/supabase-js";

export default function TestAuthPage() {
  const { user, session, profile, loading } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<Record<string, unknown> | null>(null);
  const [sessionData, setSessionData] = useState<Session | null>(null);

  useEffect(() => {
    // Get localStorage data
    const authToken = localStorage.getItem('sb-isyhakwwgdozgtlquzis-auth-token');
    setLocalStorageData(authToken ? JSON.parse(authToken) : null);

    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      setSessionData(data.session);
    });
  }, []);

  const clearLocalStorage = () => {
    localStorage.removeItem('sb-isyhakwwgdozgtlquzis-auth-token');
    window.location.reload();
  };

  const forceSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Debug</h1>
          <p className="text-gray-600">
            This page helps debug authentication and localStorage issues.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Auth Context State */}
          <Card>
            <CardHeader>
              <CardTitle>Auth Context State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Loading:</span>
                <Badge variant={loading ? "destructive" : "default"}>
                  {loading ? "True" : "False"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">User:</span>
                <Badge variant={user ? "default" : "secondary"}>
                  {user ? user.email : "None"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Session:</span>
                <Badge variant={session ? "default" : "secondary"}>
                  {session ? "Active" : "None"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Profile:</span>
                <Badge variant={profile ? "default" : "secondary"}>
                  {profile ? profile.role || "No Role" : "None"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* LocalStorage Data */}
          <Card>
            <CardHeader>
              <CardTitle>LocalStorage Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Auth Token:</span>
                <Badge variant={localStorageData ? "default" : "secondary"}>
                  {localStorageData ? "Present" : "None"}
                </Badge>
              </div>
              {localStorageData && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2">Token Data:</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(localStorageData, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Data */}
          <Card>
            <CardHeader>
              <CardTitle>Session Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Session:</span>
                <Badge variant={sessionData ? "default" : "secondary"}>
                  {sessionData ? "Active" : "None"}
                </Badge>
              </div>
              {sessionData && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold mb-2">Session Info:</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify({
                      user_id: sessionData.user?.id,
                      email: sessionData.user?.email,
                      email_confirmed: sessionData.user?.email_confirmed_at,
                      provider: (sessionData.user?.app_metadata as Record<string, unknown>)?.provider,
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={clearLocalStorage}
                variant="outline"
                className="w-full"
              >
                Clear LocalStorage
              </Button>
              <Button 
                onClick={forceSignOut}
                variant="destructive"
                className="w-full"
              >
                Force Sign Out
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Troubleshooting Guide */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Troubleshooting Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-600">If stuck in loading:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mt-2">
                  <li>Check if localStorage has auth token</li>
                  <li>Try clearing localStorage and reloading</li>
                  <li>Check browser console for errors</li>
                  <li>Verify Supabase connection</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-600">Expected behavior:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mt-2">
                  <li>Loading should be false after auth check</li>
                  <li>User should be set if token is valid</li>
                  <li>Profile should be fetched for authenticated users</li>
                  <li>No infinite loading loops</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 