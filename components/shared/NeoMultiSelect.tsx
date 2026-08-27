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
              className={`p-3 rounded-xl border-2 text-sm font-bold transition-all text-right flex items-center justify-between group ${
                isSelected
                  ? "bg-sky-50 border-sky-500 text-sky-800 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-sky-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex flex-col">
                <span>{option.label}</span>
                {option.subLabel && (
                  <span className={`text-xs mt-1 ${isSelected ? "text-sky-600/80" : "text-slate-400"}`}>
                    {option.subLabel}
                  </span>
                )}
              </div>
              {isSelected ? (
                 <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
              ) : (
                 <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-sky-300 transition-colors shrink-0" />
              )}
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
