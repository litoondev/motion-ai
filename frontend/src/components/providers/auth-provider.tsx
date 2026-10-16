'use client';
import { AuthProvider } from '@/lib/auth-context';
import type { User } from '@/lib/types';

export function Providers({ children, user }: { children: React.ReactNode; user?: User | null }) {
  return (
    <AuthProvider initialUser={user}>
      {children}
    </AuthProvider>
  );
}
