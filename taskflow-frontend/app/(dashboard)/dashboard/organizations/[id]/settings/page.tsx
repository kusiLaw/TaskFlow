'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Organization } from '@/types';
import { organizationsApi } from '@/api/organizations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationGeneralSettings } from '@/components/dashboard/settings/OrganizationGeneralSettings';
import { MembersList } from '@/components/dashboard/settings/MembersList';
import { InviteMemberDialog } from '@/components/dashboard/settings/InviteMemberDialog';

export default function OrganizationSettingsPage() {
  const params = useParams();
  const orgId = params.id as string;
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganization();
  }, [orgId]);

  const loadOrganization = async () => {
    try {
      const data = await organizationsApi.get(orgId);
      setOrganization(data);
    } catch (error) {
      console.error('Failed to load organization:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>;
  }

  if (!organization) {
    return <div className="container mx-auto py-8 px-4">Organization not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Organization Settings</h1>
        <p className="text-gray-600">{organization.name}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <OrganizationGeneralSettings organization={organization} />
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="flex justify-end">
            <InviteMemberDialog
              organizationId={organization.id}
              onInviteSent={() => window.location.reload()}
            />
          </div>
          <MembersList
            organizationId={organization.id}
            currentUserRole={organization.user_role || 'member'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}