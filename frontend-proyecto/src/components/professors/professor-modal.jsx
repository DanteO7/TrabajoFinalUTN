import { X, Pencil } from "lucide-react";
import { useState } from "react";
import Modal from "../modals/modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  updateProfessor,
  addSpeciality,
  removeSpeciality,
  deleteProfessor,
} from "../../services/professor";
import { getSpecialities } from "../../services/speciality";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { useTenantStore } from "../../store/tenant-store";

export default function ProfessorModal({ professor, tenantId, close }) {
  const queryClient = useQueryClient();

  const getUserRoles = useTenantStore((state) => state.getUserRoles);
  const userRoles = getUserRoles(tenantId);
  const isTenant = userRoles?.roles?.includes("Tenant");

  const [editing, setEditing] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState(professor);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isActive, setIsActive] = useState(currentProfessor.isActive);
  const [selectedSpeciality, setSelectedSpeciality] = useState(null);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const { data: specialities = [] } = useQuery({
    queryKey: ["getSpecialities", tenantId],
    queryFn: () => getSpecialities(tenantId),
  });

  const professorSpecialities = new Set(
    currentProfessor.specialities.map((s) => s.specialityId),
  );

  const availableSpecialities = specialities.filter(
    (s) => !professorSpecialities.has(s.id),
  );

  const deleteMutation = useMutation({
    mutationFn: () => deleteProfessor(currentProfessor.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getProfessors", tenantId],
      });

      setDeleteModal(false);

      setSuccessMessage("Profesor eliminado correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al eliminar el profesor";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const activeMutation = useMutation({
    mutationFn: () =>
      updateProfessor(currentProfessor.id, { isActive: isActive }),

    onSuccess: (updatedProfessor) => {
      queryClient.invalidateQueries({
        queryKey: ["getProfessors", tenantId],
      });

      setSuccessMessage(
        `Profesor ${isActive ? "activado" : "desactivado"} correctamente`,
      );
      setSuccessModal(true);

      setCurrentProfessor(updatedProfessor);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al actualizar el estado";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
      setIsActive(currentProfessor.isActive);
    },
  });

  const addSpecialityMutation = useMutation({
    mutationFn: () => addSpeciality(currentProfessor.id, selectedSpeciality),

    onSuccess: (updatedProfessor) => {
      queryClient.invalidateQueries({
        queryKey: ["getProfessors", tenantId],
      });

      setSuccessMessage("Especialidad agregada correctamente");
      setSuccessModal(true);

      setCurrentProfessor(updatedProfessor);
      setSelectedSpeciality(null);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al agregar la especialidad";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
      setSelectedSpeciality(null);
    },
  });

  const removeSpecialityMutation = useMutation({
    mutationFn: (specialityId) =>
      removeSpeciality(currentProfessor.id, specialityId),

    onSuccess: (updatedProfessor) => {
      queryClient.invalidateQueries({
        queryKey: ["getProfessors", tenantId],
      });

      setSuccessMessage("Especialidad removida correctamente");
      setSuccessModal(true);

      setCurrentProfessor(updatedProfessor);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al remover la especialidad";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
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
                <p className="text-sm text-gray-600 mb-3">Especialidades</p>
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
            <div className="flex justify-end gap-3 max-[360px]:text-[13px]">
              <button
                onClick={() => setDeleteModal(true)}
                className="text-red-600 border border-red-600 rounded-xl px-4 py-2 hover:bg-red-600 hover:text-white transition cursor-pointer"
              >
                Eliminar profesor
              </button>

              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-[#333] text-white px-4 py-2 rounded-xl hover:bg-gray-700"
              >
                <Pencil size={18} />
                Editar
              </button>
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
                  key={status}
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

            {isActive !== currentProfessor.isActive && (
              <button
                onClick={() => activeMutation.mutate()}
                disabled={activeMutation.isPending}
                className="w-full mt-4 bg-[#333] text-white rounded-xl py-2 hover:bg-gray-700 transition disabled:opacity-50"
              >
                {activeMutation.isPending
                  ? "Actualizando..."
                  : "Actualizar estado"}
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">
              Especialidades
            </label>

            {currentProfessor.specialities.length > 0 && (
              <div className="mb-4 p-3 bg-[#efefef] rounded-xl">
                <p className="text-xs text-gray-600 mb-2">
                  Especialidades actuales
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentProfessor.specialities.map((spec) => (
                    <button
                      key={spec.specialityId}
                      onClick={() =>
                        removeSpecialityMutation.mutate(spec.specialityId)
                      }
                      disabled={removeSpecialityMutation.isPending}
                      className="bg-[#333] text-white text-sm rounded-full px-3 py-1 hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {spec.name} ✕
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableSpecialities.length > 0 && (
              <>
                <select
                  value={selectedSpeciality || ""}
                  onChange={(e) =>
                    setSelectedSpeciality(parseInt(e.target.value))
                  }
                  className="w-full border rounded-xl px-3 py-2 bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#333] mb-2"
                >
                  <option value="">Selecciona una especialidad...</option>
                  {availableSpecialities.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>

                {selectedSpeciality && (
                  <button
                    onClick={() => addSpecialityMutation.mutate()}
                    disabled={addSpecialityMutation.isPending}
                    className="w-full bg-[#333] text-white rounded-xl py-2 hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    {addSpecialityMutation.isPending
                      ? "Agregando..."
                      : "Agregar especialidad"}
                  </button>
                )}
              </>
            )}

            {availableSpecialities.length === 0 &&
              currentProfessor.specialities.length > 0 && (
                <p className="text-sm text-gray-500">
                  Todas las especialidades están asignadas
                </p>
              )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setEditing(false);
                setIsActive(currentProfessor.isActive);
                setSelectedSpeciality(null);
              }}
              className="border px-4 py-2 rounded-xl"
            >
              Cancelar
            </button>
          </div>
        </div>
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

      {deleteModal && (
        <Modal open onClose={() => setDeleteModal(false)}>
          <h2 className="text-2xl font-semibold text-center">
            Eliminar profesor
          </h2>

          <p className="text-center mt-5">
            ¿Seguro que querés eliminar a{" "}
            <span className="font-semibold">
              {currentProfessor.user.name} {currentProfessor.user.surname}
            </span>
            ?
          </p>

          <p className="text-center text-gray-500 mt-2">
            Esta acción no se puede deshacer.
          </p>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => setDeleteModal(false)}
              className="border rounded-xl px-4 py-2"
            >
              Cancelar
            </button>

            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white rounded-xl px-4 py-2 hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
