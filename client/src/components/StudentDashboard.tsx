import React, { useState } from "react";
import FacultySearch from "./FacultySearch";
import AppointmentBooking from "./AppointmentBooking";
import MyRequests from "./MyRequests";
import {
  mockFaculty,
  mockSlots,
  mockRequests,
  addMockRequest,
} from "../lib/mockData";
import { Faculty } from "../types/dashboard";

type Tab = "search" | "requests";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  // Since we don't have a backend to auto-update data, handle state locally for demo
  const [requests, setRequests] = useState(mockRequests);

  const handleSelectFaculty = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
  };

  const handleBackToSearch = () => {
    setSelectedFaculty(null);
  };

  const handleSubmitRequest = (
    slotId: string,
    purpose: string,
    description: string,
  ) => {
    if (!selectedFaculty) return;

    // Simulate backend call
    const newRequest = addMockRequest({
      slotId,
      facultyId: selectedFaculty.id,
      studentId: "student-1", // hardcoded student ID in this demo
      purpose,
      description,
    });

    // Update local state to reflect new request immediately
    setRequests([newRequest, ...requests]);

    // Clear selection and switch back to search or list
    setSelectedFaculty(null);
    setActiveTab("requests");

    // Optional: add a tiny toast alert later, but a simple switch implies success
    alert("Appointment request submitted successfully!");
  };

  const handleCancelRequest = (requestId: string) => {
    if (confirm("Are you sure you want to cancel this appointment request?")) {
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, status: "Cancelled" } : req,
        ),
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Student Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your faculty appointments.
            </p>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex bg-white rounded-md p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => {
                setActiveTab("search");
                setSelectedFaculty(null);
              }}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === "search"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              Find Faculty
            </button>
            <button
              onClick={() => {
                setActiveTab("requests");
                setSelectedFaculty(null);
              }}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === "requests"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              My Requests
            </button>
          </div>
        </header>

        <main>
          {activeTab === "search" && (
            <>
              {!selectedFaculty ? (
                <FacultySearch
                  faculties={mockFaculty}
                  onSelectFaculty={handleSelectFaculty}
                />
              ) : (
                <AppointmentBooking
                  faculty={selectedFaculty}
                  slots={mockSlots}
                  onBack={handleBackToSearch}
                  onSubmitRequest={handleSubmitRequest}
                />
              )}
            </>
          )}

          {activeTab === "requests" && (
            <MyRequests
              requests={requests}
              faculties={mockFaculty}
              slots={mockSlots}
              onCancelRequest={handleCancelRequest}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
        <button
          onClick={() => {
            setActiveTab("search");
            setSelectedFaculty(null);
          }}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex flex-col items-center justify-center ${
            activeTab === "search"
              ? "text-blue-600"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-1"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          Search
        </button>
        <button
          onClick={() => {
            setActiveTab("requests");
            setSelectedFaculty(null);
          }}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex flex-col items-center justify-center border-l border-gray-100 ${
            activeTab === "requests"
              ? "text-blue-600"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-1"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Requests
        </button>
      </div>
    </div>
  );
}
