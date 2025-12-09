export default function BrandButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  fullWidth = true,
}) {
  const widthClass = fullWidth ? "w-full" : "w-auto";
  const base =
    `${widthClass} py-3 md:py-4 rounded-xl font-semibold text-[#FCFBF1] shadow-lg transition-all transform hover:scale-105 bg-gradient-to-r from-[#27592D] to-[#27592D] hover:from-[#27592D] hover:to-[#27592D] disabled:opacity-60 disabled:cursor-not-allowed`;

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${base} ${className}`}
    >
      {children}
    </button>
  );
}
