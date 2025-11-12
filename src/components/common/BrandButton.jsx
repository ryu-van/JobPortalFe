import { motion } from "framer-motion";

export default function BrandButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) {
  const base =
    "w-full py-3 md:py-4 rounded-xl font-semibold text-[#FCFBF1] shadow-lg transition-all transform hover:scale-105 bg-gradient-to-r from-[#27592D] to-[#27592D] hover:from-[#27592D] hover:to-[#27592D] disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${base} ${className}`}
    >
      {children}
    </motion.button>
  );
}