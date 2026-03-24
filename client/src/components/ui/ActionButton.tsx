type Variant = "success" | "danger" | "warning" | "ghost";

const VARIANT_STYLES: Record<Variant, string> = {
  success: "text-green-600 border-green-200 hover:bg-green-50",
  danger: "text-red-500 border-red-200 hover:bg-red-50",
  warning: "text-orange-500 border-orange-200 hover:bg-orange-50",
  ghost: "text-gray-500 border-gray-200 hover:bg-gray-50",
};

export default function ActionButton({
  label,
  onClick,
  disabled,
  variant,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  variant: Variant;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_STYLES[variant]}`}
    >
      {label}
    </button>
  );
}
