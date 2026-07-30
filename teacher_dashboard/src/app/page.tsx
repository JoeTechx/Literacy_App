'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function RootDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role === 'admin' || user.role === 'superadmin') {
      router.push('/admin');
    } else if (user.role === 'student') {
      // Students should use mobile app, but if they land here, bounce to login or handle it
      router.push('/login');
    } else {
      router.push('/teacher');
    }
  }, [user, router]);

  // Show a loading spinner while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );
}
