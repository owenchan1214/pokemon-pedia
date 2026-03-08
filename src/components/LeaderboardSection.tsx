import { motion } from "framer-motion";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type PokemonEntry = { rank: number; name: string; quickMove: string; mainMove: string; dps: number };

const topPokemon: PokemonEntry[] = [
  { rank: 1, name: "Zacian (Crowned Sword)", quickMove: "Metal Claw", mainMove: "Giga Impact", dps: 100 },
  { rank: 2, name: "Calyrex (Shadow Rider)", quickMove: "Confusion", mainMove: "Shadow Ball", dps: 99 },
  { rank: 3, name: "Deoxys (Attack)", quickMove: "Zen Headbutt", mainMove: "Zap Cannon", dps: 98 },
  { rank: 4, name: "Thundurus (Therian)", quickMove: "Volt Switch", mainMove: "Wildbolt Storm", dps: 97 },
  { rank: 5, name: "Blacephalon", quickMove: "Incinerate", mainMove: "Shadow Ball", dps: 94 },
  { rank: 6, name: "Mewtwo", quickMove: "Confusion", mainMove: "Psystrike", dps: 93 },
  { rank: 7, name: "Lucario", quickMove: "Force Palm", mainMove: "Aura Sphere", dps: 93 },
  { rank: 8, name: "Hoopa (Unbound)", quickMove: "Confusion", mainMove: "Psychic", dps: 93 },
  { rank: 9, name: "Kyurem (Black)", quickMove: "Dragon Tail", mainMove: "Fusion Bolt", dps: 92 },
  { rank: 10, name: "Enamorus (Incarnate)", quickMove: "Fairy Wind", mainMove: "Fly", dps: 92 },
  { rank: 11, name: "Salamence", quickMove: "Dragon Tail", mainMove: "Fly", dps: 92 },
  { rank: 12, name: "G. Darmanitan (Zen)", quickMove: "Ice Fang", mainMove: "Avalanche", dps: 91 },
  { rank: 13, name: "Kartana", quickMove: "Razor Leaf", mainMove: "Leaf Blade", dps: 90 },
  { rank: 14, name: "Pheromosa", quickMove: "Bug Bite", mainMove: "Focus Blast", dps: 89 },
  { rank: 15, name: "Reshiram", quickMove: "Fire Fang", mainMove: "Fusion Flare", dps: 89 },
  { rank: 16, name: "Palkia (Origin)", quickMove: "Dragon Tail", mainMove: "Draco Meteor", dps: 88 },
  { rank: 17, name: "Landorus (Therian)", quickMove: "Mud Shot", mainMove: "Sandsear Storm", dps: 88 },
  { rank: 18, name: "Rayquaza", quickMove: "Dragon Tail", mainMove: "Breaking Swipe", dps: 87 },
  { rank: 19, name: "Haxorus", quickMove: "Dragon Tail", mainMove: "Breaking Swipe", dps: 87 },
  { rank: 20, name: "Palkia", quickMove: "Dragon Tail", mainMove: "Draco Meteor", dps: 87 },
  { rank: 21, name: "Xurkitree", quickMove: "Thunder Shock", mainMove: "Discharge", dps: 86 },
  { rank: 22, name: "Kyurem (White)", quickMove: "Ice Fang", mainMove: "Fusion Flare", dps: 86 },
  { rank: 23, name: "Regigigas", quickMove: "Hidden Power", mainMove: "Giga Impact", dps: 85 },
  { rank: 24, name: "Tapu Lele", quickMove: "Confusion", mainMove: "Nature's Madness", dps: 84 },
  { rank: 25, name: "Yveltal", quickMove: "Snarl", mainMove: "Oblivion Wing", dps: 84 },
  { rank: 26, name: "Terrakion", quickMove: "Double Kick", mainMove: "Sacred Sword", dps: 84 },
  { rank: 27, name: "Deoxys (Normal)", quickMove: "Zen Headbutt", mainMove: "Hyper Beam", dps: 83 },
  { rank: 28, name: "Dialga", quickMove: "Metal Claw", mainMove: "Draco Meteor", dps: 83 },
  { rank: 29, name: "Zekrom", quickMove: "Charge Beam", mainMove: "Fusion Bolt", dps: 83 },
  { rank: 30, name: "Chandelure", quickMove: "Fire Spin", mainMove: "Shadow Ball", dps: 82 },
  { rank: 31, name: "Enamorus (Therian)", quickMove: "Fairy Wind", mainMove: "Fly", dps: 82 },
  { rank: 32, name: "Honchkrow", quickMove: "Snarl", mainMove: "Brave Bird", dps: 82 },
  { rank: 33, name: "Dragapult", quickMove: "Dragon Tail", mainMove: "Breaking Swipe", dps: 82 },
  { rank: 34, name: "Metagross", quickMove: "Bullet Punch", mainMove: "Meteor Mash", dps: 82 },
  { rank: 35, name: "Dialga (Origin)", quickMove: "Metal Claw", mainMove: "Draco Meteor", dps: 82 },
  { rank: 36, name: "Dragonite", quickMove: "Dragon Tail", mainMove: "Draco Meteor", dps: 82 },
  { rank: 37, name: "Alakazam", quickMove: "Confusion", mainMove: "Psychic", dps: 81 },
  { rank: 38, name: "Tapu Koko", quickMove: "Volt Switch", mainMove: "Nature's Madness", dps: 81 },
  { rank: 39, name: "Tornadus (Therian)", quickMove: "Gust", mainMove: "Bleakwind Storm", dps: 81 },
  { rank: 40, name: "Hoopa (Confined)", quickMove: "Confusion", mainMove: "Shadow Ball", dps: 81 },
  { rank: 41, name: "Shaymin (Sky)", quickMove: "Magical Leaf", mainMove: "Solar Beam", dps: 81 },
  { rank: 42, name: "Calyrex (Ice Rider)", quickMove: "Confusion", mainMove: "Psychic", dps: 80 },
  { rank: 43, name: "Necrozma (Dusk Mane)", quickMove: "Metal Claw", mainMove: "Future Sight", dps: 80 },
  { rank: 44, name: "Chien-Pao", quickMove: "Snarl", mainMove: "Blizzard", dps: 80 },
  { rank: 45, name: "Volcarona", quickMove: "Bug Bite", mainMove: "Overheat", dps: 80 },
  { rank: 46, name: "Staraptor", quickMove: "Quick Attack", mainMove: "Fly", dps: 80 },
  { rank: 47, name: "Gengar", quickMove: "Lick", mainMove: "Shadow Ball", dps: 79 },
  { rank: 48, name: "Kyogre", quickMove: "Waterfall", mainMove: "Origin Pulse", dps: 79 },
  { rank: 49, name: "Darkrai", quickMove: "Snarl", mainMove: "Shadow Ball", dps: 79 },
  { rank: 50, name: "Groudon", quickMove: "Mud Shot", mainMove: "Precipice Blades", dps: 78 },
];

const getRankStyle = (rank: number) => {
  if (rank === 1) return "text-primary font-bold text-lg";
  if (rank === 2) return "text-muted-foreground font-bold";
  if (rank === 3) return "text-accent font-bold";
  return "text-muted-foreground";
};

const getDpsBar = (dps: number) => `${dps}%`;

const LeaderboardSection = () => {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? topPokemon : topPokemon.slice(0, 20);

  return (
    <section id="leaderboard" className="py-20 bg-card/40">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Top Attackers Leaderboard</h2>
          <p className="text-muted-foreground font-body">Ranked by max DPS from best moveset · Data from GameInfo</p>
        </motion.div>

        <div className="bg-card-gradient rounded-2xl border border-border shadow-card overflow-hidden max-w-5xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                  <th className="text-center p-3 w-12">#</th>
                  <th className="text-left p-3">Pokémon</th>
                  <th className="text-left p-3 hidden md:table-cell">Quick Move</th>
                  <th className="text-left p-3 hidden md:table-cell">Charge Move</th>
                  <th className="text-left p-3 w-32">DPS</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((p, i) => (
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
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-body text-secondary hover:text-primary transition-colors border-t border-border"
          >
            {showAll ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show Top 50</>}
          </button>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
