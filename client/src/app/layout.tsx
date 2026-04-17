import type { Metadata } from "next";
import { Toaster } from 'sonner';
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "FAMS - Faculty Appointment System",
  description: "Book and manage faculty appointments effortlessly.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-gray-50/50`}>
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
