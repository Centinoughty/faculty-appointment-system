import { ChangeEvent } from "react";

interface TextareaProps {
  name: string;
  label?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

export default function Textarea({
  name,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  className,
}: TextareaProps) {
  return (
    <div className="grow">
      <label className="text-sm font-semibold text-gray-500 mb-2">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        required={required}
        rows={rows}
        placeholder={placeholder}
        onChange={onChange}
        className={`w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none resize-none text-gray-700 placeholder:text-gray-300 ${className}`}
      />
    </div>
  );
}
