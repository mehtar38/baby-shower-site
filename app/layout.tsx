// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Baby Mehta Shower",
  description: "A place to celebrate Baby Mehta!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} ${inter.className} bg-[#fdf9f5] text-gray-800`}>
        {children}
      </body>
    </html>
  );
}