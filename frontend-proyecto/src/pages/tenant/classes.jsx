import { useState } from "react";
import MainLayout from "../../layouts/main-layout";
import OfficialClasses from "./classes/official-classes";
import ClassTemplateWeek from "./classes/class-template-week";
import { IoArrowBack } from "react-icons/io5";
import { useLocation } from "wouter";
import { useTenantStore } from "../../store/tenant-store";

export default function Classes({ tenantId }) {
  const [activeTab, setActiveTab] = useState("official");
  const [, setLocation] = useLocation();

  const userRoles = useTenantStore((state) => state.getUserRoles(tenantId));

  const rolesLoaded = userRoles.length > 0;

  const isStudent = userRoles.includes("Student");

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mt-12">
        <button
          onClick={() => setLocation(`/tu-espacio/${tenantId}`)}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
        >
          <IoArrowBack color="fc697b" />
          Volver
        </button>
        <div>
          <h1 className="text-4xl min-[900px]:text-5xl font-bold">Clases</h1>

          <p className="text-gray-500 mt-3">
            Seleccioná un día para visualizar las clases programadas.
          </p>
        </div>
        {rolesLoaded && !isStudent && (
          <div className="grid grid-cols-2 min-[900px]:flex  border-gray-400 mt-5">
            <button
              type="button"
              onClick={() => setActiveTab("official")}
              className={`px-2 min-[900px]:px-7.5 py-2 font-medium cursor-pointer ${
                activeTab === "official"
                  ? "border-b-3 border-[#fc697b] text-[#ee4b5e]"
                  : "text-gray-400 border-gray-400 border-b"
              }`}
            >
              Clases oficiales
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("template")}
              className={`px-2 min-[900px]:px-7.5 py-2 font-medium cursor-pointer ${
                activeTab === "template"
                  ? "border-b-3 border-[#fc697b] text-[#ee4b5e]"
                  : "text-gray-400 border-gray-400 border-b"
              }`}
            >
              Semana modelo
            </button>
          </div>
        )}

        {activeTab === "official" && <OfficialClasses tenantId={tenantId} />}

        {activeTab === "template" && <ClassTemplateWeek tenantId={tenantId} />}
      </div>
    </MainLayout>
  );
}
