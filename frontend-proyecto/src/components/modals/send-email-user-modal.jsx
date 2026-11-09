import Modal from "./modal";
import { Mail, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SendEmailUserModal({
  close,
  onConfirm,
  isPending,
  error,
}) {
  const { t } = useTranslation();
  return (
    <Modal open={true} onClose={close} isSuccesOrError>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition duration-200 cursor-pointer"
        aria-label={t("sendEmailUser.close")}
      >
        <X size={20} />
      </button>

      <div className="bg-[#5f7de9] flex justify-center py-10">
        <Mail className="text-white" size={80} />
      </div>

      <div className="flex flex-col items-center justify-center text-center px-6 sm:px-10 gap-3 my-6">
        <h4 className="font-semibold text-2xl">
          {t("sendEmailUser.title")}
        </h4>

        <p className="text-base text-gray-700">
          {t("sendEmailUser.description")}
        </p>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <button
            type="button"
            onClick={close}
            disabled={isPending}
            className="rounded-lg px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
          >
            {t("sendEmailUser.notNow")}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-lg px-6 py-3 bg-[#5f7de9] text-white hover:bg-[#5273e8] transition cursor-pointer disabled:opacity-50"
          >
            {isPending
              ? t("sendEmailUser.sending")
              : t("sendEmailUser.send")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
