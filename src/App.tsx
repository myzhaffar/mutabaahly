import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster as HotToaster } from 'react-hot-toast';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';
import TeacherTestManagement from '@/pages/TeacherTestManagement';
import ParentTestView from '@/pages/ParentTestView';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100">
                <Navigation />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute requiredRole="teacher">
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/tests/manage" element={
                    <ProtectedRoute requiredRole="teacher">
                      <TeacherTestManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/tests/view" element={
                    <ProtectedRoute requiredRole="parent">
                      <ParentTestView />
                    </ProtectedRoute>
                  } />
                </Routes>
                <Toaster />
                <Sonner />
                <HotToaster />
              </div>
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
