import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import { getTenantPlans } from "../services/tenant-plan";
import Loading from "../components/loading";
import MainLayout from "../layouts/main-layout";
import TenantPlanForm from "../components/tenant-plans/tenant-plan-form";
import TenantPlanUpdateForm from "../components/tenant-plans/tenant-plan-update-form";
import TenantPlanCard from "../components/tenant-plans/tenant-plan-card";
import BlackButton from "../components/buttons/black-button";
import { useTranslation } from "react-i18next";

export default function TenantPlans() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const [openCreateForm, setOpenCreateForm] = useState(false);
  const [openUpdateForm, setOpenUpdateForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const {
    data: plans = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getTenantPlans"],
    queryFn: () => getTenantPlans(),
  });

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setOpenUpdateForm(true);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="w-full max-w-6xl mt-12">
          <button
            onClick={() => setLocation(`/`)}
            className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
          >
            <IoArrowBack color="#fc697b" />
            {t("common.back")}
          </button>

          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {t("tenantPages.accessError")}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mt-12">
        <button
          onClick={() => setLocation(`/`)}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
        >
          <IoArrowBack color="#fc697b" />
          {t("common.back")}
        </button>

        <div className=" mb-6 flex flex-col gap-3 min-[900px]:gap-5">
          <h1 className="text-[33px] min-[900px]:text-5xl font-bold">
            {t("tenantPages.tenantPlans.title")}
          </h1>
          <div className="flex max-[900px]:flex-col justify-between gap-3 min-[900px]:items-center">
            <p className="text-gray-500">
              {t("tenantPages.tenantPlans.description")}
            </p>
            <BlackButton
              text={t("tenantPages.tenantPlans.new")}
              onClick={() => setOpenCreateForm(true)}
              textSmall={true}
              wfit={true}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <TenantPlanCard key={plan.id} plan={plan} onEdit={handleEdit} />
            ))
          ) : (
            <div className="col-span-full border border-gray-400 rounded-lg py-16 text-center">
              <h3 className="text-xl font-semibold">
                {t("tenantPages.tenantPlans.emptyTitle")}
              </h3>
              <p className="text-gray-500 mt-2 mb-6">
                {t("tenantPages.tenantPlans.emptyDescription")}
              </p>

              <button
                onClick={() => setOpenCreateForm(true)}
                className="bg-[#333] text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer"
              >
                {t("tenantPages.tenantPlans.create")}
              </button>
            </div>
          )}
        </div>

        {openCreateForm && (
          <TenantPlanForm close={() => setOpenCreateForm(false)} />
        )}

        {openUpdateForm && selectedPlan && (
          <TenantPlanUpdateForm
            planId={selectedPlan.id}
            plan={selectedPlan}
            close={() => setOpenUpdateForm(false)}
          />
        )}
      </div>
    </MainLayout>
  );
}
