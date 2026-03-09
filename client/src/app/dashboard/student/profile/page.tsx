"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Mail, BookOpen, Fingerprint, LogOut } from "lucide-react";
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          My Profile
        </h1>
        <Button
          variant="outline"
          onClick={signOut}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-gray-100">
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
            <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{profile?.program}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-lg text-gray-900 border-b pb-2">
              Academic Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Roll Number
                </p>
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-blue-500" />
                  <p className="font-medium text-gray-900">
                    {profile?.rollNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Semester
                </p>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <p className="font-medium text-gray-900">
                    {profile?.semester}
                  </p>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Email
                </p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <p className="font-medium text-gray-900">{profile?.email}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full sm:w-auto">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
