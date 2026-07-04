import { useTranslation } from "react-i18next";
import { usePreferencesStore } from "../store/preferences-store";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";

export default function LanguageSelector() {
  const { t } = useTranslation();
  const { language, setLanguage } = usePreferencesStore();
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className="relative justify-self-end w-fit">
      <div className="flex items-center gap-2">
        <p>{t("header.language")}:</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
          className="cursor-pointer px-3 py-2 rounded-xl bg-[#ace1f6] dark:bg-[#131934]"
        >
          {language === "en" ? "Inglés (EN)" : "Español (ES)"}
        </button>
      </div>

      {open && (
        <div className="absolute z-50 -right-3 rounded-lg overflow-hidden bg-[#ace1f6] dark:bg-[#131934] shadow-lg">
          <button
            onClick={() => {
              setLanguage("es");
              setOpen(false);
            }}
            className="block cursor-pointer px-4 w-full py-2 hover:bg-[#9ad5ec] dark:hover:bg-[#0d132c]"
          >
            Español (ES)
          </button>
          <button
            onClick={() => {
              setLanguage("en");
              setOpen(false);
            }}
            className="block cursor-pointer px-4 py-2 hover:bg-[#9ad5ec] dark:hover:bg-[#0d132c]"
          >
            Ingles (EN)
          </button>
        </div>
      )}
    </div>
  );
}
