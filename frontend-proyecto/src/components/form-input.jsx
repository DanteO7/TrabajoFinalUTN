export default function FormInput({
  label,
  id,
  type = "text",
  placeholder,
  register,
  error,
  disabled = false,
}) {
  return (
    <div>
      {label == null ? (
        <></>
      ) : (
        <div className="mb-2 block">
          <label className="text-black" htmlFor={id}>
            {label}
          </label>
        </div>
      )}

      <input
        className={`rounded-[13px] px-3 py-2 w-full border-gray-200 border-[1.7px] bg-[#efefef] ${
          error ? "border-red-500" : ""
        }`}
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}
