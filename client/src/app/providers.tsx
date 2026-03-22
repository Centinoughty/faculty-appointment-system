"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Script from "next/script";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
    </>
  );
}
