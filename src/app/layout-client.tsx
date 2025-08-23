'use client';

import React from 'react';
import { SupabaseAuthProvider } from '@/components/auth/SupabaseAuthContext';
import Header from '@/components/layout/Header';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseAuthProvider>
      <Header />
      <main className="pt-20">
        {children}
      </main>
    </SupabaseAuthProvider>
  );
}