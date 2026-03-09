"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Mail, BookOpen, Fingerprint, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { appointmentService } from "@/api/appointments.service";
import { useAppSelector } from "@/store/hooks";

export default function StudentProfilePage() {
  const { signOut } = useAuth();
  const { user } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email) return;
      try {
        let existing = await appointmentService.getUserProfile(user.email);
        if (!existing) {
          const initial = {
            name: user.displayName || "Student",
            rollNumber: "B210000CS",
            program: "B.Tech Computer Science and Engineering",
            semester: "6th Semester",
            email: user.email,
            photoURL: user.photoURL,
          };
          await appointmentService.ensureUserProfile(user.email, initial);
          existing = await appointmentService.getUserProfile(user.email);
        }
        setProfile(existing);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-0">
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
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden border-none shadow-xl rounded-3xl">
            {/* Banner Area */}
            <div className="h-40 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 relative">
              <div className="absolute -bottom-14 left-8">
                <div className="w-28 h-28 bg-white rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-3xl">
                      {profile?.name?.charAt(0) || "S"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <CardContent className="pt-20 pb-8 px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {profile?.name}
                  </h2>
                  <p className="text-blue-600 font-bold mt-1.5 uppercase tracking-widest text-xs">
                    {profile?.program}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl font-bold border-2 border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                >
                  Edit Account
                </Button>
              </div>

              <hr className="my-10 border-gray-50" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                    Academic Details
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 transition-transform group-hover:scale-110">
                        <Fingerprint className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                          Roll Number
                        </p>
                        <p className="font-bold text-gray-900 text-lg">
                          {profile?.rollNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 transition-transform group-hover:scale-110">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                          Current Semester
                        </p>
                        <p className="font-bold text-gray-900 text-lg">
                          {profile?.semester}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                    Contact Info
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 transition-transform group-hover:scale-110">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                          Email Address
                        </p>
                        <p className="font-bold text-gray-900 truncate">
                          {profile?.email}
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
          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="w-24 h-24 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              Security
            </h3>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border-2 border-emerald-100/50">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                  Account Status
                </p>
                <p className="text-sm font-bold text-emerald-600 mt-1">
                  Active & Verified
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    Role
                  </span>
                  <span className="font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
                    STUDENT
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    Joined
                  </span>
                  <span className="font-black text-gray-900">MARCH 2026</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
