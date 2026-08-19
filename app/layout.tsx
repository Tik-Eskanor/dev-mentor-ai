import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'DevMentor AI — Production AI Code Mentor & Pair Programming Workbench',
  description: 'AI Code Mentor platform with real-time code reviews, interactive debugging simulations, custom learning paths, and pair-programming workbench.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d1117] text-slate-100 min-h-screen font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
