import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import MainLayout from "../layouts/main-layout";
import { useLocation } from "wouter";
import { getInvitationInfo, acceptInvitation } from "../services/invitation";
import ErrorModal from "../components/modals/error-modal";
import SuccessModal from "../components/modals/success-modal";
import Loading from "../components/loading";
import { getStudentPlans } from "../services/student-plan";

export default function Invitation({ token }) {
  const [, setLocation] = useLocation();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  // Obtener información de la invitación
  const { data: invitation, isLoading: invitationLoading } = useQuery({
    queryKey: ["getInvitationInfo", token],
    queryFn: () => getInvitationInfo(token),
  });

  // Obtener planes si es estudiante
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["getStudentPlans", invitation?.tenantId],
    queryFn: () => getStudentPlans(invitation?.tenantId),
    enabled: invitation?.role === "Student",
  });

  const mutation = useMutation({
    mutationFn: () =>
      acceptInvitation(token, {
        studentPlanId: invitation?.role === "Student" ? selectedPlan : null,
      }),

    onSuccess: () => {
      setSuccessMessage("Te uniste correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        setLocation("/");
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al aceptar la invitación";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const handleAccept = () => {
    if (invitation?.role === "Student" && !selectedPlan) {
      setBackendError("Debes seleccionar un plan");
      setErrorModal(true);
      return;
    }

    mutation.mutate();
  };

  if (invitationLoading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full max-w-md mx-auto mt-20">
        <div className="border rounded-2xl shadow-lg p-8 bg-white">
          <h1 className="text-3xl font-bold text-center mb-2">Invitación</h1>

          <p className="text-gray-500 text-center mb-8">
            Te han invitado a unirte a un negocio
          </p>

          <div className="space-y-6">
            {/* Información de la invitación */}
            <div className="bg-[#efefef] rounded-xl p-5">
              <p className="text-sm text-gray-600 mb-2">Negocio</p>
              <h2 className="text-2xl font-bold text-[#333]">
                {invitation?.tenantName}
              </h2>
            </div>

            <div className="bg-[#efefef] rounded-xl p-5">
              <p className="text-sm text-gray-600 mb-2">Rol</p>
              <p className="text-lg font-semibold text-[#333]">
                {invitation?.role === "Student" ? "Alumno" : "Profesor"}
              </p>
            </div>

            <div className="bg-[#efefef] rounded-xl p-5">
              <p className="text-sm text-gray-600 mb-2">Válido hasta</p>
              <p className="text-lg font-semibold text-[#333]">
                {new Date(invitation?.expirationDate).toLocaleDateString(
                  "es-AR",
                )}
              </p>
            </div>

            {/* Selector de plan para estudiantes */}
            {invitation?.role === "Student" && (
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Selecciona un plan
                </label>

                {plansLoading ? (
                  <p className="text-gray-500">Cargando planes...</p>
                ) : plans.length > 0 ? (
                  <div className="space-y-2">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                          selectedPlan === plan.id
                            ? "border-[#333] bg-[#efefef]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-[#333]">
                              {plan.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {plan.classesPerMonth} clases/mes
                            </p>
                          </div>
                          <p className="font-bold text-[#333]">
                            ${plan.price.toLocaleString("es-AR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay planes disponibles</p>
                )}
              </div>
            )}

            {/* Botones */}
            <div className="space-y-2">
              <button
                onClick={handleAccept}
                disabled={mutation.isPending}
                className="w-full bg-[#333] text-white rounded-xl py-3 font-semibold hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
              >
                {mutation.isPending ? "Aceptando..." : "Aceptar invitación"}
              </button>

              <button
                onClick={() => setLocation("/")}
                className="w-full bg-gray-200 text-[#333] rounded-xl py-3 font-semibold hover:bg-gray-300 transition cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}

      {successModal && (
        <SuccessModal
          close={() => setSuccessModal(false)}
          message={successMessage}
          isSuccesOrError={true}
        />
      )}
    </MainLayout>
  );
}
