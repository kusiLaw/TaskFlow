'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Toaster } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give it a moment to check authentication
    const timer = setTimeout(() => {
      setIsChecking(false);
      if (!isAuthenticated && !user) {
        router.push('/login');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated && !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main>{children}</main>
      <Toaster position="top-right" />  {/* Use Sonner's Toaster */}
    </div>
  );
}