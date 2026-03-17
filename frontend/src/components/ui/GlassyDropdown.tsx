import { memo, useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface GlassyDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  isMobile?: boolean;
}

const GlassyDropdown = memo(({ value, options, onChange, isMobile = false }: GlassyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || options[0].label;

  return (
    <div className={`relative ${isMobile ? "flex-1" : ""}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 bg-text-main/5 backdrop-blur-md border border-text-main/10 shadow-sm text-text-main text-sm rounded-xl outline-none hover:bg-text-main/10 focus:ring-2 focus:ring-text-main/20 transition-all duration-300 ${
          isMobile ? "px-3 py-3" : "px-3 py-1.5"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <div 
          className={`absolute left-0 mt-2 min-w-[140px] w-full bg-nav/70 backdrop-blur-xl border border-text-main/10 rounded-xl shadow-2xl py-1.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 ${
            isMobile ? "bottom-full mb-2 mt-0" : "top-full"
          }`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                value === opt.value
                  ? "bg-text-main/15 text-text-main font-semibold"
                  : "text-text-muted hover:bg-text-main/10 hover:text-text-main"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

GlassyDropdown.displayName = "GlassyDropdown";

export default GlassyDropdown;