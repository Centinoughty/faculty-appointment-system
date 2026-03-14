import FacultyNavbar from "@/components/navbar/FacultyNavbar";

export default function FacultyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div>
        <FacultyNavbar />
      </div>
    </>
  );
}
