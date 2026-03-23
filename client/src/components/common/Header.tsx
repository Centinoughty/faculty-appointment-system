"use client";

import Input from "../ui/Input";
import { Bell, Building2, Search } from "lucide-react";
import Button from "../ui/Button";
import useSearch from "@/hooks/useSearch";
import { useRef, useState } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const { query, setQuery, faculties, isLoading, hasQuery } = useSearch();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => setOpen(false));

  const handleSelect = (id: string) => {
    setQuery("");
    setOpen(false);
    router.push(`/faculty/${id}`);
  };

  return (
    <header className="px-4 py-2 flex justify-between items-center">
      <div ref={containerRef} className="relative w-full max-w-md">
        <Input
          name="search"
          value={query}
          placeholder="Search for faculties by name or department"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          icon={Search}
          className="w-md min-w-sm bg-[#f6f6f8]"
        />

        {open && hasQuery && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl border border-gray-100 shadow-lg z-50 overflow-hidden">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                Searching...
              </div>
            ) : faculties.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                No faculty found for "{query}"
              </div>
            ) : (
              <ul>
                {faculties.map((faculty) => (
                  <li key={faculty.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(faculty.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="relative w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                        {faculty.picture ? (
                          <Image
                            src={faculty.picture}
                            alt={faculty.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                            {faculty.name[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {faculty.name}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                          <Building2 size={11} />
                          {faculty.name}, {faculty.department.name}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <Button type="button">
        <Bell size={23} />
      </Button>
    </header>
  );
}
