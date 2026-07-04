import { useQuery } from "@tanstack/react-query";
import { getTenantPlans } from "../../services/tenant-plan";
import PlanCard from "./plan-card";
import { useAuthStore } from "../../store/auth-store";

export default function TenantPlans({
  onOpenModal,
  onSelectedPlan,
  openForbiddenModal,
}) {
  const { isAuthenticated } = useAuthStore();

  const { data: tenantsPlan, isLoading } = useQuery({
    queryKey: ["tenantsPlan"],
    queryFn: getTenantPlans,
  });

  if (isLoading) return <p>Cargando...</p>;

  return (
    <section className="flex flex-col justify-center items-center w-full gap-5">
      <h2 className="text-3xl font-semibold">Precios</h2>
      <p className="text-center">
        Precios expresados en Pesos y sólo válidos para la República Argentina.
        Consultar por otros países.
      </p>
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
