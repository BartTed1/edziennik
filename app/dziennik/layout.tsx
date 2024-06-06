import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "@/global.sass";
import Header from "@/components/Header/Header";
import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <AuthWrapper>
          <Header />
          <main>{children}</main>
        </AuthWrapper>
      </body>
    </html>
  );
}
