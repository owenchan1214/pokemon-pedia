import { motion } from "framer-motion";
import { useState } from "react";
import { Swords, Shield, Crown } from "lucide-react";

type PvPEntry = { rank: number; name: string; type: string; score: number; moves: string };

const greatLeague: PvPEntry[] = [
  { rank: 1, name: "Jellicent", type: "Water/Ghost", score: 94.1, moves: "Hex · Surf · Shadow Ball" },
  { rank: 2, name: "Altaria", type: "Dragon/Flying", score: 93.7, moves: "Dragon Breath · Sky Attack · Flamethrower" },
  { rank: 3, name: "Furret", type: "Normal", score: 93.4, moves: "Sucker Punch · Swift · Trailblaze" },
  { rank: 4, name: "Azumarill", type: "Water/Fairy", score: 93.2, moves: "Bubble · Ice Beam · Play Rough" },
  { rank: 5, name: "Empoleon", type: "Water/Steel", score: 92.3, moves: "Metal Sound · Hydro Cannon · Drill Peck" },
  { rank: 6, name: "Wigglytuff", type: "Normal/Fairy", score: 91.8, moves: "Charm · Icy Wind · Swift" },
  { rank: 7, name: "Corviknight", type: "Flying/Steel", score: 91.7, moves: "Sand Attack · Air Cutter · Payback" },
  { rank: 8, name: "S. Empoleon", type: "Water/Steel", score: 91.7, moves: "Metal Sound · Hydro Cannon · Drill Peck" },
  { rank: 9, name: "Lickilicky", type: "Normal", score: 91.2, moves: "Rollout · Body Slam · Shadow Ball" },
  { rank: 10, name: "S. Drapion", type: "Poison/Dark", score: 91.1, moves: "Poison Sting · Crunch · Aqua Tail" },
];

const ultraLeague: PvPEntry[] = [
  { rank: 1, name: "G. Moltres", type: "Dark/Flying", score: 96.3, moves: "Sucker Punch · Fly · Brave Bird" },
  { rank: 2, name: "Corviknight", type: "Flying/Steel", score: 95.6, moves: "Sand Attack · Air Cutter · Payback" },
  { rank: 3, name: "Lapras", type: "Water/Ice", score: 95.4, moves: "Psywave · Sparkling Aria · Ice Beam" },
  { rank: 4, name: "Jellicent", type: "Water/Ghost", score: 95.0, moves: "Hex · Surf · Shadow Ball" },
  { rank: 5, name: "Florges", type: "Fairy", score: 94.8, moves: "Fairy Wind · Chilling Water · Trailblaze" },
  { rank: 6, name: "S. Lapras", type: "Water/Ice", score: 94.7, moves: "Psywave · Sparkling Aria · Ice Beam" },
  { rank: 7, name: "Empoleon", type: "Water/Steel", score: 94.4, moves: "Metal Sound · Hydro Cannon · Drill Peck" },
  { rank: 8, name: "S. Empoleon", type: "Water/Steel", score: 94.2, moves: "Metal Sound · Hydro Cannon · Drill Peck" },
  { rank: 9, name: "S. Feraligatr", type: "Water", score: 94.0, moves: "Shadow Claw · Hydro Cannon · Ice Beam" },
  { rank: 10, name: "Clefable", type: "Fairy", score: 93.8, moves: "Fairy Wind · Meteor Mash · Moonblast" },
];

const masterLeague: PvPEntry[] = [
  { rank: 1, name: "Zacian (Crowned)", type: "Fairy/Steel", score: 99.1, moves: "Metal Claw · Close Combat · Behemoth Blade" },
  { rank: 2, name: "Palkia (Origin)", type: "Water/Dragon", score: 98.8, moves: "Dragon Breath · Aqua Tail · Spacial Rend" },
  { rank: 3, name: "Metagross", type: "Steel/Psychic", score: 96.6, moves: "Shadow Claw · Meteor Mash · Earthquake" },
  { rank: 4, name: "Xerneas", type: "Fairy", score: 95.3, moves: "Geomancy · Close Combat · Moonblast" },
  { rank: 5, name: "Zamazenta (Crowned)", type: "Fighting/Steel", score: 94.8, moves: "Ice Fang · Close Combat · Behemoth Bash" },
  { rank: 6, name: "Kyurem (White)", type: "Dragon/Ice", score: 94.7, moves: "Dragon Breath · Fusion Flare · Ice Burn" },
  { rank: 7, name: "Dialga (Origin)", type: "Steel/Dragon", score: 94.5, moves: "Dragon Breath · Roar of Time · Iron Head" },
  { rank: 8, name: "Reshiram", type: "Dragon/Fire", score: 94.1, moves: "Dragon Breath · Fusion Flare · Draco Meteor" },
  { rank: 9, name: "Lunala", type: "Psychic/Ghost", score: 94.0, moves: "Shadow Claw · Shadow Ball · Moonblast" },
  { rank: 10, name: "Kyurem (Black)", type: "Dragon/Ice", score: 92.9, moves: "Dragon Tail · Freeze Shock · Fusion Bolt" },
];

const leagues = [
  { id: "great", name: "Great League", icon: Shield, cap: "1,500 CP", data: greatLeague, color: "text-secondary" },
  { id: "ultra", name: "Ultra League", icon: Swords, cap: "2,500 CP", data: ultraLeague, color: "text-legendary" },
  { id: "master", name: "Master League", icon: Crown, cap: "No Limit", data: masterLeague, color: "text-accent" },
];

const typeColorMap: Record<string, string> = {
  Normal: "bg-[hsl(60,10%,55%)]", Fire: "bg-[hsl(15,80%,50%)]", Water: "bg-[hsl(220,70%,55%)]",
  Electric: "bg-[hsl(48,90%,50%)]", Grass: "bg-[hsl(100,55%,45%)]", Ice: "bg-[hsl(185,60%,60%)]",
  Fighting: "bg-[hsl(2,65%,42%)]", Poison: "bg-[hsl(280,55%,45%)]", Ground: "bg-[hsl(40,55%,50%)]",
  Flying: "bg-[hsl(255,55%,65%)]", Psychic: "bg-[hsl(340,70%,55%)]", Bug: "bg-[hsl(75,65%,40%)]",
  Rock: "bg-[hsl(45,45%,40%)]", Ghost: "bg-[hsl(265,35%,40%)]", Dragon: "bg-[hsl(260,70%,50%)]",
  Dark: "bg-[hsl(25,25%,32%)]", Steel: "bg-[hsl(220,15%,60%)]", Fairy: "bg-[hsl(330,50%,65%)]",
};

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] text-white font-semibold mr-1 ${typeColorMap[type] || "bg-muted"}`}>
    {type}
  </span>
);

const PvPTierListSection = () => {
  const [activeLeague, setActiveLeague] = useState("great");
  const league = leagues.find(l => l.id === activeLeague)!;

  return (
    <section id="pvp" className="py-20 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">PvP Tier List</h2>
          <p className="text-muted-foreground font-body">Top 10 Pokémon per league · Data from PvPoke · Season: Memories in Motion</p>
        </motion.div>

        {/* League Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {leagues.map(l => (
            <button
              key={l.id}
              onClick={() => setActiveLeague(l.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-body font-semibold text-sm transition-all ${
                activeLeague === l.id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              <l.icon className="w-4 h-4" />
              {l.name}
              <span className="text-xs opacity-70">({l.cap})</span>
            </button>
          ))}
        </div>

        {/* Rankings */}
        <motion.div
          key={activeLeague}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card-gradient rounded-2xl border border-border shadow-card overflow-hidden max-w-5xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                  <th className="text-center p-3 w-12">#</th>
                  <th className="text-left p-3">Pokémon</th>
                  <th className="text-left p-3 hidden sm:table-cell">Type</th>
                  <th className="text-left p-3 hidden md:table-cell">Recommended Moves</th>
                  <th className="text-left p-3 w-32">Score</th>
                </tr>
              </thead>
              <tbody>
                {league.data.map((p, i) => (
                  <motion.tr
                    key={p.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-t border-border/30 hover:bg-primary/5 transition-colors"
                  >
                    <td className="p-3 text-center">
                      {p.rank <= 3 ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${
                          p.rank === 1 ? "bg-primary/15" : p.rank === 2 ? "bg-muted" : "bg-accent/15"
                        }`}>
                          <span className={`font-display text-sm ${
                            p.rank === 1 ? "text-primary" : p.rank === 2 ? "text-muted-foreground" : "text-accent"
                          }`}>{p.rank}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{p.rank}</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-foreground whitespace-nowrap">{p.name}</td>
                    <td className="p-3 hidden sm:table-cell whitespace-nowrap">
                      {p.type.split("/").map(t => <TypeBadge key={t} type={t} />)}
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell text-xs">{p.moves}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${p.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-10">{p.score}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground font-body mt-6">
          ⚔️ Rankings based on overall performance across leads, closers, switches & consistency · <a href="https://pvpoke.com" target="_blank" rel="noopener" className="text-secondary underline">pvpoke.com</a>
        </p>
      </div>
    </section>
  );
};

export default PvPTierListSection;
