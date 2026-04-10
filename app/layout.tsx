import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "../styles/mobileOptimizations.css";
import "../styles/createMeetingButton.css";
import React from "react";
import NavHeader from "../components/NavHeader";
import Footer from "../components/Footer";

import ScrollPreservation from "@/components/ScrollPreservation";

const poppins = Poppins({
  weight: ["300"],
  subsets: ["latin"],
  fallback: ["Poppins Fallback"],
});

export const metadata: Metadata = {
  title: "EasyMEET | NCCG",
  description:
    "Track and manage meeting attendance for Nairobi City County Government",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className={poppins.className}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <ScrollPreservation />
        </React.Suspense>
        <NavHeader />
        <main className="min-h-screen bg-white pb-6">{children}</main>
        <Footer className="py-4" />
      </body>
    </html>
  );
}
