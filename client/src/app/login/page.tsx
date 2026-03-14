"use client";

import Google from "@/components/icons/Google";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useAuth from "@/hooks/useAuth";
import { AtSign, LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const { formData, handleChange, handleLogin, isLoading } = useAuth();

  return (
    <>
      <div className="h-dvh w-full flex justify-center items-center bg-[#f6f6f8]">
        <main className="grid grid-cols-2 rounded-lg shadow-lg overflow-hidden">
          <div className="w-130 p-8 bg-blue text-white flex flex-col gap-4">
            <div style={{ height: "250px", position: "relative" }}>
              <Image
                src={"https://picsum.photos/800/500"}
                alt="Campus"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-md"
              />
            </div>

            <h1 className="font-bold text-3xl text-shadow-sm">
              Elevating Academic Excellence
            </h1>

            <p className="text-sm text-white/90">
              Manage the appointments with the facuties in one unified portal
            </p>
          </div>

          <div className="p-8">
            <h2 className="font-semibold text-2xl">Welcome Back</h2>

            <p className="text-sm text-gray-400">
              Please sign in to manage your appointments and applications.
            </p>

            <Button
              disabled={isLoading}
              type="submit"
              className="my-8 py-1 flex justify-center items-center gap-2 border border-gray-200"
            >
              <Google />
              <span className="font-semibold text-gray-700">
                Sign in with Google
              </span>
            </Button>

            <hr className="my-6 text-gray-300" />

            <form onSubmit={handleLogin} className="flex flex-col gap-2">
              <Input
                name="email"
                label="Email Address"
                type="email"
                placeholder="name@nitc.ac.in"
                value={formData.email}
                icon={AtSign}
                onChange={handleChange}
              />

              <Input
                name="password"
                label="Password"
                type="password"
                placeholder="•••••••••"
                value={formData.password}
                icon={LockKeyhole}
                onChange={handleChange}
              />

              <Link
                href={"/forgot-password"}
                className="text-right text-blue font-semibold"
              >
                Forgot Password?
              </Link>

              <Button
                type="submit"
                disabled={isLoading}
                className="py-2 bg-blue text-white font-semibold disabled:bg-gray-600"
              >
                {isLoading ? "Loading..." : "Sign In"}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
