import FacultyBookingClient from "./FacultyBookingClient";

// Required for static export (output: "export")
export async function generateStaticParams() {
  // In a real app, you might fetch these from Firestore during build
  // For now, we seed these three to satisfy the build requirement
  return [{ id: "f1" }, { id: "f2" }, { id: "f3" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <FacultyBookingClient facultyId={id} />
    </div>
  );
}
