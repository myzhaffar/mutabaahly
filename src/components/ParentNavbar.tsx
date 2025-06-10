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
    { href: '/tests/view', label: 'Hasil Tes', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || 
      (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-islamic-600 to-accent-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="font-sf-pro font-semibold text-base text-islamic-700 hidden sm:block">
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
                    ? 'text-islamic-900'
                    : 'text-islamic-600 hover:text-islamic-900'
                  }
                `}
              >
                <item.icon className="h-4 w-4" />
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
                    <AvatarFallback className="bg-islamic-100 text-islamic-700">
                      {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-islamic-700">
                    {profile?.full_name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-islamic-500" />
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-islamic-700 hover:bg-islamic-50 rounded-lg"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium
                    ${isActive(item.href)
                      ? 'bg-islamic-50 text-islamic-900'
                      : 'text-islamic-600 hover:bg-islamic-50 hover:text-islamic-900'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile User Profile */}
              <div className="border-t mt-2 pt-4 px-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-islamic-100 text-islamic-700">
                      {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-islamic-900">
                      {profile?.full_name}
                    </p>
                    <p className="text-xs text-islamic-500">Parent</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default ParentNavbar; 