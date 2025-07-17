'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/useAuth';
import { useRouter } from 'next/navigation';

import { useToast } from '@/hooks/use-toast';
import { Home, Mail, Lock, Eye, User } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import Image from 'next/image';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn, signUp, user } = useAuth();

  const { toast } = useToast();
  const router = useRouter();

  const allowedRoles = ['teacher', 'parent'];

  const quotes = [
    "Stay connect with Al Qur'an",
    "The best among you are those who learn the Qur'an and teach it.",
    "Let the Qur'an be your companion every day.",
    "Knowledge is light, and the Qur'an is its source."
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate role selection
    if (!isLogin && !allowedRoles.includes(role)) {
      toast({
        title: 'Role Required',
        description: 'Please select your role (Teacher or Parent) to continue.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Logged in successfully!",
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName, role as 'teacher' | 'parent');
        if (error) {
          toast({
            title: "Sign Up Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Account created successfully! Please check your email to verify your account.",
          });
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center mb-4">
                <span className="text-white text-3xl font-bold">ق</span>
              </div>
              <div className="text-gray-500 text-base font-medium text-center mb-2 transition-opacity duration-700" key={quoteIndex}>
                {quotes[quoteIndex]}
              </div>
            </div>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-3 font-medium text-gray-700 hover:bg-gray-50 transition mb-6"
              onClick={handleGoogleLogin}
            >
              <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} className="h-5 w-5" />
              Continue with Google
            </button>
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="mx-3 text-gray-400 text-sm">Or continue with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              { !isLogin && (
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail className="h-5 w-5" /></span>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock className="h-5 w-5" /></span>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
              { !isLogin && (
                <div>
                  <Label htmlFor="role">Role</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><User className="h-5 w-5" /></span>
                    <Select value={role} onValueChange={v => {
                      if (allowedRoles.includes(v)) setRole(v);
                    }}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher/Mentor</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <Button 
                type="submit" 
                className={`w-full text-white text-lg font-semibold rounded-lg py-3 flex items-center justify-center gap-2
                  ${isLogin ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90' : 'bg-gradient-to-r from-orange-400 to-orange-600 hover:opacity-90'}`}
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? (<><span>Sign In</span></>) : (<><span>Sign Up</span></>))}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
            <div className="mt-8">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-gray-700 border-gray-300"
                onClick={() => router.push('/')}
              >
                <Home className="h-5 w-5 mr-1" /> Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
