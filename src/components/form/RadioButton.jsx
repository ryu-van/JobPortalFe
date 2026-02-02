export default function RadioButton({
  name,
  value,
  label,
  checked = false,
  onChange,
  disabled = false,
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-xl border text-sm font-medium transition select-none";
  const active =
    "border-[#27592D] bg-[#27592D] text-white shadow-sm";
  const inactive =
    "border-gray-300 bg-white text-gray-700 hover:bg-gray-50";
  const disabledCls =
    "opacity-60 cursor-not-allowed";

  const stateClass = `${checked ? active : inactive} ${
    disabled ? disabledCls : ""
  }`;

  return (
    <label className={`cursor-pointer ${disabled ? "cursor-not-allowed" : ""}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={disabled ? () => {} : onChange}
        className="hidden"
      />
      <span className={`${base} ${stateClass} ${className}`}>
        {label}
      </span>
    </label>
  );
}
