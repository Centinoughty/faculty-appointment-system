import React, { useState } from "react";
import { Faculty } from "../types/dashboard";

interface FacultySearchProps {
  faculties: Faculty[];
  onSelectFaculty: (faculty: Faculty) => void;
}

export default function FacultySearch({
  faculties,
  onSelectFaculty,
}: FacultySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaculties = faculties.filter((faculty) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      faculty.name.toLowerCase().includes(searchLower) ||
      faculty.department.toLowerCase().includes(searchLower) ||
      faculty.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchLower),
      )
      
    );
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-slate-800">
        Find Faculty
      </h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, department, or keywords..."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div>
        {filteredFaculties.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-md border border-gray-100">
            <p className="text-slate-500 font-medium">No Faculty Found</p>
            <p className="text-slate-400 text-sm mt-1">
              Try clearing your search or using different keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaculties.map((faculty) => (
              <div
                key={faculty.id}
                className="p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer bg-slate-50"
                onClick={() => onSelectFaculty(faculty)}
              >
                <h3 className="text-lg font-medium text-blue-900">
                  {faculty.name}
                </h3>
                <p className="text-sm text-slate-600 mb-2">
                  {faculty.department}
                </p>
                <div className="flex flex-wrap gap-2">
                  {faculty.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
