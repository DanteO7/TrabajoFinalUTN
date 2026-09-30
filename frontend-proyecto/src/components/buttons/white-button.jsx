export default function WhiteButton({
  text,
  img,
  onClick,
  wfit,
  textSmall,
  type,
  disabled,
}) {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`bg-[#f3f0f5] text-[#333] px-4.5 rounded-lg shadow-md border-b border-gray-300 hover:bg-[#eae6eb] transition-all duration-200 cursor-pointer flex justify-center items-center gap-1 ${wfit ? "w-fit" : "w-full"} ${textSmall ? "text-[15px] py-1.75 " : "text-xl py-2"}`}
    >
      {img}
      {text}
    </button>
  );
}
