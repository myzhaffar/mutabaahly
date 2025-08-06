import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      'https://isyhakwwgdozgtlquzis.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzeWhha3d3Z2Rvemd0bHF1emlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NTY3NzcsImV4cCI6MjA2MjUzMjc3N30.-2Ya944q8mgJzRAuhMpRAWgxWVmt2yc3CqM0jjgFuuY',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Ignore if called from Server Component
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/auth?error=Authentication failed', requestUrl.origin));
    }

    if (data.user) {
      // Check if user has a role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile && profile.role) {
        // User has a role, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
      } else {
        // User doesn't have a role, redirect to select-role
        return NextResponse.redirect(new URL('/select-role', requestUrl.origin));
      }
    }
  }

  return NextResponse.redirect(new URL('/auth', requestUrl.origin));
} 