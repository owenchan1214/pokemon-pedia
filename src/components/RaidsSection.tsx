import { motion } from "framer-motion";
import { Shield, Sparkles, Zap, Skull, Clock, Ticket, Plus, Minus, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import CountdownTimer from "./CountdownTimer";

type Raid = { pokemon: string; date: string; type: string; cp: string; shiny: boolean; end: Date; start?: Date };

const legendary: Raid[] = [
  { pokemon: "Lunala", date: "Mar 2 – 4", type: "Psychic / Ghost", cp: "2307–2193", shiny: true, start: new Date("2026-03-02T10:00:00"), end: new Date("2026-03-04T10:00:00") },
  { pokemon: "Articuno", date: "Mar 4 – 11", type: "Ice / Flying", cp: "1743–1676", shiny: true, start: new Date("2026-03-04T10:00:00"), end: new Date("2026-03-11T10:00:00") },
  { pokemon: "Zapdos", date: "Mar 4 – 11", type: "Electric / Flying", cp: "2015–1930", shiny: true, start: new Date("2026-03-04T10:00:00"), end: new Date("2026-03-11T10:00:00") },
  { pokemon: "Moltres", date: "Mar 4 – 11", type: "Fire / Flying", cp: "1980–1896", shiny: true, start: new Date("2026-03-04T10:00:00"), end: new Date("2026-03-11T10:00:00") },
  { pokemon: "Zacian (Hero)", date: "Mar 11 – 18", type: "Fairy", cp: "2188–2100", shiny: true, start: new Date("2026-03-11T10:00:00"), end: new Date("2026-03-18T10:00:00") },
  { pokemon: "Zamazenta (Hero)", date: "Mar 18 – 25", type: "Fighting", cp: "2188–2100", shiny: true, start: new Date("2026-03-18T10:00:00"), end: new Date("2026-03-25T10:00:00") },
  { pokemon: "Regieleki", date: "Mar 25 – 31", type: "Electric", cp: "1954–1872", shiny: true, start: new Date("2026-03-25T10:00:00"), end: new Date("2026-03-31T10:00:00") },
];

const mega: Raid[] = [
  { pokemon: "Mega Absol", date: "Mar 2 – 4", type: "Dark", cp: "1443–1373", shiny: true, end: new Date("2026-03-04T10:00:00") },
  { pokemon: "Mega Pinsir", date: "Mar 4 – 11", type: "Bug / Flying", cp: "1692–1613", shiny: true, end: new Date("2026-03-11T10:00:00") },
  { pokemon: "Mega Steelix", date: "Mar 11 – 18", type: "Steel / Ground", cp: "1677–1596", shiny: true, end: new Date("2026-03-18T10:00:00") },
  { pokemon: "Mega Slowbro", date: "Mar 18 – 25", type: "Water / Psychic", cp: "1477–1406", shiny: true, end: new Date("2026-03-25T10:00:00") },
  { pokemon: "Mega Houndoom", date: "Mar 25 – 31", type: "Dark / Fire", cp: "1635–1558", shiny: true, end: new Date("2026-03-31T10:00:00") },
];

const shadow: Raid[] = [
  { pokemon: "Shadow Latias (T5)", date: "Mar 4 – 31", type: "Dragon / Psychic", cp: "2389–2483", shiny: true, end: new Date("2026-03-31T10:00:00") },
  { pokemon: "Shadow Dratini (T1)", date: "Ongoing", type: "Dragon", cp: "529–574", shiny: true, end: new Date("2026-03-31T10:00:00") },
  { pokemon: "Shadow Gligar (T1)", date: "Ongoing", type: "Ground / Flying", cp: "1000–1061", shiny: true, end: new Date("2026-03-31T10:00:00") },
  { pokemon: "Shadow Cacnea (T1)", date: "Ongoing", type: "Grass", cp: "658–709", shiny: true, end: new Date("2026-03-31T10:00:00") },
  { pokemon: "Shadow Lapras (T3)", date: "Ongoing", type: "Ice / Water", cp: "1435–1509", shiny: true, end: new Date("2026-03-31T10:00:00") },
  { pokemon: "Shadow A-Marowak (T3)", date: "Ongoing", type: "Ghost / Fire", cp: "988–1048", shiny: false, end: new Date("2026-03-31T10:00:00") },
  { pokemon: "Shadow Stantler (T3)", date: "Ongoing", type: "Normal", cp: "1170–1236", shiny: true, end: new Date("2026-03-31T10:00:00") },
];

const dynamax: Raid[] = [
  { pokemon: "D-Max Rookidee", date: "Mar 2", type: "Flying", cp: "416–374", shiny: false, end: new Date("2026-03-02T19:00:00") },
  { pokemon: "D-Max Pikachu", date: "Mar 9", type: "Electric", cp: "938–888", shiny: false, end: new Date("2026-03-09T19:00:00") },
  { pokemon: "D-Max Falinks", date: "Mar 16", type: "Fighting", cp: "1581–1506", shiny: false, end: new Date("2026-03-16T19:00:00") },
  { pokemon: "D-Max Regice", date: "Mar 23", type: "Ice", cp: "1784–1703", shiny: false, end: new Date("2026-03-23T19:00:00") },
  { pokemon: "D-Max Woobat", date: "Mar 30", type: "Psychic / Flying", cp: "451–406", shiny: false, end: new Date("2026-03-30T19:00:00") },
];

const getCurrentAndUpcoming = () => {
  const now = new Date();
  const current = legendary.filter(r => r.end > now && (!r.start || r.start <= now));
  const upcoming = legendary.filter(r => r.start && r.start > now);
  return { current, upcoming };
};

const getCurrentMega = () => {
  const now = new Date();
  return mega.find(r => r.end > now) || null;
};

// Remote Raid Pass Tracker
const RaidPassTracker = () => {
  const [passes, setPasses] = useState(() => {
    const saved = localStorage.getItem("raidPasses");
    return saved ? JSON.parse(saved) : { remote: 3, premium: 5, daily: 1 };
  });

  useEffect(() => {
    localStorage.setItem("raidPasses", JSON.stringify(passes));
  }, [passes]);

  const adjust = (type: "remote" | "premium" | "daily", delta: number) => {
    setPasses((prev: typeof passes) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta),
    }));
  };

  const reset = () => setPasses({ remote: 3, premium: 5, daily: 1 });

  const passTypes = [
    { key: "remote" as const, label: "Remote", color: "text-secondary", bgColor: "bg-secondary/10 border-secondary/20", max: "5/week" },
    { key: "premium" as const, label: "Premium", color: "text-primary", bgColor: "bg-primary/10 border-primary/20", max: "∞" },
    { key: "daily" as const, label: "Daily Free", color: "text-accent", bgColor: "bg-accent/10 border-accent/20", max: "1/day" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Ticket className="w-3.5 h-3.5 text-primary" /> Raid Pass Tracker
        </h3>
        <button onClick={reset} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Reset passes">
          <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {passTypes.map(({ key, label, color, bgColor, max }) => (
          <div key={key} className={`p-3 rounded-xl border ${bgColor} text-center`}>
            <p className={`text-2xl font-mono font-bold ${color}`}>{passes[key]}</p>
            <p className="text-[10px] text-muted-foreground font-body mt-0.5">{label}</p>
            <p className="text-[9px] text-muted-foreground/60 font-body">{max}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <button
                onClick={() => adjust(key, -1)}
                disabled={passes[key] <= 0}
                className="p-1 rounded-md hover:bg-muted transition-colors disabled:opacity-30"
              >
                <Minus className="w-3 h-3 text-muted-foreground" />
              </button>
              <button
                onClick={() => adjust(key, 1)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <Plus className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground font-body mt-3 text-center">
        Remote passes limited to 5/week · Tap − when you use a pass
      </p>
    </motion.div>
  );
};

// Active Raid Boss Widget
const ActiveRaidBossWidget = () => {
  const { current, upcoming } = getCurrentAndUpcoming();
  const currentMega = getCurrentMega();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="space-y-4"
    >
      {/* Current Bosses */}
      {current.length > 0 && (
        <div className="p-5 rounded-2xl bg-card-gradient border border-[hsl(var(--legendary))]/30 shadow-card">
          <h3 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[hsl(var(--legendary))]" /> Active Raid Bosses
          </h3>
          <div className="space-y-3">
            {current.map((raid, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--legendary))]/5 border border-[hsl(var(--legendary))]/15">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-body text-foreground font-semibold">{raid.pokemon}</span>
                    {raid.shiny && <span className="text-shiny text-xs">✦</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-body mt-0.5">{raid.type} · CP {raid.cp}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground font-body">Ends</p>
                  <p className="text-xs font-mono text-foreground">{raid.end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
              </div>
            ))}
          </div>
          {current[0] && (
            <div className="mt-3">
              <CountdownTimer targetDate={current[0].end} label={`⚔️ ${current[0].pokemon} rotation ends in`} />
            </div>
          )}
        </div>
      )}

      {/* Current Mega */}
      {currentMega && (
        <div className="p-4 rounded-2xl bg-card-gradient border border-[hsl(var(--mega))]/30 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[hsl(var(--mega))]" />
              <span className="text-sm font-body text-foreground font-semibold">{currentMega.pokemon}</span>
              {currentMega.shiny && <span className="text-shiny text-xs">✦</span>}
            </div>
            <span className="text-xs font-mono text-muted-foreground">{currentMega.date}</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-body mt-1">{currentMega.type} · CP {currentMega.cp}</p>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
          <h3 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Upcoming Raid Bosses
          </h3>
          <div className="space-y-2">
            {upcoming.slice(0, 4).map((raid, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors">
                <div>
                  <span className="text-sm font-body text-foreground font-medium">{raid.pokemon}</span>
                  {raid.shiny && <span className="text-shiny text-xs ml-1">✦</span>}
                  <p className="text-[11px] text-muted-foreground font-body">{raid.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-body text-muted-foreground">{raid.date}</p>
                  {raid.start && (
                    <p className="text-[10px] font-mono text-primary">
                      Starts {raid.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const RaidTable = ({ title, icon: Icon, raids, color }: { title: string; icon: any; raids: Raid[]; color: string }) => {
  const now = new Date();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card-gradient rounded-2xl border border-border shadow-card overflow-hidden"
    >
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="font-display text-lg text-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left p-3">Pokémon</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3 hidden sm:table-cell">Type</th>
              <th className="text-right p-3">CP</th>
            </tr>
          </thead>
          <tbody>
            {raids.map((r, i) => {
              const isActive = r.end > now && (i === 0 || raids[i - 1]?.end <= now || r.date.includes("Ongoing"));
              return (
                <tr key={i} className={`border-t border-border/50 transition-colors ${isActive ? "bg-primary/5" : "hover:bg-primary/5"}`}>
                  <td className="p-3 font-semibold text-foreground whitespace-nowrap">
                    {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse-glow" />}
                    {r.pokemon} {r.shiny && <span className="text-shiny text-xs">✦</span>}
                  </td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{r.date}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{r.type}</td>
                  <td className="p-3 text-right text-muted-foreground font-mono text-xs">{r.cp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const RaidsSection = () => {
  return (
    <section id="raids" className="py-20 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Raid Schedule</h2>
          <p className="text-muted-foreground font-body">All raid bosses for March 2026 · ✦ = Shiny available</p>
        </motion.div>

        {/* Active Boss Timer + Raid Pass Tracker */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-8">
          <ActiveRaidBossWidget />
          <RaidPassTracker />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <RaidTable title="5-Star Legendary" icon={Sparkles} raids={legendary} color="text-legendary" />
          <RaidTable title="Mega Raids" icon={Zap} raids={mega} color="text-mega" />
          <RaidTable title="Shadow Raids" icon={Skull} raids={shadow} color="text-shadow" />
          <RaidTable title="Dynamax (Max Monday)" icon={Shield} raids={dynamax} color="text-secondary" />
        </div>

        <p className="text-xs text-muted-foreground font-body mt-6">
          ⏰ Raid Hours: Every Wednesday 6–7 PM local time featuring the current T5 boss
        </p>
      </div>
    </section>
  );
};

export default RaidsSection;
