import MainLayout from "../layouts/main-layout";
import { useAuthStore } from "../store/auth-store";
import Navbar from "../components/navbar";
import { useTranslation } from "react-i18next";
import { usePreferencesStore } from "../store/preferences-store";
import ThemeSelector from "../components/theme-selector";

export default function Profile() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { language, setLanguage } = usePreferencesStore();

  return (
    <MainLayout>
      <div className="mt-16 grid lg:grid-cols-[0.8fr_1fr] w-[80%] gap-10">
        <Navbar user={user} />
        <div className="w-full lg:max-w-120 flex flex-col gap-5 text-[18px]">
          <h3 className="text-2xl font-semibold">Ajustes</h3>
          <label className="flex flex-wrap items-center gap-2 text-[16px] text-gray-600">
            <span>{t("header.language")}:</span>
            <select
              value={language === "en" ? "en" : "es"}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-lg border border-gray-400 bg-[#f1eef3] p-2 text-gray-700 cursor-pointer"
            >
              <option value="es">Español (ES)</option>
              <option value="en">Inglés (EN)</option>
            </select>
          </label>
          {/* <ThemeSelector /> */}
        </div>
      </div>
    </MainLayout>
  );
}
