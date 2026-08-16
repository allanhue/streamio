import './globals.css';
import React from 'react';
import Navbar from './components/navbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Streamio - Dashboard & Video Player',
  description: 'Custom video player and feed hub',
  referrer: 'no-referrer', // Properly instructs Next.js to omit referrers for embeds
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body 
        className="min-h-screen bg-slate-950 text-slate-100 antialiased"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="max-w-6xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}