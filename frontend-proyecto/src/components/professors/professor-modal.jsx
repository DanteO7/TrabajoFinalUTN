import { X, Pencil, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import Modal from "../modals/modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateProfessor, deleteProfessor } from "../../services/professor";
import { getSpecialities } from "../../services/speciality";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { useTenantStore } from "../../store/tenant-store";
import ConfirmModal from "../modals/confirm-modal";
import RedButton from "../buttons/red-button";
import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";

export default function ProfessorModal({ professor, tenantId, close }) {
  const queryClient = useQueryClient();

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );

  const isTenant = userRoles?.roles?.includes("Tenant");

  const [editing, setEditing] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState(professor);

  const [isActive, setIsActive] = useState(professor.isActive);

  const [selectedSpecialityIds, setSelectedSpecialityIds] = useState(
    professor.specialities.map((spec) => spec.specialityId),
  );

  const [openSpecialityModal, setOpenSpecialityModal] = useState(false);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const { data: specialities = [] } = useQuery({
    queryKey: ["getSpecialities", tenantId],
    queryFn: () => getSpecialities(tenantId),
  });

  const startEditing = () => {
    setIsActive(currentProfessor.isActive);

    setSelectedSpecialityIds(
      currentProfessor.specialities.map((spec) => spec.specialityId),
    );

    setEditing(true);
  };

  const availableSpecialities = specialities.filter(
    (speciality) => !selectedSpecialityIds.includes(speciality.id),
  );

  const addSpeciality = (specialityId) => {
    setSelectedSpecialityIds((prev) => {
      if (prev.includes(specialityId)) {
        return prev;
      }

      return [...prev, specialityId];
    });
  };

  const removeSpeciality = (specialityId) => {
    setSelectedSpecialityIds((prev) =>
      prev.filter((id) => id !== specialityId),
    );
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteProfessor(currentProfessor.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getProfessors", tenantId],
      });

      setConfirmModal(false);

      setSuccessMessage("Profesor eliminado correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al eliminar el profesor";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setConfirmModal(false);
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProfessor(currentProfessor.id, {
        isActive,
        specialityIds: selectedSpecialityIds,
      }),

    onSuccess: (updatedProfessor) => {
      queryClient.invalidateQueries({
        queryKey: ["getProfessors", tenantId],
      });

      setCurrentProfessor(updatedProfessor);

      setIsActive(updatedProfessor.isActive);
      setSelectedSpecialityIds(
        updatedProfessor.specialities.map((spec) => spec.specialityId),
      );

      setEditing(false);

      setSuccessMessage("Profesor actualizado correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al actualizar el profesor";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);

      setIsActive(currentProfessor.isActive);

      setSelectedSpecialityIds(
        currentProfessor.specialities.map((spec) => spec.specialityId),
      );
    },
  });

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      {!editing ? (
        <>
          <h2 className="text-2xl font-semibold mb-2">
            {currentProfessor.user.name} {currentProfessor.user.surname}
          </h2>

          <p className="text-gray-600 mb-6">{currentProfessor.user.email}</p>

          <div className="space-y-4 mb-8">
            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Email</p>

              <p className="font-semibold text-[#333]">
                {currentProfessor.user.email}
              </p>
            </div>

            {currentProfessor.user.phoneNumber && (
              <div className="bg-[#efefef] rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Teléfono</p>

                <p className="font-semibold text-[#333]">
                  {currentProfessor.user.phoneNumber}
                </p>
              </div>
            )}
            {(currentProfessor.user.weight || currentProfessor.user.age) && (
              <div className="flex gap-4">
                {currentProfessor.user.age && (
                  <div className="bg-[#efefef] rounded-xl p-4 w-full">
                    <p className="text-sm text-gray-600 mb-1">Edad</p>
                    <p className="font-semibold text-[#333]">
                      {currentProfessor.user.age} Años
                    </p>
                  </div>
                )}
                {currentProfessor.user.weight && (
                  <div className="bg-[#efefef] rounded-xl p-4 w-full">
                    <p className="text-sm text-gray-600 mb-1">Peso</p>
                    <p className="font-semibold text-[#333]">
                      {currentProfessor.user.weight} Kg
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Estado</p>

              <span
                className={`inline-block text-sm font-medium rounded-full px-3 py-1 ${
                  currentProfessor.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {currentProfessor.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>

            {currentProfessor.specialities.length > 0 && (
              <div className="bg-[#efefef] rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-3">Profesiones</p>

                <div className="flex flex-wrap gap-2">
                  {currentProfessor.specialities.map((spec) => (
                    <span
                      key={spec.specialityId}
                      className="bg-[#333] text-white text-sm rounded-full px-3 py-1"
                    >
                      {spec.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isTenant && (
            <div className="flex gap-2 mt-8">
              <RedButton
                text="Eliminar"
                disabled={deleteMutation.isPending}
                onClick={() => setConfirmModal(true)}
                textSmall={true}
                img={<Trash2 size={18} />}
              />

              <BlackButton
                text="Editar"
                onClick={startEditing}
                textSmall={true}
                img={<Pencil size={18} />}
              />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Editar profesor
          </h2>
          <div>
            <label className="block text-sm font-semibold mb-3">Estado</label>

            <div className="space-y-2">
              {[true, false].map((status) => (
                <div
                  key={status.toString()}
                  onClick={() => setIsActive(status)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    isActive === status
                      ? "border-[#333] bg-[#efefef]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-[#333]">
                    {status ? "Activo" : "Inactivo"}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-3">
              Profesiones
            </label>

            {selectedSpecialityIds.length > 0 ? (
              <div className="mb-4 p-3 bg-[#efefef] rounded-xl">
                <div className="flex flex-wrap gap-2">
                  {selectedSpecialityIds.map((specialityId) => {
                    const speciality = specialities.find(
                      (s) => s.id === specialityId,
                    );

                    if (!speciality) return null;

                    return (
                      <span
                        key={specialityId}
                        className="bg-[#333] text-white text-sm rounded-full px-3 py-1 flex items-center gap-2"
                      >
                        {speciality.name}

                        <button
                          type="button"
                          onClick={() => removeSpeciality(specialityId)}
                          className="hover:text-red-300 transition cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                Este profesor no tiene profesiones asignadas.
              </p>
            )}

            <BlackButton
              text="Agregar profesiones"
              textSmall={true}
              img={<Plus size={18} />}
              onClick={() => setOpenSpecialityModal(true)}
              disabled={availableSpecialities.length === 0}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <WhiteButton
              text="Cancelar"
              onClick={() => {
                setEditing(false);
                setIsActive(currentProfessor.isActive);

                setSelectedSpecialityIds(
                  currentProfessor.specialities.map(
                    (spec) => spec.specialityId,
                  ),
                );
              }}
              textSmall={true}
            />

            <BlackButton
              text={updateMutation.isPending ? "Actualizando..." : "Actualizar"}
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              textSmall={true}
            />
          </div>
        </div>
      )}
      {openSpecialityModal && (
        <Modal open onClose={() => setOpenSpecialityModal(false)}>
          <h2 className="text-2xl font-semibold mb-5">Agregar profesiones</h2>

          {availableSpecialities.length > 0 ? (
            <div className="space-y-2">
              {availableSpecialities.map((speciality) => (
                <button
                  key={speciality.id}
                  type="button"
                  onClick={() => {
                    addSpeciality(speciality.id);
                    setOpenSpecialityModal(false);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#333] hover:bg-[#efefef] transition cursor-pointer"
                >
                  <p className="font-semibold">{speciality.name}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No hay profesiones disponibles para agregar.
            </p>
          )}
        </Modal>
      )}
      {confirmModal && (
        <ConfirmModal
          title="¿Eliminar este profesor?"
          message={`Estás por eliminar el profesor "${currentProfessor.user.name} ${currentProfessor.user.surname}". Esta acción no se puede deshacer.`}
          onConfirm={() => deleteMutation.mutate()}
          close={() => setConfirmModal(false)}
          isPending={deleteMutation.isPending}
        />
      )}
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
    </Modal>
  );
}
