"use client";

import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";

export default function page() {
  const { signOut } = useAuth();

  return (
    <>
      <AuthGuard>
        <div>
          <button onClick={signOut}>Logout</button>
        </div>
      </AuthGuard>
    </>
  );
}
