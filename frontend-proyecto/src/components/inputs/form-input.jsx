import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const resizeTextarea = (textarea) => {
  if (!textarea) return;

  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};

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
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textarea) {
      resizeTextarea(textareaRef.current);
    }
  }, [textarea, value, rows]);

  const textareaRegister = register
    ? {
        ...register,
        ref: (element) => {
          textareaRef.current = element;
          register.ref?.(element);
        },
        onChange: (event) => {
          register.onChange?.(event);
          resizeTextarea(event.currentTarget);
        },
      }
    : {
        ref: (element) => {
          textareaRef.current = element;
        },
        onChange: (event) => resizeTextarea(event.currentTarget),
      };

  const inputClassName = `rounded-lg text-[15px] px-3 py-2 w-full border-gray-400 border bg-[#f1eef3] ${
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
            className={`${inputClassName} resize-none overflow-y-hidden`}
            id={id}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            {...textareaRegister}
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
