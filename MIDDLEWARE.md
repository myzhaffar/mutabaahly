# Authentication Middleware

This app now uses Next.js middleware for server-side authentication and route protection.

## How it Works

The middleware (`middleware.ts`) runs on every request and:

1. **Checks authentication status** using Supabase session
2. **Validates user roles** from the profiles table
3. **Redirects users** based on their authentication and role status
4. **Protects routes** before they are rendered

## Route Protection

### Protected Routes (require authentication)
- `/dashboard`
- `/students`
- `/student`
- `/profile`
- `/class`
- `/tests`
- `/api/delete-user`

### Teacher-Only Routes
- `/students`
- `/student`
- `/class`
- `/tests`
- `/api/delete-user`

### Parent-Only Routes
- `/student` (for viewing their children's data)

### Public Routes
- `/` (homepage)
- `/auth` (login/signup)
- `/select-role` (role selection)

## Authentication Flow

1. **Unauthenticated user** → redirected to `/auth`
2. **Authenticated user without role** → redirected to `/select-role`
3. **Teacher accessing parent-only route** → redirected to `/dashboard`
4. **Parent accessing teacher-only route** → redirected to `/dashboard`
5. **Authenticated user on auth page** → redirected to `/dashboard`

## Benefits

- ✅ **Server-side protection** - routes are protected before rendering
- ✅ **No flash of unauthorized content** - better UX
- ✅ **Improved security** - API routes are also protected
- ✅ **Better SEO** - search engines won't access protected routes
- ✅ **Centralized auth logic** - easier to maintain

## Components Updated

The following components have been simplified since middleware handles most auth logic:

- `ProtectedRoute.tsx` - now only handles role-specific UI checks
- `TeacherLayout.tsx` - removed redundant auth redirects
- `ParentLayout.tsx` - removed redundant auth redirects

## Environment Variables Required

Make sure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

## Testing

To test the middleware:

1. Try accessing `/dashboard` without being logged in → should redirect to `/auth`
2. Try accessing `/students` as a parent → should redirect to `/dashboard`
3. Try accessing `/auth` while logged in → should redirect to `/dashboard`
4. Try accessing `/select-role` without a role → should stay on the page 