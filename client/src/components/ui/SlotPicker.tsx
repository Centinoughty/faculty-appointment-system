interface Slot {
  value: string;
  label: string;
  period: string;
}

function formatSlot(value: string): Slot {
  const [h, m] = value.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h;
  const period = h < 12 ? "Morning" : h < 15 ? "Afternoon" : "Evening";
  return {
    value,
    label: `${h12}:${m === 0 ? "00" : "30"} ${ampm}`,
    period,
  };
}

interface SlotPickerProps {
  label?: string;
  slots: string[]; // raw values from backend e.g. ["9:00", "9:30"]
  selected: string | null;
  onChange: (slot: string) => void;
  isLoading?: boolean;
  isEmpty?: boolean; // true when backend returned no slots
  disabled?: boolean; // true when faculty not yet selected
}

export default function SlotPicker({
  label,
  slots,
  selected,
  onChange,
  isLoading = false,
  isEmpty = false,
  disabled = false,
}: SlotPickerProps) {
  return (
    <div>
      {label && (
        <label className="text-sm font-semibold text-gray-500 mb-2 block">
          {label}
        </label>
      )}

      {disabled ? (
        <p className="text-xs text-gray-400 mt-1">Select a faculty first.</p>
      ) : isLoading ? (
        <p className="text-xs text-gray-400 mt-1">Loading available slots...</p>
      ) : isEmpty ? (
        <p className="text-xs text-red-400 mt-1">
          No available slots for this date.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 mt-1">
          {slots.map((raw) => {
            const { value, label: slotLabel, period } = formatSlot(raw);
            const isSelected = selected === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange(value)}
                className={`flex flex-col items-center py-2.5 px-2 rounded-lg border text-xs font-medium transition-colors
                  ${
                    isSelected
                      ? "border-blue bg-blue text-white"
                      : "border-gray-200 text-gray-600 hover:border-blue/40 hover:bg-blue/5"
                  }`}
              >
                <span className="text-[10px] opacity-70">{period}</span>
                <span>{slotLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
