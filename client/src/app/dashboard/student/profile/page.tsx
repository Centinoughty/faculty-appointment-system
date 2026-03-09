"use client";

import { Card, CardContent } from "@/components/ui/Card";
import {
  User,
  Mail,
  BookOpen,
  Fingerprint,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

// Mock Student Profile
const MOCK_PROFILE = {
  name: "Nadeem M Siyam",
  rollNumber: "B210000CS",
  email: "nadeem_b210000cs@nitc.ac.in",
  program: "B.Tech Computer Science and Engineering",
  semester: "6th Semester",
};

export default function StudentProfilePage() {
  const { signOut } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Profile
          </h1>
          <p className="text-gray-500 mt-1">
            View your academic and account details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={signOut}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden border-none shadow-lg">
            {/* Banner Area */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                    NS
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="pt-16 pb-8 px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {MOCK_PROFILE.name}
                  </h2>
                  <p className="text-blue-600 font-medium mt-1">
                    {MOCK_PROFILE.program}
                  </p>
                </div>
                <Button variant="outline" className="shrink-0 bg-white">
                  Edit Profile
                </Button>
              </div>

              <hr className="my-8 border-gray-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 border-l-4 border-blue-600 pl-2">
                    Academic Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Fingerprint className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Roll Number</p>
                        <p className="font-medium text-gray-900">
                          {MOCK_PROFILE.rollNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Current Semester
                        </p>
                        <p className="font-medium text-gray-900">
                          {MOCK_PROFILE.semester}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900 border-l-4 border-blue-600 pl-2">
                    Contact Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Institute Email</p>
                        <p className="font-medium text-gray-900">
                          {MOCK_PROFILE.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-none shadow-lg">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Account Status
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-sm font-semibold text-emerald-700">
                  Verified Account
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Your email has been verified.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Login</span>
                  <span className="font-medium text-gray-900">
                    Today, 10:24 AM
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Role</span>
                  <span className="font-medium text-gray-900">Student</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
