import { LucideIcon } from "lucide-react";
import { ChangeEvent } from "react";

interface InputProps {
  name: string;
  label: string;
  autoComplete?: string;
  type?: string;
  icon?: LucideIcon;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function Input({
  name,
  label,
  type = "text",
  autoComplete,
  icon: Icon,
  required = true,
  placeholder,
  value,
  onChange,
  className,
}: InputProps) {
  return (
    <>
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>

        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-3 flex items-center text-gray-300">
              <Icon size={20} />
            </div>
          )}

          <input
            name={name}
            type={type}
            autoComplete={autoComplete}
            required={required}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full tracking-wider rounded-lg py-2.5 pr-3 text-sm font-medium focus:outline-none border border-gray-300 ${Icon ? "pl-10" : "pl-3"} ${className}`}
          />
        </div>
      </div>
    </>
  );
}
