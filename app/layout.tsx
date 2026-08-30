import './globals.css';
import React from 'react';
import Navbar from './components/navbar';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Streamio',
  description: 'Custom video player and feed hub',
  referrer: 'no-referrer',
  applicationName: 'Streamio',
  colorScheme: 'dark',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // avoids letterboxing on TV browsers that report odd viewports
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-black text-white antialiased tv-safe-area"
        suppressHydrationWarning
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}