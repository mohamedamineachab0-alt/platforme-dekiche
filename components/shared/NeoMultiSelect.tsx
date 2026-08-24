import { CheckCircle2 } from "lucide-react";

type NeoMultiSelectProps = {
  options: { value: string; label: string; subLabel?: string }[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  name?: string; // Optional name for hidden inputs
};

export function NeoMultiSelect({ options, selectedValues, onChange, name }: NeoMultiSelectProps) {
  const toggleSelection = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {options.map(option => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleSelection(option.value)}
              className={`p-3 border-black border-2 text-sm font-black transition-transform text-right flex items-center justify-between hover:-translate-y-1 ${
                isSelected
                  ? "bg-purple-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              <div className="flex flex-col">
                <span>{option.label}</span>
                {option.subLabel && (
                  <span className={`text-xs mt-1 ${isSelected ? "text-purple-200" : "text-slate-500"}`}>
                    {option.subLabel}
                  </span>
                )}
              </div>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
            </button>
          );
        })}
      </div>
      
      {/* Hidden inputs to allow native form submission */}
      {name && selectedValues.map(val => (
        <input key={val} type="hidden" name={name} value={val} />
      ))}
    </div>
  );
}
