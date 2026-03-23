"use client";

import { useState } from "react";
import Input from "../ui/Input";
import { Bell, Search } from "lucide-react";
import Button from "../ui/Button";

export default function Header() {
  const [search, setSearch] = useState<string>("");

  return (
    <>
      <header className="px-4 py-2 flex justify-between items-center">
        <Input
          name="search"
          value={search}
          placeholder="Search for faculties by name or department"
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          className="w-md min-w-sm bg-[#f6f6f8]"
        />

        <Button type="button">
          <Bell size={23} />
        </Button>
      </header>
    </>
  );
}
