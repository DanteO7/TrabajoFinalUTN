import { IoArrowBack } from "react-icons/io5";
import MainLayout from "../layouts/main-layout";
import { useTranslation } from "react-i18next";
import { formatDate } from "../utils/formatting";

export default function Terms() {
  const { t } = useTranslation();
  const handleBack = () => {
    window.history.back();
  };

  return (
    <MainLayout>
      <div className="lg:w-[60%] mt-12">
        <button
          onClick={handleBack}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer "
        >
          <IoArrowBack color="#fc697b" />
          {t("common.back")}
        </button>
        <h2 className="text-4xl font-semibold">{t("terms.title")}</h2>
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
        <h3 className="font-semibold text-xl mt-4">
          {t("terms.intro")}
        </h3>
        <div className="my-7">
          <h3 className="font-semibold text-xl">{t("terms.subjectTitle")}</h3>
          <p>{t("terms.subjectText")}</p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">{t("terms.registrationTitle")}</h3>
          <p>{t("terms.registrationText")}</p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">{t("terms.allowedTitle")}</h3>
          <p>{t("terms.allowedText")}</p>
          <p>{t("terms.prohibitedIntro")}</p>
          <ul className="list-disc ml-7">
            <li>{t("terms.prohibitedAccess")}</li>
            <li>{t("terms.prohibitedAlter")}</li>
            <li>{t("terms.prohibitedIllegal")}</li>
          </ul>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">
            {t("terms.informationTitle")}
          </h3>
          <p>{t("terms.informationText")}</p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">{t("terms.availabilityTitle")}</h3>
          <p>{t("terms.availabilityText")}</p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">{t("terms.changesTitle")}</h3>
          <p>{t("terms.changesText")}</p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">{t("terms.accountRemovalTitle")}</h3>
          <p>{t("terms.accountRemovalText")}</p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">
            {t("terms.liabilityTitle")}
          </h3>
          <p>{t("terms.liabilityText")}</p>
        </div>
        <div className="mt-7">
          <h3 className="font-semibold text-xl">{t("terms.contactTitle")}</h3>
          <p>{t("terms.contactText")}</p>
        </div>
      </div>
    </MainLayout>
  );
}
