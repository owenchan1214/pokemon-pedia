import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import EventsSection from "@/components/EventsSection";
import CommunityDayWidget from "@/components/CommunityDayWidget";
import CodesSection from "@/components/CodesSection";
import RaidsSection from "@/components/RaidsSection";
import TypeChartSection from "@/components/TypeChartSection";
import PokedexSection from "@/components/PokedexSection";
import RaidCounterSection from "@/components/RaidCounterSection";
import MoveCalculatorSection from "@/components/MoveCalculatorSection";
import IVCalculatorSection from "@/components/IVCalculatorSection";
import PvPTierListSection from "@/components/PvPTierListSection";
import TeamBuilderSection from "@/components/TeamBuilderSection";
import LeaderboardSection from "@/components/LeaderboardSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CommunityDayWidget />
      <EventsSection />
      <CodesSection />
      <RaidsSection />
      <TypeChartSection />
      <PokedexSection />
      <RaidCounterSection />
      <MoveCalculatorSection />
      <IVCalculatorSection />
      <PvPTierListSection />
      <TeamBuilderSection />
      <LeaderboardSection />
      <Footer />
    </div>
  );
};

export default Index;
