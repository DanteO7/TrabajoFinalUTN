export default function RedButton({
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
      className={`bg-red-500 text-[#efefef] px-4.5 rounded-xl hover:bg-red-600 transition-all duration-200 cursor-pointer flex justify-center items-center gap-1 ${wfit ? "w-fit" : "w-full"} ${textSmall ? "text-[16px] py-1.75" : "text-xl py-2"}`}
    >
      {img}
      {text}
    </button>
  );
}
