import { ReactNode } from "react";
import Navbar from "./Navbar";
import Header from "../common/Header";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="h-screen flex overflow-hidden">
        <Navbar />

        <main className="grow flex flex-col overflow-y-auto">
          <Header />
          {children}
        </main>
      </div>
    </>
  );
}
