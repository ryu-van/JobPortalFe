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
  size = "md",
  disabled = false,
}) {
  const themeColor =
    theme === "secondary" ? "#788D7C" : "#5A7B4B";
  const borderColor =
    theme === "secondary" ? "#C7A59D" : "#C7A59D";
  const sizeCls = size === "sm" ? "py-2 rounded-lg text-sm" : "py-3 rounded-xl text-sm";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-brand/40 ml-4">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`vw-input appearance-none !px-5 ${error ? "!border-red-500" : ""} ${className}`}
        >
          <option value="" disabled className="text-brand/40">
            {placeholder}
          </option>

          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-white text-brand"
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* Icon mũi tên xuống */}
        <svg
          className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/40 pointer-events-none"
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
      {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-4">{error}</p>}
    </div>
  );
}
