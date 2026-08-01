'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useAuthStore((s) => s.user?.settings?.darkMode);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode === false) {
      html.classList.remove('dark');
    } else {
      // Default to dark if not explicitly set to false
      html.classList.add('dark');
    }
  }, [darkMode]);

  return <>{children}</>;
}
