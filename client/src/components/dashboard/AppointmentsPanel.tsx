"use client";

import { useState } from "react";
import { ListTodo, Plus } from "lucide-react";

// --- Mock Data ---
type StatusType = "IN PROGRESS" | "UPCOMING" | "SCHEDULED" | "DONE";

interface Appointment {
  id: string;
  status: StatusType;
  time: string;
  name: string;
  description: string;
}

const appointmentsData: Appointment[] = [
  {
    id: "1",
    status: "IN PROGRESS",
    time: "14:30 - 15:00",
    name: "Abhinav S.",
    description: "Project: ML Optimization",
  },
  {
    id: "2",
    status: "UPCOMING",
    time: "15:15 - 15:45",
    name: "Priyanka Rao",
    description: "Seminar Registration Issue",
  },
  {
    id: "3",
    status: "SCHEDULED",
    time: "16:00 - 16:30",
    name: "Karthik Raja",
    description: "Thesis Pre-submission",
  },
  {
    id: "4",
    status: "DONE",
    time: "09:00 - 09:30",
    name: "Deepak Murali",
    description: "Attendance Correction",
  },
];

// --- Helper for Badge Styles ---
const getBadgeStyle = (status: StatusType) => {
  switch (status) {
    case "IN PROGRESS":
      return "bg-primary text-white";
    case "UPCOMING":
      return "bg-amber-100 text-amber-700";
    case "SCHEDULED":
      return "bg-gray-100 text-gray-600";
    case "DONE":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function AppointmentsPanel() {
  const [activeTab, setActiveTab] = useState("Today");
  const tabs = ["Today", "Week", "Done", "Pending"];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <ListTodo className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Appointments
        </h2>
      </div>

      {/* Tabs */}
      <div className="bg-gray-50/80 p-1 rounded-lg flex justify-between items-center mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs font-bold py-2 px-1 rounded-md transition-all ${
              activeTab === tab
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
        {appointmentsData.map((apt) => {
          const isDone = apt.status === "DONE";
          const isInProgress = apt.status === "IN PROGRESS";

          return (
            <div
              key={apt.id}
              className={`p-4 rounded-xl border transition-all ${
                isInProgress
                  ? "border-primary shadow-sm bg-blue-50/30"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-[10px] font-black tracking-wider px-2 py-1 rounded uppercase ${getBadgeStyle(apt.status)}`}
                >
                  {apt.status}
                </span>
                <span
                  className={`text-xs font-semibold ${isDone ? "text-gray-300" : "text-gray-400"}`}
                >
                  {apt.time}
                </span>
              </div>

              <h3
                className={`font-bold text-base mb-1 ${isDone ? "text-gray-400 line-through decoration-gray-300" : "text-gray-900"}`}
              >
                {apt.name}
              </h3>
              <p
                className={`text-xs ${isDone ? "text-gray-300" : "text-gray-500"}`}
              >
                {apt.description}
              </p>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-auto bg-blue hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2">
        <Plus className="w-5 h-5" />
        <span>New Appointment</span>
      </button>
    </div>
  );
}
