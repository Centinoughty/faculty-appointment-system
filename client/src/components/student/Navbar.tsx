"use client";

import { NavItem } from "@/types/layout";
import {
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import NavItemLink from "../ui/NavItemLink";
import { poppins } from "@/styles/font";
import Image from "next/image";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Appointments", href: "/appointments", icon: CalendarCheck },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  return (
    <>
      <nav
        className={`p-4 w-3xs max-w-2xs flex flex-col gap-6 ${poppins.className} border-r border-gray-200`}
      >
        <div className="flex items-center gap-2 font-semibold text-blue">
          <div className="p-1 rounded-md bg-blue">
            <GraduationCap size={30} color="white" />
          </div>
          FAMS NITC
        </div>

        <ul className="flex flex-col gap-2">
          {navItems.map((item, idx) => (
            <NavItemLink
              key={idx}
              label={item.label}
              href={item.href}
              icon={item.icon}
            />
          ))}
        </ul>

        <div className="py-2 border-t border-gray-200 mt-auto flex justify-center items-center gap-3">
          <div style={{ width: "35px", height: "35px", position: "relative" }}>
            <Image
              src={"https://picsum.photos/200"}
              alt="Picsum Template"
              fill
              sizes="(max-width: 1024px) 0px, 520px"
              style={{ objectFit: "cover" }}
              className="rounded-full"
            />
          </div>

          <div>
            <p className="font-semibold">Nadeem M Siyam</p>
            <p className="text-sm">B230440CS</p>
          </div>
        </div>
      </nav>
    </>
  );
}
