'use client';

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { useRouter } from 'next/navigation';
import { Menu, Home, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { InvitesMenu } from "./invites-menu";

export function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const navigateHome = () => {
    router.push('/home');
  };

  const navigateSettings = () => {
    router.push('/settings');
  };

  return (
    <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 transition-none">
      <div className="container flex h-14 max-w-[100vw] items-center justify-between px-4">
        <div className="w-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={navigateHome}>
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={navigateSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-none">
          <Link href="/home" className="font-bold text-xl">
            Grouper
          </Link>
        </div>

        <div className="w-20 flex justify-end items-center gap-2">
          <InvitesMenu />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
} 