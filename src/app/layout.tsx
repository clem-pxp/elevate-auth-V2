import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
  variable: "--font-inter",
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
    <html lang="fr">
      <body className={`${inter.variable} antialiased font-sans text-strong`}>
        <QueryProvider>
          <main className="overflow-clip">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
