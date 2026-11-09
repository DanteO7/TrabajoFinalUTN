import MainLayout from "../layouts/main-layout";
import { IoArrowBack } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { formatDate } from "../utils/formatting";

export default function Legal() {
  const { t } = useTranslation();
  const handleBack = () => {
    window.history.back();
  };

  return (
    <MainLayout>
      <div className="lg:w-[60%] m-auto mt-12">
        <button
          onClick={handleBack}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer "
        >
          <IoArrowBack color="#fc697b" />
          {t("common.back")}
        </button>

        <h2 className="text-4xl font-semibold">{t("legal.title")}</h2>
        <span className="text-gray-600 text-[13px] my-20">
          {t("common.lastUpdated", {
            date: formatDate("2026-07-08T12:00:00Z", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            }),
          })}
        </span>
        <div className="my-7">
          <h3 className="font-semibold text-xl">{t("legal.siteOwner")}</h3>
          <p>{t("legal.siteDescription")}</p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">{t("legal.intellectualProperty")}</h3>
          <p>{t("legal.intellectualPropertyText")}</p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">{t("legal.use")}</h3>
          <p>{t("legal.useText")}</p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">{t("legal.externalLinks")}</h3>
          <p>{t("legal.externalLinksText")}</p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">{t("legal.liability")}</h3>
          <p>{t("legal.liabilityText")}</p>
        </div>
        <div className="mt-7">
          <h3 className="font-semibold text-xl">{t("legal.applicableLaw")}</h3>
          <p>{t("legal.applicableLawText")}</p>
        </div>
      </div>
    </MainLayout>
  );
}
