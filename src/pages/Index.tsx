import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import EventsSection from "@/components/EventsSection";
import CodesSection from "@/components/CodesSection";
import RaidsSection from "@/components/RaidsSection";
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
      <LeaderboardSection />
      <Footer />
    </div>
  );
};

export default Index;
