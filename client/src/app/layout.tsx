import type { Metadata } from "next";
import { Toaster } from 'sonner';
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "FAMS - Faculty Appointment System",
  description: "Faculty Appointment System",
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
