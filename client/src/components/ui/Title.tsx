import { ReactNode } from "react";

export default function Title({
  text,
  children,
}: {
  text: string;
  children?: ReactNode;
}) {
  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-wide">{text}</h1>
        <p className="mt-1 text-gray-500">{children}</p>
      </div>
    </>
  );
}
