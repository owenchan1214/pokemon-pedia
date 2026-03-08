import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import EventsSection from "@/components/EventsSection";
import CodesSection from "@/components/CodesSection";
import RaidsSection from "@/components/RaidsSection";
import TypeChartSection from "@/components/TypeChartSection";
import PvPTierListSection from "@/components/PvPTierListSection";
import TeamBuilderSection from "@/components/TeamBuilderSection";
import LeaderboardSection from "@/components/LeaderboardSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <EventsSection />
      <CodesSection />
      <RaidsSection />
      <TypeChartSection />
      <PvPTierListSection />
      <LeaderboardSection />
      <Footer />
    </div>
  );
};

export default Index;
