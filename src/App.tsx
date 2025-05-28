import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { QueryClient } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import Students from '@/pages/Students';
import Profile from '@/pages/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';
import TeacherTestManagement from '@/pages/TeacherTestManagement';
import ParentTestView from '@/pages/ParentTestView';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <QueryClient>
            <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-islamic-100">
              <Navigation />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/students" element={
                  <ProtectedRoute requiredRole="teacher">
                    <Students />
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
            </div>
          </QueryClient>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
