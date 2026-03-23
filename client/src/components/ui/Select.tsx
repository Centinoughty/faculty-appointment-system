import { ChangeEvent } from "react";

interface SelectProps {
  name: string;
  label?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function Select({
  name,
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  required = false,
  className,
}: SelectProps) {
  return (
    <div className="grow">
      {label && (
        <label className="text-sm font-semibold text-gray-500 mb-2 block">
          {label}
        </label>
      )}
      <select
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        className={`w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none bg-white text-gray-700 ${className}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
