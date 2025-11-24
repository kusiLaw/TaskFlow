'use client';

import { useOrganizations } from '@/lib/hooks/useOrganizations';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { CreateOrganizationDialog } from '@/components/dashboard/CreateOrganizationDialog';
import { useState } from 'react';

export function OrganizationSwitcher() {
  const { organizations, currentOrganization, switchOrganization } = useOrganizations();
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-[200px] justify-between"
          >
            <div className="flex items-center space-x-2 truncate">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {currentOrganization ? getInitials(currentOrganization.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {currentOrganization?.name || 'Select organization'}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]" align="start">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => {
                switchOrganization(org);
                router.push('/dashboard');
              }}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2 truncate">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {getInitials(org.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{org.name}</span>
                </div>
                {currentOrganization?.id === org.id && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard')}>
            <Building2 className="mr-2 h-4 w-4" />
            View All
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {createDialogOpen && (
        <CreateOrganizationDialog />
      )}
    </>
  );
}