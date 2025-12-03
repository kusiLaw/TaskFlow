'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { organizationsApi } from '@/api/organizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/invite/${params.token}`);
      return;
    }

    acceptInvitation();
  }, [isAuthenticated]);

  const acceptInvitation = async () => {
    try {
      const organization = await organizationsApi.acceptInvitation(params.token);
      setStatus('success');
      setMessage(`You've successfully joined ${organization.name}!`);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(
        error.response?.data?.error || 
        'This invitation is invalid or has expired.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your invitation...'}
            {status === 'success' && 'Invitation Accepted'}
            {status === 'error' && 'Invitation Error'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            )}
            
            <p className="text-gray-700 mb-6">{message}</p>

            {status === 'error' && (
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}