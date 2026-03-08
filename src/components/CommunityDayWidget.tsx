import { motion } from "framer-motion";
import { Flame, Gift, Egg, Candy, Clock, Sparkles } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

const communityDay = {
  pokemon: "Scorbunny",
  evolution: "Raboot → Cinderace",
  exclusiveMove: "Blast Burn",
  bonusMove: "Pyro Ball",
  date: "Saturday, March 14, 2026",
  time: "2:00 PM – 5:00 PM local time",
  targetDate: new Date("2026-03-14T14:00:00"),
  type: "Fire",
  bonuses: [
    { icon: Candy, label: "2× Catch Candy", desc: "Double candy for every catch" },
    { icon: Sparkles, label: "2× Candy XL", desc: "Double XL candy chance (Lv. 31+)" },
    { icon: Egg, label: "¼ Egg Distance", desc: "Eggs hatch 4× faster" },
    { icon: Clock, label: "3h Incense", desc: "Incense lasts the full event" },
  ],
  tips: [
    "Evolve during the event or up to 5 hours after to get Blast Burn",
    "Shiny rate is boosted to ~1/25 during Community Day hours",
    "Use a Star Piece + Lucky Egg for max Stardust & XP gains",
  ],
};

const CommunityDayWidget = () => {
  return (
    <section id="communityday" className="py-16 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-card-gradient border border-accent/30 shadow-card">
            {/* Fire accent glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

            <div className="relative p-6 md:p-8">
              {/* Badge + Title */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-body font-semibold">
                  <Flame className="w-3.5 h-3.5" /> Community Day
                </span>
                <span className="text-xs font-body text-muted-foreground">{communityDay.date}</span>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                {/* Left: Pokemon Spotlight */}
                <div>
                  <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-1">
                    {communityDay.pokemon}
                  </h2>
                  <p className="text-muted-foreground font-body text-sm mb-4">
                    {communityDay.evolution} · <span className="text-accent font-semibold">{communityDay.type}</span> type
                  </p>

                  {/* Exclusive Moves */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-sm font-body">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      <span className="text-foreground font-semibold">{communityDay.exclusiveMove}</span>
                      <span className="text-muted-foreground text-xs">exclusive</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-sm font-body">
                      <Gift className="w-3.5 h-3.5 text-primary" />
                      <span className="text-foreground font-semibold">{communityDay.bonusMove}</span>
                      <span className="text-muted-foreground text-xs">bonus</span>
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground font-body flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {communityDay.time}
                  </p>
                </div>

                {/* Right: Countdown */}
                <div className="flex flex-col items-center">
                  <div className="w-full p-5 rounded-2xl bg-muted/40 border border-border">
                    <CountdownTimer targetDate={communityDay.targetDate} label="🔥 Community Day starts in" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bonuses Row */}
            <div className="border-t border-border bg-muted/20 px-6 md:px-8 py-5">
              <p className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3">Event Bonuses</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {communityDay.bonuses.map((bonus, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border"
                  >
                    <bonus.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-body font-semibold text-foreground">{bonus.label}</p>
                      <p className="text-[11px] text-muted-foreground font-body leading-tight">{bonus.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="border-t border-border px-6 md:px-8 py-5">
              <p className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3">💡 Tips</p>
              <ul className="space-y-1.5">
                {communityDay.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground font-body flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunityDayWidget;
