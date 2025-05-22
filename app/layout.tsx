import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import React from 'react';
import NavHeader from '../components/NavHeader';
import Footer from '../components/Footer';
import ScrollPreservation from '../components/ScrollPreservation';
// Auth provider is in auth.tsx not auth.ts

const poppins = Poppins({
  weight: ['300'],
  subsets: ['latin'],
  fallback: ['Poppins Fallback'],
});

export const metadata: Metadata = {
  title: 'EasyMEET | NCCG',
  description: 'Track and manage meeting attendance for Nairobi City County Government',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <ScrollPreservation />
        <NavHeader />
        <main className="min-h-screen bg-white">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
