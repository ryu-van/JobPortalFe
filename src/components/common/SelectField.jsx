import React from "react";

export default function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Chọn...",
  theme = "primary", 
  className = "",
  error,
  disabled = false,
}) {
  const themeColor =
    theme === "secondary" ? "#788D7C" : "#5A7B4B";
  const borderColor =
    theme === "secondary" ? "#C7A59D" : "#C7A59D";

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-disabled={disabled}
          className={`w-full appearance-none px-5 py-3 border rounded-xl bg-white/70 text-gray-700 focus:ring-2 outline-none transition duration-200 ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
            focus:ring-[${themeColor}] focus:border-[${borderColor}] ${error ? "border-red-500" : "border-[#C7A59D]/40"} ${className}`}
        >
          <option value="" disabled className="text-gray-400">
            {placeholder}
          </option>

          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className={`bg-[#F9F9F4] hover:bg-[#E7E4DC] text-[${themeColor}]`}
            >
              {opt.icon && <span className="mr-2">{opt.icon}</span>}
              {opt.label}
            </option>
          ))}
        </select>

        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5A7B4B] pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
