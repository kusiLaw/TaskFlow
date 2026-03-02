import { Organization } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Crown } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface OrganizationCardProps {
  organization: Organization;
  onSelect: () => void;
  isActive: boolean;
}

export function OrganizationCard({ organization, onSelect, isActive }: OrganizationCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isActive ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{organization.name}</CardTitle>
              <CardDescription>{organization.slug}</CardDescription>
            </div>
          </div>
          {isActive && (
            <Badge variant="default">Active</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          {organization.description || 'No description'}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{organization.member_count || 0} members</span>
            </div>
            {organization.user_role === 'owner' && (
              <div className="flex items-center space-x-1">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span>Owner</span>
              </div>
            )}
          </div>
          <span>{formatDate(organization.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}