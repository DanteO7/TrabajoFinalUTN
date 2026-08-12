export default function BlackButton({ text, img, onClick, wfit, textSmall }) {
  return (
    <button
      onClick={onClick}
      className={`bg-[#333] text-[#efefef] px-4.5 rounded-xl hover:bg-[#222] transition-all duration-200 cursor-pointer ${wfit ? "w-fit" : "w-full"} ${textSmall ? "text-[16px] py-1" : "text-xl py-2"}`}
    >
      {img}
      {text}
    </button>
  );
}
