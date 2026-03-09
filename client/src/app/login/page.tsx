"use client";

import Google from "@/components/ui/Google";
import { useAuth } from "@/hooks/useAuth";
import { roboto } from "@/lib/font";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { loginWithGoogle, restoreSession } = useAuth();
  const { user } = useAppSelector((state) => state.auth);

  const router = useRouter();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <>
      <main className="min-h-screen flex flex-col justify-center items-center p-[5%]">
        <button
          onClick={loginWithGoogle}
          className="px-4 py-3 bg-[#6193ec] text-white rounded-full flex items-center gap-2 cursor-pointer"
        >
          <Google />
          <p className={`${roboto.className} font-medium`}>
            Sign in with Google
          </p>
        </button>
      </main>
    </>
  );
}
