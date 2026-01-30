import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elevate - Transforme ton corps",
  description:
    "Rejoins Elevate et accède à des programmes d'entraînement personnalisés, un suivi sur mesure et un coaching premium pour atteindre tes objectifs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans text-strong`}
      >
        <QueryProvider>
          <main className="overflow-clip">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
