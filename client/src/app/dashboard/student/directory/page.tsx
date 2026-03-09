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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Faculty Directory
        </h1>
        <p className="text-gray-500 text-sm">
          Connect with professors and explore research areas.
        </p>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by name, department, or keywords..."
          className="pl-10 h-10 border-gray-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredFaculty.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((faculty) => (
            <Card key={faculty.id} className="overflow-hidden border shadow-sm">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        faculty.imageUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=random&color=fff`
                      }
                      alt={faculty.name}
                      className="w-14 h-14 rounded-full border border-gray-100 object-cover bg-gray-50"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {faculty.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {faculty.designation}
                      </p>
                      <p className="text-xs text-gray-400">
                        {faculty.department}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>{faculty.office}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {faculty.researchInterests &&
                          faculty.researchInterests.map(
                            (interest: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-medium border border-blue-100"
                              >
                                {interest}
                              </span>
                            ),
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-gray-50 border-t flex justify-end">
                  <Link
                    href={`/dashboard/student/faculty/${faculty.id}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white hover:bg-gray-50 text-xs font-semibold"
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
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed">
          <Search className="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <h3 className="font-medium text-gray-900">No faculty found</h3>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search criteria.
          </p>
          <Button
            variant="link"
            size="sm"
            className="mt-4"
            onClick={() => setSearchQuery("")}
          >
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
