"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

function SessionManager({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAuth();

  useEffect(() => {
    const unsub = restoreSession();
    return () => (typeof unsub === "function" ? unsub() : undefined);
  }, [restoreSession]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionManager>{children}</SessionManager>
    </Provider>
  );
}
