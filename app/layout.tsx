// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });
const geist = Geist({ subsets: ['latin'] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"] });

const italianno = localFont({
  src: [
    {
      path: '../public/fonts/Italianno-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
});

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
      <body className={`${geist.className} ${inter.className} bg-[#fdf9f5] text-gray-800`}>
        {children}
      </body>
    </html>
  );
}