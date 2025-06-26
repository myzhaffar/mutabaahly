import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Menu,
  X,
  Home,
  BookOpen,
  UserCircle,
  LogOut,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ParentNavbar = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/tests/view', label: 'Test Results', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || 
      (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <nav className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="font-sf-pro font-semibold text-base bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent hidden sm:block">
                  Mutabaahly
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`
                    flex items-center gap-2 text-sm font-medium transition-colors
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-500 hover:bg-clip-text hover:text-transparent'
                    }
                  `}
                >
                  <item.icon className={`h-4 w-4 ${
                    isActive(item.href)
                      ? 'text-teal-500'
                      : 'text-gray-600 group-hover:text-teal-500'
                  }`} />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Menu - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-teal-700">
                        {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
                      {profile?.full_name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-teal-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>
      </header>

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t shadow-lg">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isActive(item.href)
                  ? 'text-teal-600'
                  : 'text-gray-400 hover:text-teal-500'
              }`}
            >
              <item.icon className={`h-6 w-6 mb-0.5 ${isActive(item.href) ? 'text-teal-600' : 'text-gray-400'}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default ParentNavbar; 