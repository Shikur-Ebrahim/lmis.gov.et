import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder, name, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl border bg-white ${error ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left shadow-sm ${!value ? 'text-gray-500' : 'text-gray-900 font-medium'}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
          <ul className="max-h-64 overflow-y-auto py-2">
            {options.map((option, index) => (
              <li
                key={index}
                onClick={() => handleSelect(option.value)}
                className={`flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-all ${
                  value === option.value
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:pl-5'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-blue-600 animate-in zoom-in" />}
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">No options available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
