'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import '@/i18n';

export function Sidebar({ className }: { className?: string }) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    return (
      <div className="flex gap-2 items-center mt-2 mb-4">
        <button
          onClick={() => i18n.changeLanguage('en')}
          className={i18n.language === 'en' ? 'font-bold underline' : 'text-gray-600'}
        >
          EN
        </button>
        <span>|</span>
        <button
          onClick={() => i18n.changeLanguage('id')}
          className={i18n.language === 'id' ? 'font-bold underline' : 'text-gray-600'}
        >
          ID
        </button>
      </div>
    );
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "Students",
      icon: <User className="h-5 w-5" />,
      href: "/students",
    },
    {
      title: "Progress",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/progress",
    },
    {
      title: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/messages",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
    },
  ];

  return (
    <>
      <div>SIDEBAR TEST</div>
      
      {/* Backdrop */}
      <div 
        className={`
          lg:hidden fixed inset-0 bg-black z-40 transition-all duration-500 ease-out
          ${isOpen 
            ? 'bg-opacity-50 pointer-events-auto' 
            : 'bg-opacity-0 pointer-events-none'
          }
        `}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-all duration-500 ease-out lg:translate-x-0 shadow-lg",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex flex-col border-b px-6 pt-4 pb-2">
            <Link href="/" className="font-bold text-xl mb-2">
              Mutabaahly
            </Link>
            <div>LANGSWITCH TEST</div>
            <LanguageSwitcher />
          </div>
          <div className="flex-1 overflow-auto py-4">
            <div className="px-4 space-y-4">
              <div className="flex items-center space-x-4 p-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{profile?.full_name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{profile?.role}</span>
                </div>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ease-out transform hover:scale-105",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground scale-105 shadow-md"
                        : "hover:bg-muted hover:shadow-sm"
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 transition-all duration-300 ease-out hover:scale-105 transform"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 