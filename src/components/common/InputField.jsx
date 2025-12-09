import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  name,
  placeholder,
  error,
  className = "",
  togglePassword = false,
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && togglePassword ? (show ? "text" : "password") : type;
  const inputValue = value === null || value === undefined ? "" : value;

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="relative">
        <input
          name={name}
          type={inputType}
          value={inputValue}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2 ${togglePassword && isPassword ? "pr-14" : ""} border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
            error ? "border-red-500" : "border-gray-300"
          } ${className}`}
        />
        {togglePassword && isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A7B4B]"
            aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            onClick={() => setShow(!show)}
          >
            {show ? (
              <EyeOff className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Eye className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
