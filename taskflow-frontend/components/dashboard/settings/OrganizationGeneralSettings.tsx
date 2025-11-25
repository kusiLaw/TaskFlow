'use client';

import { useState } from 'react';
import { Organization } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganizations } from '@/lib/hooks/useOrganizations';

interface OrganizationGeneralSettingsProps {
  organization: Organization;
}

export function OrganizationGeneralSettings({ organization }: OrganizationGeneralSettingsProps) {
  const [name, setName] = useState(organization.name);
  const [description, setDescription] = useState(organization.description || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { updateOrganization } = useOrganizations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await updateOrganization(organization.id, { name, description });

    if (result.success) {
      setMessage({ type: 'success', text: 'Organization updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error?.name?.[0] || 'Failed to update organization' });
    }

    setLoading(false);
  };

  const canEdit = organization.user_role === 'owner' || organization.user_role === 'admin';

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Update your organization's basic information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message.text && (
            <div
              className={`rounded-md p-3 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={organization.slug} disabled />
            <p className="text-sm text-gray-500">
              The slug cannot be changed after creation.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canEdit}
              rows={4}
            />
          </div>

          {canEdit && (
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}