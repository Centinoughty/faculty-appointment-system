import React from "react";
import { cn } from "@/lib/utils";

// Card: The outer container of the card with a border and shadow
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-white text-gray-950 shadow-sm transition-all hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

// CardHeader: A container for the top part of the card, usually containing the title
export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

// CardContent: A container for the main content inside the card
export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
