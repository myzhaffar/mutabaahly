"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();


  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (token_hash && type === 'signup') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'signup',
          });

          if (error) {
            console.error('Email confirmation error:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to confirm email. Please try again.');
          } else {
            setStatus('success');
            setMessage('Email confirmed successfully! You can now sign in.');
          }
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link.');
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleResendEmail = async () => {
    setStatus('loading');
    setMessage('Resending confirmation email...');
    
    // Note: This would require the user to enter their email again
    // For now, we'll redirect them to the auth page
    router.push('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-8">
            <div className="text-center">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-12 w-12 text-teal-500 animate-spin mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Confirming Email</h2>
                  <p className="text-gray-600">Please wait while we confirm your email address...</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Email Confirmed!</h2>
                  <p className="text-gray-600 mb-6">{message}</p>
                  <Button 
                    onClick={handleSignIn}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold rounded-lg py-3"
                  >
                    Sign In
                  </Button>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Confirmation Failed</h2>
                  <p className="text-gray-600 mb-6">{message}</p>
                  <div className="space-y-3">
                    <Button 
                      onClick={handleResendEmail}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold rounded-lg py-3"
                    >
                      Try Again
                    </Button>
                    <Button 
                      onClick={handleSignIn}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 font-semibold rounded-lg py-3"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 