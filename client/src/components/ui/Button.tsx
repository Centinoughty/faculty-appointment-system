import React from "react";
import { cn } from "@/lib/utils";

// A simple Button component that accepts standard button props
// 'variant' lets us change the color style easily
// 'size' lets us change the padding easily

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  // Base CSS classes applied to every button
  let baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50";

  // Variant CSS classes based on the 'variant' prop
  let variantClasses = "";
  if (variant === "default")
    variantClasses = "bg-blue-600 text-white shadow hover:bg-blue-700";
  if (variant === "destructive")
    variantClasses = "bg-red-500 text-white shadow-sm hover:bg-red-600";
  if (variant === "outline")
    variantClasses =
      "border border-gray-200 bg-white shadow-sm hover:bg-gray-100 hover:text-gray-900";
  if (variant === "secondary")
    variantClasses = "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200";
  if (variant === "ghost")
    variantClasses = "hover:bg-gray-100 hover:text-gray-900";
  if (variant === "link")
    variantClasses = "text-blue-600 underline-offset-4 hover:underline";

  // Size CSS classes based on the 'size' prop
  let sizeClasses = "";
  if (size === "default") sizeClasses = "h-9 px-4 py-2";
  if (size === "sm") sizeClasses = "h-8 rounded-md px-3 text-xs";
  if (size === "lg") sizeClasses = "h-10 rounded-md px-8";
  if (size === "icon") sizeClasses = "h-9 w-9";

  return (
    <button
      className={cn(baseClasses, variantClasses, sizeClasses, className)}
      {...props}
    />
  );
}
