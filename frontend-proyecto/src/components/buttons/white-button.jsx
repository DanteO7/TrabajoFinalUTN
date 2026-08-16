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
      className={`bg-[#dddddd] text-[#333] px-4.5 rounded-xl hover:bg-[#d4d4d4] transition-all duration-200 cursor-pointer flex justify-center items-center gap-1 ${wfit ? "w-fit" : "w-full"} ${textSmall ? "text-[16px] py-1.75 " : "text-xl py-2"}`}
    >
      {img}
      {text}
    </button>
  );
}
