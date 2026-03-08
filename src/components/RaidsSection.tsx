import { motion } from "framer-motion";
import { Shield, Sparkles, Zap, Skull } from "lucide-react";

type Raid = { pokemon: string; date: string; type: string; cp: string; shiny: boolean };

const legendary: Raid[] = [
  { pokemon: "Articuno", date: "Mar 4 – 11", type: "Ice / Flying", cp: "1743–1676", shiny: true },
  { pokemon: "Zapdos", date: "Mar 4 – 11", type: "Electric / Flying", cp: "2015–1930", shiny: true },
  { pokemon: "Moltres", date: "Mar 4 – 11", type: "Fire / Flying", cp: "1980–1896", shiny: true },
  { pokemon: "Zacian (Hero)", date: "Mar 11 – 18", type: "Fairy", cp: "2188–2100", shiny: true },
  { pokemon: "Zamazenta (Hero)", date: "Mar 18 – 25", type: "Fighting", cp: "2188–2100", shiny: true },
  { pokemon: "Regieleki", date: "Mar 25 – 31", type: "Electric", cp: "1954–1872", shiny: true },
];

const mega: Raid[] = [
  { pokemon: "Mega Pinsir", date: "Mar 4 – 11", type: "Bug / Flying", cp: "1692–1613", shiny: true },
  { pokemon: "Mega Steelix", date: "Mar 11 – 18", type: "Steel / Ground", cp: "1677–1596", shiny: true },
  { pokemon: "Mega Slowbro", date: "Mar 18 – 25", type: "Water / Psychic", cp: "1477–1406", shiny: true },
  { pokemon: "Mega Houndoom", date: "Mar 25 – 31", type: "Dark / Fire", cp: "1635–1558", shiny: true },
];

const shadow: Raid[] = [
  { pokemon: "Shadow Latias (T5)", date: "Mar 4 – 31", type: "Dragon / Psychic", cp: "2389–2483", shiny: true },
  { pokemon: "Shadow Dratini (T1)", date: "Ongoing", type: "Dragon", cp: "529–574", shiny: true },
  { pokemon: "Shadow Gligar (T1)", date: "Ongoing", type: "Ground / Flying", cp: "1000–1061", shiny: true },
  { pokemon: "Shadow Lapras (T3)", date: "Ongoing", type: "Ice / Water", cp: "1435–1509", shiny: true },
];

const dynamax: Raid[] = [
  { pokemon: "D-Max Rookidee", date: "Mar 2", type: "Flying", cp: "416–374", shiny: false },
  { pokemon: "D-Max Pikachu", date: "Mar 9", type: "Electric", cp: "938–888", shiny: false },
  { pokemon: "D-Max Falinks", date: "Mar 16", type: "Fighting", cp: "1581–1506", shiny: false },
  { pokemon: "D-Max Regice", date: "Mar 23", type: "Ice", cp: "1784–1703", shiny: false },
  { pokemon: "D-Max Woobat", date: "Mar 30", type: "Psychic / Flying", cp: "451–406", shiny: false },
];

const RaidTable = ({ title, icon: Icon, raids, color }: { title: string; icon: any; raids: Raid[]; color: string }) => (
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
          {raids.map((r, i) => (
            <tr key={i} className="border-t border-border/50 hover:bg-primary/5 transition-colors">
              <td className="p-3 font-semibold text-foreground whitespace-nowrap">
                {r.pokemon} {r.shiny && <span className="text-shiny text-xs">✦</span>}
              </td>
              <td className="p-3 text-muted-foreground whitespace-nowrap">{r.date}</td>
              <td className="p-3 text-muted-foreground hidden sm:table-cell">{r.type}</td>
              <td className="p-3 text-right text-muted-foreground font-mono text-xs">{r.cp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

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
