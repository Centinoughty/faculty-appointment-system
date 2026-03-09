"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, BookOpen } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { appointmentService } from "@/api/appointments.service";

export default function StudentDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [faculties, setFaculties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const data = await appointmentService.getFaculties();
        setFaculties(data);
      } catch (error) {
        console.error("Error fetching faculties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  const filteredFaculty = faculties.filter((faculty) => {
    const query = searchQuery.toLowerCase();
    return (
      faculty.name.toLowerCase().includes(query) ||
      faculty.department.toLowerCase().includes(query) ||
      (faculty.researchInterests &&
        faculty.researchInterests.some((interest: string) =>
          interest.toLowerCase().includes(query),
        ))
    );
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Search */}
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Faculty Directory
          </h1>
          <p className="text-gray-500 mt-1">
            Connect with professors, book appointments, and explore research
            areas.
          </p>
        </div>

        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search by name, department, or keywords..."
            className="pl-10 h-12 text-base rounded-xl shadow-sm bg-white border-gray-200 focus:border-blue-500 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Results Grid */}
      {filteredFaculty.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((faculty) => (
            <Card
              key={faculty.id}
              className="overflow-hidden hover:border-blue-200 group transition-all duration-300 hover:shadow-lg rounded-2xl"
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        faculty.imageUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=random&color=fff`
                      }
                      alt={faculty.name}
                      className="w-16 h-16 rounded-2xl border border-gray-100 object-cover shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {faculty.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-semibold">
                        {faculty.designation}
                      </p>
                      <p className="text-sm text-gray-400 font-medium">
                        {faculty.department}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2.5 text-sm font-medium text-gray-600">
                      <MapPin className="w-4 h-4 text-red-400" />
                      <span>{faculty.office}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1.5">
                        {faculty.researchInterests &&
                          faculty.researchInterests.map(
                            (interest: string, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100"
                              >
                                {interest}
                              </span>
                            ),
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/dashboard/student/faculty/${faculty.id}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 font-bold transition-all shadow-sm rounded-xl py-5"
                    >
                      View Profile & Book
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-24 px-6 rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 mb-6 transition-transform">
            <Search className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Faculty Found
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
            We couldn't find anyone matching "{searchQuery}". Try adjusting your
            search keywords or department.
          </p>
          <Button
            variant="outline"
            className="rounded-xl font-bold px-8 shadow-sm"
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}
