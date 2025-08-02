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
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    userProfile = profile;
  }
  
  // Define route patterns
  const protectedRoutes = [
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
  const publicRoutes = ['/', '/select-role'];
  
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
  
  const isPublicRoute = publicRoutes.some(route => 
    currentPath === route
  );
  
  // Redirect logic
  if (isProtectedRoute && !session) {
    // User not authenticated, redirect to auth
    return NextResponse.redirect(new URL('/auth', req.url));
  }
  
  if (isAuthRoute && session) {
    // User already authenticated, check their role and redirect accordingly
    if (userProfile && userProfile.role) {
      // User has a role, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      // User doesn't have a role, redirect to select-role
      return NextResponse.redirect(new URL('/select-role', req.url));
    }
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
    
    // If user has no role and not on select-role page, redirect to select-role
    if (!userProfile.role && !isPublicRoute && currentPath !== '/select-role') {
      return NextResponse.redirect(new URL('/select-role', req.url));
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