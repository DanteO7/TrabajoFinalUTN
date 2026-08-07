import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Modal from "../modals/modal";
import Loading from "../loading";
import { getUserById } from "../../services/user";
import { getUserTenants } from "../../services/tenant";

export default function UserModal({ user, close }) {
  const { data: userDetail, isLoading: isLoadingUser } = useQuery({
    queryKey: ["getUserById", user?.id],
    queryFn: () => getUserById(user.id),
    enabled: !!user?.id,
  });

  const { data: tenants = [], isLoading: isLoadingTenants } = useQuery({
    queryKey: ["getUserTenants", user?.id],
    queryFn: () => getUserTenants(user?.id),
    enabled: !!user?.id,
  });

  const isLoading = isLoadingUser || isLoadingTenants;

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-2">
            {userDetail?.name} {userDetail?.surname}
          </h2>

          <p className="text-gray-600 mb-6">{userDetail?.email}</p>

          {/* Información personal */}
          <div className="space-y-4 mb-8">
            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Teléfono</p>
              <p className="font-semibold text-[#333]">
                {userDetail?.phoneNumber || "No proporcionado"}
              </p>
            </div>
          </div>

          {/* Negocios */}
          {tenants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Negocios ({tenants.length})
              </h3>
              <div className="space-y-3">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="border rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{tenant.name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Rol:{" "}
                          <span className="font-semibold">{tenant.role}</span>
                        </p>
                      </div>
                      <span
                        className={`text-xs rounded-full px-2 py-1 ${
                          tenant.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tenant.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tenants.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Este usuario no pertenece a ningún negocio
              </p>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
