import Features from "../components/features";
import Footer from "../components/footer";
import Header from "../components/header";
import Hero from "../components/hero";
import TargetAudience from "../components/target-audience";
import TenantPlans from "../components/tenant-plans";
import VideoSection from "../components/video-section";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <main className="bg-[#ede9ee] flex flex-col items-center gap-22 py-20 px-5">
        <Features />
        <TargetAudience />
        <VideoSection />
        <TenantPlans />
      </main>
      <Footer />
    </>
  );
}
