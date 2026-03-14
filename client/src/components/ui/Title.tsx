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
      <h1 className="">
        <span className={`text-4xl font-semibold`}>{text}</span>
        {children}
      </h1>
    </>
  );
}
