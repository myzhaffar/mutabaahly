import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get user profile if session exists
  let userProfile = null;
  if (session?.user) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        // Don't set userProfile to null, let it remain null so we can handle it properly
      } else {
        userProfile = profile;
      }
    } catch (error) {
      // Handle profile fetch error silently
    }
  }
  
  // Define route patterns
  const protectedRoutes = [
    '/',
    '/dashboard',
    '/students', 
    '/student',
    '/profile',
    '/class',
    '/tests',
    '/api/delete-user'
  ];
  
  const teacherOnlyRoutes = [
    '/students',
    '/student',
    '/class',
    '/tests',
    '/api/delete-user'
  ];
  
  const parentOnlyRoutes = [
    '/student'
  ];
  
  const authRoutes = ['/auth'];
  
  const currentPath = req.nextUrl.pathname;
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    currentPath.startsWith(route)
  );
  
  const isTeacherOnlyRoute = teacherOnlyRoutes.some(route => 
    currentPath.startsWith(route)
  );
  
  const isParentOnlyRoute = parentOnlyRoutes.some(route => 
    currentPath.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    currentPath.startsWith(route)
  );
  

  
  // Redirect logic
  if (isProtectedRoute && !session) {
    // User not authenticated, redirect to auth
    return NextResponse.redirect(new URL('/auth', req.url));
  }
  
  // Allow access to select-role page for OAuth users
  // This page is only for OAuth users who need to select their role
  if (currentPath === '/select-role') {
    return res;
  }
  
  // Redirect authenticated users from root to dashboard
  if (session && currentPath === '/') {
    if (userProfile && userProfile.role) {
      // User has a role, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      // User has no role, redirect to dashboard (let client handle role selection)
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  if (isAuthRoute && session) {
    // User already authenticated, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  if (session && userProfile) {
    // Role-based access control
    if (isTeacherOnlyRoute && userProfile.role !== 'teacher') {
      // Non-teacher trying to access teacher-only route
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    if (isParentOnlyRoute && userProfile.role !== 'parent') {
      // Non-parent trying to access parent-only route
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // If user has no role, let them access the page (client will handle role selection)
    // Only OAuth users should be redirected to select-role, and that's handled client-side
  } else if (session && !userProfile) {
    // User is authenticated but profile is not loaded yet
    // Check if this is a protected route that requires a role
    if (isProtectedRoute && currentPath !== '/select-role') {
      // For protected routes, allow access and let client-side handle the profile loading
      // This prevents redirect loops when the profile is still being fetched
    } else if (currentPath === '/select-role') {
      // If user is on select-role page but profile is loading, allow them to stay there
    }
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 