export default function ColorButton({
  text,
  img,
  onClick,
  wfit,
  textSmall,
  type,
  disabled,
  bgColor,
  textColor,
  hoverColor,
  disabledColor,
}) {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      style={{
        backgroundColor: disabled ? disabledColor : bgColor,
        color: textColor,
      }}
      className={`
        px-4.5 rounded-xl
        transition-all duration-200
        cursor-pointer
        flex justify-center items-center gap-1
        ${wfit ? "w-fit" : "w-full"}
        ${textSmall ? "text-[15px] py-1.75" : "text-xl py-2"}
      `}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = bgColor;
        }
      }}
    >
      {img}
      {text}
    </button>
  );
}
