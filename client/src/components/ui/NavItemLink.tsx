"use client";

import { NavItem } from "@/types/layout";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavItemLink({ label, href, icon: Icon }: NavItem) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <>
      <Link
        href={href}
        className={`px-3 py-1.5 flex items-center gap-3 font-medium rounded-lg duration-200 ${active ? "bg-blue/5 text-blue" : "hover:bg-blue/5 hover:text-blue"}`}
      >
        <Icon size={17} />
        {label}
      </Link>
    </>
  );
}
