"use client";

import Link from 'next/link';
import { Library, User, LogOut, Menu, Search, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCatalogify } from '@/hooks/use-catalogify';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const { currentUser, logout } = useCatalogify();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <Library className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-bold tracking-tight text-primary">BiblioHub</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/books" className="transition-colors hover:text-primary">Catalog</Link>
            {currentUser?.role === 'admin' && (
              <Link href="/admin" className="transition-colors hover:text-primary">Admin Panel</Link>
            )}
            {currentUser?.role === 'user' && (
              <Link href="/profile" className="transition-colors hover:text-primary">My Borrowings</Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/books">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={currentUser.role === 'admin' ? "/admin" : "/profile"}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">Login</Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Join BiblioHub</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
