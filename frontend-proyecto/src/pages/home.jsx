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

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [, setLocation] = useLocation();

  const [openModal, setOpenModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      setLocation("/sign-in");
      return;
    }
    setOpenModal(true);
  };

  return (
    <>
      <Header />
      <Hero onOpenModal={handleOpenModal} />
      <main className="bg-[#ede9ee] flex flex-col items-center gap-22 py-19 px-5">
        <Features />
        <TargetAudience />
        <VideoSection />
        <TenantPlans
          onOpenModal={handleOpenModal}
          onSelectedPlan={setSelectedPlan}
        />
        {openModal && (
          <TenantForm
            onClose={() => setOpenModal(false)}
            setSelectedPlan={setSelectedPlan}
            selectedPlan={selectedPlan}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
