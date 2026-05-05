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
  disabled = false,
  readOnly = false,
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && togglePassword ? (show ? "text" : "password") : type;
  const inputValue = value === null || value === undefined ? "" : value;
  const computedReadOnly = readOnly || (!onChange && (value !== undefined));

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[10px] font-bold uppercase tracking-widest text-brand/40 ml-4">{label}</label>}
      <div className="relative">
        <input
          name={name}
          type={inputType}
          value={inputValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={computedReadOnly}
          className={`vw-input ${togglePassword && isPassword ? "pr-14" : ""} ${
            error ? "!border-red-500" : ""
          } ${className}`}
        />
        {togglePassword && isPassword && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand/40 hover:text-brand transition-colors"
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
      {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-4">{error}</p>}
    </div>
  );
}
