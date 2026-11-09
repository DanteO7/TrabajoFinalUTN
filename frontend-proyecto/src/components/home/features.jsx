import {
  Users,
  Calendar,
  CreditCard,
  FileText,
  BarChart,
  Zap,
} from "lucide-react";
import FeatureCard from "./feature-card";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation();
  return (
    <section>
      <h2 className="text-center font-semibold text-3xl">{t("home.featuresTitle")}</h2>
      <div className="flex flex-col gap-14 mt-14 md:flex-row md:flex-wrap md:justify-center">
        <FeatureCard
          icon={Users}
          title={t("home.features.customersTitle")}
          text={t("home.features.customers")}
        />
        <FeatureCard
          icon={Calendar}
          title={t("home.features.appointmentsTitle")}
          text={t("home.features.appointments")}
        />
        <FeatureCard
          icon={CreditCard}
          title={t("home.features.paymentsTitle")}
          text={t("home.features.payments")}
        />
        <FeatureCard
          icon={FileText}
          title={t("home.features.reportsTitle")}
          text={t("home.features.reports")}
        />
        <FeatureCard
          icon={BarChart}
          title={t("home.features.statisticsTitle")}
          text={t("home.features.statistics")}
        />
        <FeatureCard
          icon={Zap}
          title={t("home.features.automationTitle")}
          text={t("home.features.automation")}
        />
      </div>
    </section>
  );
}
