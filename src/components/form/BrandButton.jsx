import React from "react";

/**
 * A versatile button component following the Modern Editorial design system.
 * Supports variants: primary, secondary, ghost, danger.
 */
export default function BrandButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary", // primary | secondary | ghost | danger
  size = "md",         // sm | md | lg
  fullWidth = false,
  loading = false,
}) {
  const variantClasses = {
    primary: "vw-btn-primary",
    secondary: "vw-btn-secondary",
    ghost: "vw-btn-ghost",
    danger: "vw-btn-danger",
  };

  const sizeClasses = {
    sm: "px-6 !min-h-[40px] !text-[10px]",
    md: "px-10 h-14 min-h-[56px]",
    lg: "px-12 py-4",
  };

  const base = `vw-btn ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${fullWidth ? "w-full" : "w-auto"} ${loading ? "opacity-70 cursor-not-allowed" : ""} ${className}`;

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      className={base}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
