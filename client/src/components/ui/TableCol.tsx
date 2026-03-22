import { ReactNode } from "react";

export default function TableCol({ children }: { children: ReactNode }) {
  return (
    <>
      <td className="p-4 text-sm text-gray-700">{children}</td>
    </>
  );
}
