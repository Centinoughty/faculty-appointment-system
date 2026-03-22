import { ReactNode } from "react";
import Navbar from "./Navbar";

export default function FacultyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="h-screen flex overflow-hidden">
        <Navbar />

        <main className="grow overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
