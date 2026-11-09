import Modal from "./modal";
import { MdOutlineEmail } from "react-icons/md";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function EmailSentModal({
  close,
  email,
  isSuccesOrError,
  sendAgain,
  seconds,
}) {
  const { t } = useTranslation();
  return (
    <Modal open={true} onClose={close} isSuccesOrError={isSuccesOrError}>
      <button
        onClick={close}
        aria-label={t("common.close")}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>
      <div className="bg-[#5f7de9] flex justify-center py-10">
        <MdOutlineEmail className="text-white" size={80} />
      </div>
      <div className="flex flex-col items-center justify-center text-center px-10 gap-2 my-5">
        <h4 className="font-semibold text-2xl mb-1">
          {t("emailSent.title")}
        </h4>
        <p className="text-xl">
          {t("emailSent.message", { email })}
        </p>
        <div className="flex flex-col my-4 gap-2">
          <span>{t("emailSent.didNotArrive")}</span>
          <button
            onClick={sendAgain}
            disabled={seconds > 0}
            className={`text-xl rounded-4xl px-7 py-3 transition-colors duration-200 ${
              seconds > 0
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-[#5f7de9] text-white hover:bg-[#5273e8] cursor-pointer"
            }`}
          >
            {seconds > 0
              ? t("emailSent.resendIn", { seconds })
              : t("emailSent.sendAgain")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
