'use client';

import React from 'react';
import { AuthProvider } from '@/components/auth/AuthContext';
import Header from '@/components/layout/Header';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Header />
      <main className="pt-20">
        {children}
      </main>
    </AuthProvider>
  );
}