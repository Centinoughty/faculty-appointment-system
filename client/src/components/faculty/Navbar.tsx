import { NavItem } from "@/types/layout";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import NavItemLink from "../ui/NavItemLink";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Schedule", href: "/schedule", icon: CalendarDays },
  { label: "Requests", href: "/requests", icon: ClipboardList },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  return (
    <>
      <nav>
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
      </nav>
    </>
  );
}
