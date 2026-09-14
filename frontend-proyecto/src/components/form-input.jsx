import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function FormInput({
  label,
  id,
  type = "text",
  placeholder,
  register,
  error,
  disabled,
  value,
  isPassword = false,
  textarea = false,
  rows = 4,
}) {
  const [show, setShow] = useState(false);

  const inputClassName = `rounded-[13px] text-[15px] px-3 py-2 w-full border-gray-300 border-[1.7px] bg-[#efefef] ${
    error ? "border-red-500" : ""
  } ${isPassword ? "pr-10" : ""}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {textarea ? (
          <textarea
            className={`${inputClassName} resize-none`}
            id={id}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            {...register}
            value={value}
          />
        ) : (
          <input
            className={inputClassName}
            id={id}
            type={isPassword ? (show ? "text" : "password") : type}
            placeholder={placeholder}
            disabled={disabled}
            {...register}
            value={value}
          />
        )}

        {isPassword && !textarea && (
          <button
            type="button"
            onClick={() => setShow((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}
