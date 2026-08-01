import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Loading from "../../components/loading";
import StudentPlanCard from "../../components/students-plan/student-plan-card";
import StudentPlanForm from "../../components/students-plan/student-plan-form";
import StudentPlanUpdateForm from "../../components/students-plan/student-plan-update-form";
import { getStudentPlans } from "../../services/student-plan";
import MainLayout from "../../layouts/main-layout";

export default function StudentPlans({ tenantId }) {
  const [openCreateForm, setOpenCreateForm] = useState(false);
  const [openUpdateForm, setOpenUpdateForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["getStudentPlans", tenantId],
    queryFn: () => getStudentPlans(tenantId),
  });

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setOpenUpdateForm(true);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Planes de alumno</h2>

          <button
            onClick={() => setOpenCreateForm(true)}
            className="bg-[#333] text-white px-5 py-2 rounded-xl hover:bg-gray-700 transition cursor-pointer"
          >
            + Nuevo plan
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <StudentPlanCard
                key={plan.id}
                plan={plan}
                tenantId={tenantId}
                onEdit={handleEdit}
              />
            ))
          ) : (
            <div className="col-span-full border rounded-xl py-16 text-center">
              <h3 className="text-xl font-semibold">No hay planes</h3>
              <p className="text-gray-500 mt-2 mb-6">
                Creá un nuevo plan para comenzar.
              </p>

              <button
                onClick={() => setOpenCreateForm(true)}
                className="bg-[#333] text-white px-5 py-2 rounded-xl hover:bg-gray-700 transition cursor-pointer"
              >
                + Crear plan
              </button>
            </div>
          )}
        </div>

        {openCreateForm && (
          <StudentPlanForm
            tenantId={tenantId}
            close={() => setOpenCreateForm(false)}
          />
        )}

        {openUpdateForm && selectedPlan && (
          <StudentPlanUpdateForm
            planId={selectedPlan.id}
            tenantId={tenantId}
            plan={selectedPlan}
            close={() => setOpenUpdateForm(false)}
          />
        )}
      </div>
    </MainLayout>
  );
}
