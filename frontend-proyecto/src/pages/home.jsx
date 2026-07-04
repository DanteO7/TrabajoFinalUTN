import Features from "../components/home/features";
import Footer from "../components/footer";
import Header from "../components/header";
import Hero from "../components/home/hero";
import TargetAudience from "../components/home/target-audience";
import TenantPlans from "../components/home/tenant-plans";
import VideoSection from "../components/home/video-section";
import TenantForm from "../components/home/tenant-form";
import { useState } from "react";
import { useAuthStore } from "../store/auth-store";
import { useLocation } from "wouter";
import MainLayout from "../layouts/main-layout";
import ForbiddenModal from "../components/modals/forbidden-modal";

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [, setLocation] = useLocation();

  const [openModal, setOpenModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openForbiddenModal, setOpenForbiddenModal] = useState(false);

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      setLocation("/sign-in");
      return;
    }
    setOpenModal(true);
  };

  return (
    <MainLayout>
      <Hero
        onOpenModal={handleOpenModal}
        openForbiddenModal={() => setOpenForbiddenModal(true)}
      />
      <Features />
      <TargetAudience />
      <VideoSection />
      <TenantPlans
        onOpenModal={handleOpenModal}
        onSelectedPlan={setSelectedPlan}
        openForbiddenModal={() => setOpenForbiddenModal(true)}
      />
      {openModal && (
        <TenantForm
          close={() => setOpenModal(false)}
          setSelectedPlan={setSelectedPlan}
          selectedPlan={selectedPlan}
        />
      )}
      {openForbiddenModal && (
        <ForbiddenModal
          close={() => setOpenForbiddenModal(false)}
          isSuccesOrError={true}
        />
      )}
    </MainLayout>
  );
}
