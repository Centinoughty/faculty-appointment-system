"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Mail, BookOpen, Fingerprint, LogOut, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { appointmentService } from "@/api/appointments.service";
import { useAppSelector } from "@/store/hooks";

export default function StudentProfilePage() {
  const { signOut } = useAuth();
  const { user } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const extractRollNumber = (email: string) => {
      const part = email.split("@")[0];
      const match = part.split("_");
      if (match.length > 1) {
        // Expected format: name_rollnumber
        // We take the last part since name might contain underscores too
        return match[match.length - 1].toUpperCase();
      }
      // Regex fallback for B230203 pattern anywhere in the local part
      const regexMatch = part.match(/[a-zA-Z]\d{6}/i);
      if (regexMatch) return regexMatch[0].toUpperCase();

      return "B2300203CS"; // Generic fallback
    };

    try {
      console.log("Fetching profile for:", user.email);
      let existing = await appointmentService.getUserProfile(user.email);

      if (!existing) {
        console.log("No profile found, creating initial...");
        const initial = {
          name: user.displayName || "Student",
          rollNumber: extractRollNumber(user.email),
          program: "B.Tech Computer Science and Engineering",
          semester: "6th Semester",
          email: user.email,
          photoURL: user.photoURL,
        };
        await appointmentService.ensureUserProfile(user.email, initial);
        existing = await appointmentService.getUserProfile(user.email);
      }

      setProfile(existing);
    } catch (err: any) {
      console.error("Profile load failed:", err);
      setError(err.message || "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.displayName, user?.photoURL]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 text-sm font-medium">Fetching profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-4 text-center px-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-full">
          <RefreshCcw className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-gray-900">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-500 text-sm max-w-xs">{error}</p>
        </div>
        <Button onClick={() => loadProfile()} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          My Profile
        </h1>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadProfile()}
            className="text-gray-500 hover:text-gray-900"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Sync
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
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
