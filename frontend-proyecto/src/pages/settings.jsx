import { Link } from "wouter";
import MainLayout from "../layouts/main-layout";
import { useAuthStore } from "../store/auth-store";
import FormInput from "../components/form-input";
import ErrorModal from "../components/modals/error-modal";
import Navbar from "../components/navbar";
import LanguageSelector from "../components/language-selector";
import ThemeSelector from "../components/theme-selector";

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <MainLayout>
      <div className="mt-16 grid lg:grid-cols-[0.8fr_1fr] w-[80%] gap-10">
        <Navbar user={user} />
        <div className="w-full lg:max-w-120 flex flex-col gap-5 text-[18px]">
          <h3 className="text-2xl font-semibold">Ajustes</h3>
          <LanguageSelector />
          <ThemeSelector />
        </div>
      </div>
    </MainLayout>
  );
}
