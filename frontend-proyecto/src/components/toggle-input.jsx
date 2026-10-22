export default function ToggleInput({
  state,
  setState,
  text,
  gap,
  disabled = false,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={state}
      disabled={disabled}
      onClick={() => setState(!state)}
      className={`flex items-center font-semibold gap-${gap} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span>{text}</span>
      <div
        className={`${state ? "bg-[#fa7282]" : "bg-gray-400"} p-1 rounded-full w-12 transition-all duration-200`}
      >
        <div
          className={`bg-white rounded-full w-5 h-5 transition-all duration-200 ${state ? "translate-x-5" : "translate-x-0"} `}
        ></div>
      </div>
    </button>
  );
}
