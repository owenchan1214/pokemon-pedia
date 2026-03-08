import { motion } from "framer-motion";
import { Zap, Calendar, Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-hero-gradient overflow-hidden">
      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-legendary/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="container relative z-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-secondary font-body text-sm uppercase tracking-[0.3em] mb-4">Season: Memories in Motion</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-gradient-gold mb-6 leading-tight">
            POKÉMON GO
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body max-w-2xl mx-auto mb-4">
            March 2026 Hub — Events, Raids, Codes & Leaderboard
          </p>
          <p className="text-sm text-muted-foreground/70 font-body mb-10">
            🎂 Celebrating the 30th Anniversary of Pokémon!
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <a href="#events" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-body font-semibold hover:brightness-110 transition-all">
            <Calendar className="w-4 h-4" /> Events
          </a>
          <a href="#raids" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted text-foreground font-body font-semibold border border-border hover:bg-muted/80 transition-all">
            <Shield className="w-4 h-4" /> Raids
          </a>
          <a href="#leaderboard" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted text-foreground font-body font-semibold border border-border hover:bg-muted/80 transition-all">
            <Zap className="w-4 h-4" /> Leaderboard
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
