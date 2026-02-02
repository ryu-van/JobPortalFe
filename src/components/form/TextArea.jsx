export default function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  maxLength,
  showCount = false,
  disabled = false,
  className = "",
}) {
  const inputValue = value === null || value === undefined ? "" : value;
  const count = typeof inputValue === "string" ? inputValue.length : 0;

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="relative">
        <textarea
          name={name}
          value={inputValue}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg resize-y focus:ring-2 focus:border-transparent outline-none transition ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"} ${className}`}
        />
        {showCount && maxLength && (
          <div className="absolute bottom-2 right-3 text-xs text-gray-500">
            {count}/{maxLength}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
