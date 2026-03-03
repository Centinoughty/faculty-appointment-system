"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { User, Mail, BookOpen, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Mock Student Profile
const MOCK_PROFILE = {
  name: "Nadeem M Siyam",
  rollNumber: "B210000CS",
  email: "nadeem_b210000cs@nitc.ac.in",
  program: "B.Tech Computer Science and Engineering",
  semester: "6th Semester",
};

export default function StudentProfilePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          My Profile
        </h1>
        <p className="text-gray-500 mt-1">
          View your academic and account details.
        </p>
      </div>

      <Card className="overflow-hidden">
        {/* Banner Area */}
        <div className="h-32 bg-blue-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center">
              <User className="w-12 h-12 text-gray-300" />
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
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
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
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Semester</p>
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
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
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
  );
}
