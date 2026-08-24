import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Techtor — AI Code Mentor & Engineering Workbench',
  description: 'AI Code Mentor platform with real-time code reviews, interactive debugging simulations, custom learning paths, and pair-programming workbench.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-[#f8f9fd] text-slate-900 min-h-screen font-sans antialiased selection:bg-purple-500/20 selection:text-purple-900"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
