"use client";

import { useState } from "react";
import { GraduationCap, Bell } from "lucide-react";
import SearchBar from "./SearchBar";
import ToggleSwitch from "./ToggleSwitch";

export default function FacultyNavbar() {
  const [isBusyMode, setIsBusyMode] = useState(false);

  return (
    <nav className="border-b border-gray-200 px-4 py-2 flex justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="bg-blue p-2 rounded-lg">
            <GraduationCap size={25} color="white" />
          </div>
          <p className="font-bold text-xl text-nowrap">FAMS NITC</p>
        </div>

        <SearchBar />
      </div>

      <div className="flex items-center gap-4">
        <ToggleSwitch
          label="Busy Mode"
          onChange={() => setIsBusyMode(!isBusyMode)}
          checked={isBusyMode}
        />

        <div className="p-1 rounded-md bg-gray-100">
          <Bell size={22} color="#4a5565" />
        </div>

        <button className="flex items-center focus:outline-none">
          <img
            className="h-9 w-9 rounded-full object-cover border-2 border-transparent hover:border-primary transition-all"
            src="https://picsum.photos/seed/faculty1/100/100"
            alt="User avatar"
          />
        </button>
      </div>
    </nav>
  );
}
