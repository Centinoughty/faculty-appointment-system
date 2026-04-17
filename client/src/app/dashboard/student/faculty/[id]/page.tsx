import FacultyBookingClient from "./FacultyBookingClient";

// This is required since the app uses `output: "export"` in next.config.ts
export function generateStaticParams() {
  // Return an array of valid faculty IDs for static generation
  return [{ id: "f1" }, { id: "f2" }, { id: "f3" }];
}

export default function Page() {
  return <FacultyBookingClient />;
}
