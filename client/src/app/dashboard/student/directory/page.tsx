"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  BookOpen,
  Calendar as CalendarIcon,
  List as ListIcon,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Mock Data
const MOCK_FACULTY = [
  {
    id: "f1",
    name: "Dr. Lijiya A",
    department: "Computer Science",
    designation: "Assistant Professor",
    researchInterests: ["Machine Learning", "Data Mining", "AI"],
    office: "CSED #201",
    imageUrl: "https://ui-avatars.com/api/?name=Lijiya+A&background=random",
  },
  {
    id: "f2",
    name: "Dr. Vinod P",
    department: "Computer Science",
    designation: "Professor",
    researchInterests: ["Cyber Security", "Network Forensics"],
    office: "CSED #304",
    imageUrl: "https://ui-avatars.com/api/?name=Vinod+P&background=random",
  },
  {
    id: "f3",
    name: "Dr. Sudeep K S",
    department: "Computer Science",
    designation: "Associate Professor",
    researchInterests: ["Algorithms", "Graph Theory", "Cryptography"],
    office: "CSED #102",
    imageUrl: "https://ui-avatars.com/api/?name=Sudeep+KS&background=random",
  },
];

export default function StudentDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaculty = MOCK_FACULTY.filter((faculty) => {
    const query = searchQuery.toLowerCase();
    return (
      faculty.name.toLowerCase().includes(query) ||
      faculty.department.toLowerCase().includes(query) ||
      faculty.researchInterests.some((interest) =>
        interest.toLowerCase().includes(query),
      )
    );
  });

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
              className="overflow-hidden hover:border-blue-200 group"
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={faculty.imageUrl}
                      alt={faculty.name}
                      className="w-16 h-16 rounded-full border border-gray-200 object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {faculty.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {faculty.designation}
                      </p>
                      <p className="text-sm text-gray-500">
                        {faculty.department}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{faculty.office}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {faculty.researchInterests.map((interest, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                  <Link href={`/dashboard/student/faculty/${faculty.id}`}>
                    <Button
                      variant="outline"
                      className="w-full bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 font-medium transition-all shadow-sm"
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
        <div className="text-center py-20 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Faculty Found
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            We couldn't find anyone matching "{searchQuery}". Try adjusting your
            search keywords or department.
          </p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}
