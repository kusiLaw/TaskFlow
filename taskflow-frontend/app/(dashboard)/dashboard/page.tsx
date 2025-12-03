'use client';

import { useOrganizations } from '@/lib/hooks/useOrganizations';
import { OrganizationCard } from '@/components/dashboard/OrganizationCard';
import { CreateOrganizationDialog } from '@/components/dashboard/CreateOrganizationDialog';
import { Building2 } from 'lucide-react';

export default function DashboardPage() {
  const { organizations, currentOrganization, switchOrganization } = useOrganizations();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-gray-600 mt-1">
            Select an organization to get started or create a new one.
          </p>
        </div>
        <CreateOrganizationDialog />
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No organizations yet
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first organization.
          </p>
          <CreateOrganizationDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* {organizations.map((org) => (
            <OrganizationCard
              key={org.id}
              organization={org}
              onSelect={() => switchOrganization(org)}
              isActive={currentOrganization?.id === org.id}
            />
          ))} */}
        </div>
      )}
    </div>
  );
}