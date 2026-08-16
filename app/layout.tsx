import './globals.css';
import React from 'react';
import Navbar from './components/navbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Streamio - Dashboard & Video Player',
  description: 'Custom video player and feed hub',
  referrer: 'no-referrer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body 
        className="min-h-screen bg-black text-white antialiased"
        suppressHydrationWarning
      >
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
