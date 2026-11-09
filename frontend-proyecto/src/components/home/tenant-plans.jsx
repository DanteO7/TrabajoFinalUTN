import { useQuery } from "@tanstack/react-query";
import { getTenantPlans } from "../../services/tenant-plan";
import PlanCard from "./plan-card";
import { useAuthStore } from "../../store/auth-store";
import Loading from "../loading";
import { useTranslation } from "react-i18next";

export default function TenantPlans({
  onOpenModal,
  onSelectedPlan,
  openForbiddenModal,
}) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  const { data: tenantsPlan, isLoading } = useQuery({
    queryKey: ["tenantsPlan"],
    queryFn: getTenantPlans,
  });

  if (isLoading) return <Loading />;

  return (
    <section className="flex flex-col justify-center items-center w-full gap-5">
      <h2 className="text-3xl font-semibold">{t("publicSite.pricingTitle")}</h2>
      <p className="text-center">{t("publicSite.pricingDescription")}</p>
      <div className="flex flex-col justify-center items-center w-full gap-10 md:flex-row">
        {tenantsPlan?.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onOpenModal={isAuthenticated ? onOpenModal : openForbiddenModal}
            onSelectedPlan={onSelectedPlan}
          />
        ))}
      </div>
    </section>
  );
}
