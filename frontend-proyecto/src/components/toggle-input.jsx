export default function ToggleInput({ state, setState, text, gap }) {
  return (
    <div
      onClick={() => setState(!state)}
      className={`flex  items-center cursor-pointer font-semibold gap-${gap}`}
    >
      <p>{text}</p>
      <div
        className={`${state ? "bg-[#fa7282]" : "bg-gray-400"} p-1 rounded-full w-12 transition-all duration-200`}
      >
        <div
          className={`bg-white rounded-full w-5 h-5 transition-all duration-200 ${state ? "translate-x-5" : "translate-x-0"} `}
        ></div>
      </div>
    </div>
  );
}
