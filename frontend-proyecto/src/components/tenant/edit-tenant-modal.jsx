import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { updateTenant } from "../../services/tenant";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import { X } from "lucide-react";

const PLATFORMS = [
  { name: "facebook", label: "Facebook" },
  { name: "instagram", label: "Instagram" },
  { name: "tiktok", label: "TikTok" },
  { name: "x", label: "X (Twitter)" },
  { name: "linkedin", label: "LinkedIn" },
  { name: "youtube", label: "YouTube" },
  { name: "whatsapp", label: "WhatsApp" },
];

export default function EditTenantModal({ tenant, close }) {
  const queryClient = useQueryClient();
  const [address, setAddress] = useState(tenant.address || "");
  const [networks, setNetworks] = useState(tenant.socialNetworks || {});
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  console.log("Networks actuales:", networks);

  const mutation = useMutation({
    mutationFn: () => {
      const networksToSend = Object.entries(networks).reduce(
        (acc, [platform, url]) => {
          if (platform.toLowerCase() === "whatsapp") {
            acc[platform] = url.replace("https://wa.me/", "");
          } else {
            acc[platform] = url;
          }
          return acc;
        },
        {},
      );

      return updateTenant(tenant.id, {
        address: address || null,
        socialNetworks: networksToSend,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenantById"],
      });
      queryClient.invalidateQueries({
        queryKey: ["myTenants"],
      });

      setSuccessModal(true);
      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al crear el plan";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;
      else if (data?.title) msg = data.title;

      setErrorMessage(msg);
      setErrorModal(true);
    },
  });

  const handleAddNetwork = (platform) => {
    setNetworks((prev) => ({
      ...prev,
      [platform]: prev[platform] || "",
    }));
  };

  const handleRemoveNetwork = (platform) => {
    setNetworks((prev) => {
      const updated = { ...prev };
      delete updated[platform];
      return updated;
    });
  };

  const handleUrlChange = (platform, value) => {
    setNetworks((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-6">
        Editar información del negocio
      </h2>

      <div className="mb-10">
        <h3 className="font-semibold text-lg mb-3">Dirección</h3>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ingresá la dirección del negocio"
          maxLength={200}
          className="w-full border rounded-xl p-3 mb-3 h-20 resize-none outline-none focus:border-[#333]"
        />
        <p className="text-sm text-gray-500">{address.length}/200</p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Redes Sociales</h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Agregar red social:</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.filter((p) => !(p.name in networks)).map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleAddNetwork(platform.name)}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full transition cursor-pointer"
              >
                + {platform.label}
              </button>
            ))}
          </div>
        </div>

        {Object.entries(networks).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(networks).map(([platform, url]) => {
              const isWhatsapp = platform.toLowerCase() === "whatsapp";

              const displayValue = isWhatsapp
                ? url.replace("https://wa.me/", "")
                : url;

              return (
                <div key={platform} className="border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold capitalize text-sm">
                      {platform}
                    </p>
                    <button
                      onClick={() => handleRemoveNetwork(platform)}
                      className="text-red-600 text-xs hover:text-red-700 transition cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>

                  {isWhatsapp ? (
                    <div>
                      <input
                        type="tel"
                        value={displayValue}
                        onChange={(e) =>
                          handleUrlChange(platform, e.target.value)
                        }
                        placeholder="Ej: 5491234567890"
                        className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#333]"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ingresa solo el número (sin +, guiones ni espacios)
                      </p>
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={displayValue}
                      onChange={(e) =>
                        handleUrlChange(platform, e.target.value)
                      }
                      placeholder={`https://${platform}.com/...`}
                      className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-[#333]"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No hay redes sociales agregadas
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8">
        <WhiteButton text="Cancelar" onClick={close} textSmall={true} />
        <BlackButton
          text={mutation.isPending ? "Guardando..." : "Guardar"}
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          textSmall={true}
        />
      </div>

      {successModal && (
        <SuccessModal
          message="Información actualizada correctamente"
          close={() => setSuccessModal(false)}
          isSuccesOrError={true}
        />
      )}

      {errorModal && (
        <ErrorModal
          message={errorMessage}
          close={() => setErrorModal(false)}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
