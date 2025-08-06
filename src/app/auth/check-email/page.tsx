"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function CheckEmailPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleResendEmail = async () => {
    try {
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('Confirmation email sent successfully! Please check your inbox.');
      } else {
        alert('Failed to send confirmation email. Please try again.');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Check Your Email</h2>
              
              <p className="text-gray-600 mb-4">
                We&apos;ve sent a confirmation email to:
              </p>
              
              <p className="text-gray-900 font-medium mb-6">
                {email}
              </p>
              
              <p className="text-gray-600 mb-6">
                Click the confirmation link in the email to verify your account and complete your registration.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleResendEmail}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold rounded-lg py-3"
                >
                  Resend Confirmation Email
                </Button>
                
                <Link href="/auth">
                  <Button 
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 font-semibold rounded-lg py-3"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Didn&apos;t receive the email?</strong>
                  <br />
                  • Check your spam folder
                  <br />
                  • Make sure you entered the correct email address
                  <br />
                  • Click &quot;Resend Confirmation Email&quot; above
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-teal-50 p-4">
        <div className="w-full max-w-md">
          <Card className="rounded-2xl shadow-xl border-0 bg-white/90 backdrop-blur">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Loading...</h2>
                <p className="text-gray-600">Please wait while we load the check email page...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <CheckEmailPageContent />
    </Suspense>
  );
} 