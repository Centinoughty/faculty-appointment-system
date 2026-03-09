import React from "react";
import { cn } from "@/lib/utils";

// Badge component: A small visual tag for things like status (Pending, Confirmed)
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  // Base styles applied to all badges
  let baseClasses =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2";

  // Variant specific styles
  let variantClasses = "";
  if (variant === "default")
    variantClasses =
      "border-transparent bg-blue-600 text-white shadow hover:bg-blue-700";
  if (variant === "secondary")
    variantClasses =
      "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200";
  if (variant === "destructive")
    variantClasses =
      "border-transparent bg-red-500 text-white shadow hover:bg-red-600";
  if (variant === "success")
    variantClasses =
      "border-transparent bg-green-500 text-white shadow hover:bg-green-600";
  if (variant === "warning")
    variantClasses =
      "border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-600";
  if (variant === "outline") variantClasses = "text-gray-950";

  return (
    <div className={cn(baseClasses, variantClasses, className)} {...props} />
  );
}
