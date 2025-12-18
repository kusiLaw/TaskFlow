'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { UserPlus, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { organizationsApi } from '@/lib/api/organizations';
import { useOrganizations } from '@/lib/hooks/useOrganizations';

export function InviteMemberDialog() {
  const { currentOrganization } = useOrganizations();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;

    setError('');
    setLoading(true);

    try {
      const response = await organizationsApi.invite(
        currentOrganization.id,
        email,
        role
      );
      setInviteUrl(response.invite_url);
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(
        typeof errorData?.error === 'string'
          ? errorData.error
          : 'Failed to send invitation'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setRole('member');
    setError('');
    setInviteUrl('');
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Invite to {currentOrganization?.name}</DialogTitle>
        </DialogHeader>

        {!inviteUrl ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {role === 'admin'
                  ? 'Admins can manage members and organization settings'
                  : 'Members can view and edit projects they have access to'}
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !email}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending...</>
                ) : (
                  'Send Invitation'
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* Success state */
          <div className="mt-2 space-y-4">
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Invitation sent to {email}!
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-500">
                Or share this link directly
              </Label>
              <div className="flex space-x-2">
                <Input
                  value={inviteUrl}
                  readOnly
                  className="text-xs text-gray-600 bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setInviteUrl('');
                setEmail('');
              }}>
                Invite Another
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}