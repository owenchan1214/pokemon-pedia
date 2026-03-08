import { motion } from "framer-motion";
import { Trophy, ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useState, useMemo } from "react";

type PokemonEntry = { rank: number; name: string; quickMove: string; mainMove: string; dps: number; type: string };

const topPokemon: PokemonEntry[] = [
  { rank: 1, name: "Zacian (Crowned Sword)", quickMove: "Metal Claw", mainMove: "Giga Impact", dps: 100, type: "Fairy/Steel" },
  { rank: 2, name: "Calyrex (Shadow Rider)", quickMove: "Confusion", mainMove: "Shadow Ball", dps: 99, type: "Psychic/Ghost" },
  { rank: 3, name: "Deoxys (Attack)", quickMove: "Zen Headbutt", mainMove: "Zap Cannon", dps: 98, type: "Psychic" },
  { rank: 4, name: "Thundurus (Therian)", quickMove: "Volt Switch", mainMove: "Wildbolt Storm", dps: 97, type: "Electric/Flying" },
  { rank: 5, name: "Blacephalon", quickMove: "Incinerate", mainMove: "Shadow Ball", dps: 94, type: "Fire/Ghost" },
  { rank: 6, name: "Mewtwo", quickMove: "Confusion", mainMove: "Psystrike", dps: 93, type: "Psychic" },
  { rank: 7, name: "Lucario", quickMove: "Force Palm", mainMove: "Aura Sphere", dps: 93, type: "Fighting/Steel" },
  { rank: 8, name: "Hoopa (Unbound)", quickMove: "Confusion", mainMove: "Psychic", dps: 93, type: "Psychic/Dark" },
  { rank: 9, name: "Kyurem (Black)", quickMove: "Dragon Tail", mainMove: "Fusion Bolt", dps: 92, type: "Dragon/Ice" },
  { rank: 10, name: "Enamorus (Incarnate)", quickMove: "Fairy Wind", mainMove: "Fly", dps: 92, type: "Fairy/Flying" },
  { rank: 11, name: "Salamence", quickMove: "Dragon Tail", mainMove: "Fly", dps: 92, type: "Dragon/Flying" },
  { rank: 12, name: "G. Darmanitan (Zen)", quickMove: "Ice Fang", mainMove: "Avalanche", dps: 91, type: "Ice/Fire" },
  { rank: 13, name: "Kartana", quickMove: "Razor Leaf", mainMove: "Leaf Blade", dps: 90, type: "Grass/Steel" },
  { rank: 14, name: "Pheromosa", quickMove: "Bug Bite", mainMove: "Focus Blast", dps: 89, type: "Bug/Fighting" },
  { rank: 15, name: "Reshiram", quickMove: "Fire Fang", mainMove: "Fusion Flare", dps: 89, type: "Dragon/Fire" },
  { rank: 16, name: "Palkia (Origin)", quickMove: "Dragon Tail", mainMove: "Draco Meteor", dps: 88, type: "Water/Dragon" },
  { rank: 17, name: "Landorus (Therian)", quickMove: "Mud Shot", mainMove: "Sandsear Storm", dps: 88, type: "Ground/Flying" },
  { rank: 18, name: "Rayquaza", quickMove: "Dragon Tail", mainMove: "Breaking Swipe", dps: 87, type: "Dragon/Flying" },
  { rank: 19, name: "Haxorus", quickMove: "Dragon Tail", mainMove: "Breaking Swipe", dps: 87, type: "Dragon" },
  { rank: 20, name: "Palkia", quickMove: "Dragon Tail", mainMove: "Draco Meteor", dps: 87, type: "Water/Dragon" },
  { rank: 21, name: "Xurkitree", quickMove: "Thunder Shock", mainMove: "Discharge", dps: 86, type: "Electric" },
  { rank: 22, name: "Kyurem (White)", quickMove: "Ice Fang", mainMove: "Fusion Flare", dps: 86, type: "Dragon/Ice" },
  { rank: 23, name: "Regigigas", quickMove: "Hidden Power", mainMove: "Giga Impact", dps: 85, type: "Normal" },
  { rank: 24, name: "Tapu Lele", quickMove: "Confusion", mainMove: "Nature's Madness", dps: 84, type: "Psychic/Fairy" },
  { rank: 25, name: "Yveltal", quickMove: "Snarl", mainMove: "Oblivion Wing", dps: 84, type: "Dark/Flying" },
  { rank: 26, name: "Terrakion", quickMove: "Double Kick", mainMove: "Sacred Sword", dps: 84, type: "Rock/Fighting" },
  { rank: 27, name: "Deoxys (Normal)", quickMove: "Zen Headbutt", mainMove: "Hyper Beam", dps: 83, type: "Psychic" },
  { rank: 28, name: "Dialga", quickMove: "Metal Claw", mainMove: "Draco Meteor", dps: 83, type: "Steel/Dragon" },
  { rank: 29, name: "Zekrom", quickMove: "Charge Beam", mainMove: "Fusion Bolt", dps: 83, type: "Dragon/Electric" },
  { rank: 30, name: "Chandelure", quickMove: "Fire Spin", mainMove: "Shadow Ball", dps: 82, type: "Ghost/Fire" },
  { rank: 31, name: "Enamorus (Therian)", quickMove: "Fairy Wind", mainMove: "Fly", dps: 82, type: "Fairy/Flying" },
  { rank: 32, name: "Honchkrow", quickMove: "Snarl", mainMove: "Brave Bird", dps: 82, type: "Dark/Flying" },
  { rank: 33, name: "Dragapult", quickMove: "Dragon Tail", mainMove: "Breaking Swipe", dps: 82, type: "Dragon/Ghost" },
  { rank: 34, name: "Metagross", quickMove: "Bullet Punch", mainMove: "Meteor Mash", dps: 82, type: "Steel/Psychic" },
  { rank: 35, name: "Dialga (Origin)", quickMove: "Metal Claw", mainMove: "Draco Meteor", dps: 82, type: "Steel/Dragon" },
  { rank: 36, name: "Dragonite", quickMove: "Dragon Tail", mainMove: "Draco Meteor", dps: 82, type: "Dragon/Flying" },
  { rank: 37, name: "Alakazam", quickMove: "Confusion", mainMove: "Psychic", dps: 81, type: "Psychic" },
  { rank: 38, name: "Tapu Koko", quickMove: "Volt Switch", mainMove: "Nature's Madness", dps: 81, type: "Electric/Fairy" },
  { rank: 39, name: "Tornadus (Therian)", quickMove: "Gust", mainMove: "Bleakwind Storm", dps: 81, type: "Flying" },
  { rank: 40, name: "Hoopa (Confined)", quickMove: "Confusion", mainMove: "Shadow Ball", dps: 81, type: "Psychic/Ghost" },
  { rank: 41, name: "Shaymin (Sky)", quickMove: "Magical Leaf", mainMove: "Solar Beam", dps: 81, type: "Grass/Flying" },
  { rank: 42, name: "Calyrex (Ice Rider)", quickMove: "Confusion", mainMove: "Psychic", dps: 80, type: "Psychic/Ice" },
  { rank: 43, name: "Necrozma (Dusk Mane)", quickMove: "Metal Claw", mainMove: "Future Sight", dps: 80, type: "Psychic/Steel" },
  { rank: 44, name: "Chien-Pao", quickMove: "Snarl", mainMove: "Blizzard", dps: 80, type: "Dark/Ice" },
  { rank: 45, name: "Volcarona", quickMove: "Bug Bite", mainMove: "Overheat", dps: 80, type: "Bug/Fire" },
  { rank: 46, name: "Staraptor", quickMove: "Quick Attack", mainMove: "Fly", dps: 80, type: "Normal/Flying" },
  { rank: 47, name: "Gengar", quickMove: "Lick", mainMove: "Shadow Ball", dps: 79, type: "Ghost/Poison" },
  { rank: 48, name: "Kyogre", quickMove: "Waterfall", mainMove: "Origin Pulse", dps: 79, type: "Water" },
  { rank: 49, name: "Darkrai", quickMove: "Snarl", mainMove: "Shadow Ball", dps: 79, type: "Dark" },
  { rank: 50, name: "Groudon", quickMove: "Mud Shot", mainMove: "Precipice Blades", dps: 78, type: "Ground" },
];

const allTypes = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison",
  "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
];

const typeColorMap: Record<string, string> = {
  Normal: "bg-[hsl(60,10%,55%)]", Fire: "bg-[hsl(15,80%,50%)]", Water: "bg-[hsl(220,70%,55%)]",
  Electric: "bg-[hsl(48,90%,50%)]", Grass: "bg-[hsl(100,55%,45%)]", Ice: "bg-[hsl(185,60%,60%)]",
  Fighting: "bg-[hsl(2,65%,42%)]", Poison: "bg-[hsl(280,55%,45%)]", Ground: "bg-[hsl(40,55%,50%)]",
  Flying: "bg-[hsl(255,55%,65%)]", Psychic: "bg-[hsl(340,70%,55%)]", Bug: "bg-[hsl(75,65%,40%)]",
  Rock: "bg-[hsl(45,45%,40%)]", Ghost: "bg-[hsl(265,35%,40%)]", Dragon: "bg-[hsl(260,70%,50%)]",
  Dark: "bg-[hsl(25,25%,32%)]", Steel: "bg-[hsl(220,15%,60%)]", Fairy: "bg-[hsl(330,50%,65%)]",
};

const getRankStyle = (rank: number) => {
  if (rank === 1) return "text-primary font-bold text-lg";
  if (rank === 2) return "text-muted-foreground font-bold";
  if (rank === 3) return "text-accent font-bold";
  return "text-muted-foreground";
};

const getDpsBar = (dps: number) => `${dps}%`;

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] text-white font-semibold mr-1 ${typeColorMap[type] || "bg-muted"}`}>
    {type}
  </span>
);

const LeaderboardSection = () => {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = topPokemon;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    if (selectedType) {
      list = list.filter(p => p.type.includes(selectedType));
    }
    return list;
  }, [searchQuery, selectedType]);

  const displayed = showAll || searchQuery || selectedType ? filtered : filtered.slice(0, 20);
  const hasFilters = searchQuery || selectedType;

  return (
    <section id="leaderboard" className="py-20 bg-card/40">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Top Attackers Leaderboard</h2>
          <p className="text-muted-foreground font-body">Ranked by max DPS from best moveset · Data from GameInfo</p>
        </motion.div>

        {/* Search & Filter */}
        <div className="mb-6 space-y-4 max-w-5xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Pokémon by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-card-gradient border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                !selectedType ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Types
            </button>
            {allTypes.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(selectedType === t ? null : t)}
                className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                  selectedType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card-gradient rounded-2xl border border-border shadow-card overflow-hidden max-w-5xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                  <th className="text-center p-3 w-12">#</th>
                  <th className="text-left p-3">Pokémon</th>
                  <th className="text-left p-3 hidden sm:table-cell">Type</th>
                  <th className="text-left p-3 hidden md:table-cell">Quick Move</th>
                  <th className="text-left p-3 hidden md:table-cell">Charge Move</th>
                  <th className="text-left p-3 w-32">DPS</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-body">
                      No Pokémon found matching your filters.
                    </td>
                  </tr>
                ) : (
                  displayed.map((p, i) => (
                    <motion.tr
                      key={p.rank}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.02 }}
                      className="border-t border-border/30 hover:bg-primary/5 transition-colors"
                    >
                      <td className="p-3 text-center">
                        {p.rank <= 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
                            <Trophy className={`w-4 h-4 ${p.rank === 1 ? "text-primary" : p.rank === 2 ? "text-muted-foreground" : "text-accent"}`} />
                          </span>
                        ) : (
                          <span className={getRankStyle(p.rank)}>{p.rank}</span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-foreground whitespace-nowrap">{p.name}</td>
                      <td className="p-3 hidden sm:table-cell whitespace-nowrap">
                        {p.type.split("/").map(t => <TypeBadge key={t} type={t} />)}
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{p.quickMove}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{p.mainMove}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: getDpsBar(p.dps) }}
                            />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground w-8">{p.dps}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!hasFilters && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-3 flex items-center justify-center gap-2 text-sm font-body text-secondary hover:text-primary transition-colors border-t border-border"
            >
              {showAll ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show Top 50</>}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
