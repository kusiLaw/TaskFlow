'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useOrganizations } from '@/lib/hooks/useOrganizations';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, LogOut, Settings, User, FolderKanban } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';
import { OrganizationSwitcher } from './OrganizationSwitcher';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { currentOrganization } = useOrganizations();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">TaskFlow</span>
          </Link>

          <OrganizationSwitcher />

          {currentOrganization && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/dashboard/projects">
                <Button variant="ghost" size="sm">
                  <FolderKanban className="h-4 w-4 mr-2" />
                  Projects
                </Button>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {currentOrganization && (
            <Link href={`/dashboard/organizations/${currentOrganization.id}/settings`}>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={user?.avatar} alt={user?.full_name} />
                  <AvatarFallback>{getInitials(user?.full_name || '')}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}