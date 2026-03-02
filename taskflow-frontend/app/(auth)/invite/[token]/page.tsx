'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, CheckCircle, XCircle, Loader2, Users } from 'lucide-react';
import Link from 'next/link';

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  organization: { id: string; name: string };
  invited_by: { name: string; email: string };
  expires_at: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { user, isAuthenticated, login, register } = useAuth();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Auth form state
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Load invitation details
  useEffect(() => {
    loadInvitation();
  }, [token]);

  // Auto-accept if user is already logged in
  useEffect(() => {
    if (isAuthenticated && user && invitation && !accepting && !accepted) {
      acceptInvitation();
    }
  }, [isAuthenticated, user, invitation]);

  const loadInvitation = async () => {
    try {
      const response = await apiClient.get(`/invitations/${token}/`);
      setInvitation(response.data);
      setEmail(response.data.email);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'This invitation link is invalid or has expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    setAccepting(true);
    try {
      await apiClient.post(`/invitations/${token}/accept/`);
      setAccepted(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept invitation.');
      setAccepting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setAuthError(result.error || 'Login failed');
        setAuthLoading(false);
      }
      // Auto-accept happens via useEffect
    } catch {
      setAuthError('An error occurred');
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const result = await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      if (!result.success) {
        setAuthError(
          typeof result.error === 'string' ? result.error : 'Registration failed'
        );
        setAuthLoading(false);
      }
      // Auto-accept happens via useEffect
    } catch {
      setAuthError('An error occurred');
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="mt-3 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md w-full mx-4 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Welcome to {invitation?.organization.name}!
          </h2>
          <p className="text-gray-600 mb-4">
            You've successfully joined the organization.
          </p>
          <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (accepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md w-full mx-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Joining organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {invitation && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {invitation.organization.name}
                </h1>
                <p className="text-sm text-gray-500">
                  <Users className="inline h-3 w-3 mr-1" />
                  You're invited as{' '}
                  <span className="font-medium capitalize">{invitation.role}</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <span className="font-medium">{invitation.invited_by.name}</span> invited
              you to collaborate on TaskFlow.
            </p>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-1">
              {mode === 'login' ? 'Sign in to accept' : 'Create account to accept'}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {mode === 'login'
                ? 'Sign in to your existing TaskFlow account'
                : 'Create a new TaskFlow account'}
            </p>

            {authError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3 mb-4">
                {authError}
              </div>
            )}

            <form
              onSubmit={mode === 'login' ? handleLogin : handleRegister}
              className="space-y-3"
            >
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Please wait...
                  </>
                ) : mode === 'login' ? (
                  'Sign in & Accept Invitation'
                ) : (
                  'Create Account & Accept Invitation'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              {mode === 'login' ? (
                <>
                  No account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setAuthError('');
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setAuthError('');
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <p className="text-gray-600 mb-4">
              Signed in as <span className="font-medium">{user?.email}</span>
            </p>
            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">
                {error}
              </div>
            )}
            <Button onClick={acceptInvitation} className="w-full" disabled={accepting}>
              {accepting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Joining...
                </>
              ) : (
                `Accept & Join ${invitation?.organization.name}`
              )}
            </Button>
            <p className="mt-3 text-sm text-gray-400">
              Not you?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in with a different account
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}