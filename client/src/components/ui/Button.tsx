import { ReactNode } from "react";

interface ButtonProps {
  type: "submit" | "reset" | "button" | undefined;
  disabled: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Button({
  type,
  disabled = false,
  onClick,
  children,
  className,
}: ButtonProps) {
  return (
    <>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`w-full rounded-lg ${className}`}
      >
        {children}
      </button>
    </>
  );
}
