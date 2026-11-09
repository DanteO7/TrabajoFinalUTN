import { IoArrowBack } from "react-icons/io5";
import MainLayout from "../layouts/main-layout";
import { useTranslation } from "react-i18next";
import { formatDate } from "../utils/formatting";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div>
      <MainLayout>
        <div className="lg:w-[60%] mt-12">
          <button
            onClick={handleBack}
            className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer "
          >
            <IoArrowBack color="#fc697b" />
            {t("common.back")}
          </button>
          <h2 className="text-4xl font-semibold">{t("privacyPolicy.title")}</h2>
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
            {t("privacyPolicy.intro")}
          </h3>
          <div className="my-7">
            <h3 className="font-semibold text-xl">
              {t("privacyPolicy.informationTitle")}
            </h3>
            <p>{t("privacyPolicy.informationIntro")}</p>
            <ul className="list-disc ml-7">
              <li>{t("privacyPolicy.name")}</li>
              <li>{t("privacyPolicy.email")}</li>
              <li>{t("privacyPolicy.password")}</li>
              <li>{t("privacyPolicy.businessData")}</li>
              <li>{t("privacyPolicy.userData")}</li>
            </ul>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">{t("privacyPolicy.useTitle")}</h3>
            <p>{t("privacyPolicy.useIntro")}</p>
            <ul className="list-disc ml-7">
              <li>{t("privacyPolicy.manageAccounts")}</li>
              <li>{t("privacyPolicy.platformAccess")}</li>
              <li>{t("privacyPolicy.manageBusinesses")}</li>
              <li>{t("privacyPolicy.emails")}</li>
              <li>{t("privacyPolicy.improveService")}</li>
            </ul>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">{t("privacyPolicy.sharingTitle")}</h3>
            <p>{t("privacyPolicy.sharingText")}</p>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">{t("privacyPolicy.securityTitle")}</h3>
            <p>{t("privacyPolicy.securityText")}</p>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">{t("privacyPolicy.retentionTitle")}</h3>
            <p>{t("privacyPolicy.retentionText")}</p>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">{t("privacyPolicy.rightsTitle")}</h3>
            <p>{t("privacyPolicy.rightsIntro")}</p>
            <ul className="list-disc ml-7">
              <li>{t("privacyPolicy.accessData")}</li>
              <li>{t("privacyPolicy.correctData")}</li>
              <li>{t("privacyPolicy.deleteData")}</li>
            </ul>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">{t("privacyPolicy.cookiesTitle")}</h3>
            <p>{t("privacyPolicy.cookiesText")}</p>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">
              {t("privacyPolicy.changesTitle")}
            </h3>
            <p>{t("privacyPolicy.changesText")}</p>
          </div>
          <div className="mt-7">
            <h3 className="font-semibold text-xl">{t("privacyPolicy.contactTitle")}</h3>
            <p>{t("privacyPolicy.contactText")}</p>
          </div>
        </div>
      </MainLayout>
    </div>
  );
}
