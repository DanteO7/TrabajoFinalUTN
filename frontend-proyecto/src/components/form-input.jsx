import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function FormInput({
  label,
  id,
  type = "text",
  placeholder,
  register,
  error,
  disabled = false,
}) {
  const [show, setShow] = useState(false);

  const isPassword = type === "password";

  return (
    <div>
      {label && (
        <div className="mb-2 block">
          <label className="text-black" htmlFor={id}>
            {label}
          </label>
        </div>
      )}

      <div className="relative">
        <input
          className={`rounded-[13px] px-3 py-2 w-full border-gray-200 border-[1.7px] bg-[#efefef] ${
            error ? "border-red-500" : ""
          } ${isPassword ? "pr-10" : ""}`}
          id={id}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          disabled={disabled}
          {...register}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-[13px] mt-1">{error.message}</p>
      )}
    </div>
  );
}
