import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "../styles/mobileOptimizations.css";
import "../styles/createMeetingButton.css";
import React from "react";
import Footer from "../components/Footer";

import ScrollPreservation from "@/components/ScrollPreservation";
import { cn } from "@/lib/utils";
import HeaderWrapper from "@/components/login/HeaderWrapper";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
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
    <html lang="en" className={cn("font-sans", poppins.className)}>
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
        <HeaderWrapper />
        <main className="min-h-screen bg-white pb-6">{children}</main>
        <Footer className="py-4" />
      </body>
    </html>
  );
}
