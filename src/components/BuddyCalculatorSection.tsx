import { motion } from "framer-motion";
import { Search, X, Loader2, Footprints, Candy, TrendingUp, Sparkles } from "lucide-react";
import { useState, useCallback } from "react";

// Buddy distance tiers in Pokémon GO (km per candy)
const buddyDistanceMap: Record<number, number> = {};
// We'll fetch from PokeAPI species data

// Power-up candy/stardust costs per level bracket
const powerUpCosts = [
  { levels: "1–10", candy: 1, stardust: 200, total_candy: 20, total_dust: 4000 },
  { levels: "11–20", candy: 2, stardust: 1000, total_candy: 40, total_dust: 20000 },
  { levels: "21–25", candy: 3, stardust: 2500, total_candy: 30, total_dust: 25000 },
  { levels: "26–30", candy: 4, stardust: 3500, total_candy: 40, total_dust: 35000 },
  { levels: "31–35", candy: 6, stardust: 5000, total_candy: 60, total_dust: 50000 },
  { levels: "36–40", candy: 8, stardust: 7000, total_candy: 80, total_dust: 70000 },
  { levels: "41–45", candy: 10, stardust: 9000, total_candy: 100, total_dust: 90000 },
  { levels: "46–50", candy: 12, stardust: 11000, total_candy: 120, total_dust: 110000 },
  { levels: "51 (Best Buddy)", candy: 15, stardust: 13000, total_candy: 15, total_dust: 13000 },
];

// Common evolution candy costs
const commonEvoCosts: Record<string, number> = {
  "12 Candy": 12, "25 Candy": 25, "50 Candy": 50, "100 Candy": 100, "200 Candy": 200, "400 Candy": 400,
};

type BuddyData = {
  name: string;
  id: number;
  sprite: string;
  buddyDistance: number;
  evolutions: { name: string; candy: number }[];
  types: string[];
};

const typeColorMap: Record<string, string> = {
  normal: "bg-[hsl(60,10%,55%)]", fire: "bg-[hsl(15,80%,50%)]", water: "bg-[hsl(220,70%,55%)]",
  electric: "bg-[hsl(48,90%,50%)]", grass: "bg-[hsl(100,55%,45%)]", ice: "bg-[hsl(185,60%,60%)]",
  fighting: "bg-[hsl(2,65%,42%)]", poison: "bg-[hsl(280,55%,45%)]", ground: "bg-[hsl(40,55%,50%)]",
  flying: "bg-[hsl(255,55%,65%)]", psychic: "bg-[hsl(340,70%,55%)]", bug: "bg-[hsl(75,65%,40%)]",
  rock: "bg-[hsl(45,45%,40%)]", ghost: "bg-[hsl(265,35%,40%)]", dragon: "bg-[hsl(260,70%,50%)]",
  dark: "bg-[hsl(25,25%,32%)]", steel: "bg-[hsl(220,15%,60%)]", fairy: "bg-[hsl(330,50%,65%)]",
};

// Map PokeAPI habitat/growth to approximate GO buddy distances
function estimateBuddyDistance(speciesData: any): number {
  // Use egg groups / base happiness / catch rate as heuristics
  const legendary = speciesData.is_legendary || speciesData.is_mythical;
  if (legendary) return 20;

  const growthRate = speciesData.growth_rate?.name || "";
  const baseHappiness = speciesData.base_happiness ?? 70;
  const captureRate = speciesData.capture_rate ?? 45;

  if (captureRate >= 200) return 1; // Very common (Pidgey, Caterpie)
  if (captureRate >= 120) return 3; // Common (Pikachu, starters)
  if (growthRate === "slow" || baseHappiness <= 35) return 5; // Rare
  if (captureRate <= 45) return 5; // Hard to catch
  return 3; // Default
}

function parseEvolutions(chain: any): { name: string; candy: number }[] {
  const results: { name: string; candy: number }[] = [];
  function walk(node: any) {
    if (node.evolves_to?.length) {
      node.evolves_to.forEach((evo: any) => {
        const details = evo.evolution_details?.[0];
        const minLevel = details?.min_level;
        // Estimate candy cost based on evolution stage
        let candy = 25;
        if (minLevel && minLevel >= 30) candy = 100;
        else if (minLevel && minLevel >= 20) candy = 50;
        else if (!minLevel && !details?.item) candy = 50;
        // Check if it's a baby evolving
        if (node.species?.name && ["pichu", "cleffa", "igglybuff", "togepi", "tyrogue", "smoochum", "elekid", "magby", "azurill", "wynaut", "budew", "chingling", "bonsly", "mime jr.", "happiny", "munchlax", "riolu", "mantyke"].includes(node.species.name)) {
          candy = 25;
        }
        results.push({ name: evo.species.name, candy });
        walk(evo);
      });
    }
  }
  walk(chain);
  return results;
}

const BuddyCalculatorSection = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<BuddyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(20);
  const [targetLevel, setTargetLevel] = useState(40);

  const searchPokemon = useCallback(async (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setData(null);
    setSearched(true);

    try {
      const [pokRes, specRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${trimmed}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${trimmed}`),
      ]);
      if (!pokRes.ok || !specRes.ok) throw new Error("not found");

      const [pokData, specData] = await Promise.all([pokRes.json(), specRes.json()]);

      const buddyDistance = estimateBuddyDistance(specData);

      // Get evolution chain
      let evolutions: { name: string; candy: number }[] = [];
      try {
        const evoRes = await fetch(specData.evolution_chain.url);
        const evoData = await evoRes.json();
        evolutions = parseEvolutions(evoData.chain);
      } catch { /* no evo chain */ }

      setData({
        name: pokData.name,
        id: pokData.id,
        sprite: pokData.sprites?.other?.["official-artwork"]?.front_default || pokData.sprites?.front_default || "",
        buddyDistance,
        evolutions,
        types: pokData.types.map((t: any) => t.type.name),
      });
    } catch {
      setError("Pokémon not found. Try a name or number.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPokemon(query);
  };

  // Calculate power-up costs between levels
  const calculatePowerUpCost = () => {
    let totalCandy = 0;
    let totalDust = 0;
    let totalXLCandy = 0;

    for (let level = currentLevel; level < targetLevel; level++) {
      let candy = 1, dust = 200;
      if (level >= 46) { candy = 12; dust = 11000; }
      else if (level >= 41) { candy = 10; dust = 9000; }
      else if (level >= 36) { candy = 8; dust = 7000; }
      else if (level >= 31) { candy = 6; dust = 5000; }
      else if (level >= 26) { candy = 4; dust = 3500; }
      else if (level >= 21) { candy = 3; dust = 2500; }
      else if (level >= 11) { candy = 2; dust = 1000; }

      if (level > 40) {
        totalXLCandy += candy;
      } else {
        totalCandy += candy;
      }
      totalDust += dust;
    }

    return { totalCandy, totalDust, totalXLCandy };
  };

  const costs = calculatePowerUpCost();
  const kmForCandy = data ? costs.totalCandy * data.buddyDistance : 0;

  return (
    <section id="buddycalc" className="py-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Buddy & Candy Calculator</h2>
          <p className="text-muted-foreground font-body">Calculate buddy distance, candy costs for evolving & powering up</p>
        </motion.div>

        <div className="max-w-4xl">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Pokémon (e.g. machop, 66)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-20 py-3.5 rounded-2xl bg-card-gradient border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(""); setData(null); setSearched(false); setError(""); }} className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <button type="submit" disabled={loading || !query.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-body font-semibold hover:brightness-110 transition-all disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
            </div>
          </form>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive font-body mb-4">
              {error}
            </motion.p>
          )}

          {data && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Pokemon Info */}
              <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card flex items-center gap-5">
                <img src={data.sprite} alt={data.name} className="w-24 h-24 object-contain" loading="lazy" />
                <div>
                  <p className="text-xs text-muted-foreground font-mono">#{String(data.id).padStart(4, "0")}</p>
                  <h3 className="text-xl font-display text-foreground capitalize">{data.name}</h3>
                  <div className="flex gap-1.5 mt-1">
                    {data.types.map(t => (
                      <span key={t} className={`inline-block px-2 py-0.5 rounded text-[11px] text-white font-semibold capitalize ${typeColorMap[t] || "bg-muted"}`}>{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Footprints className="w-4 h-4 text-primary" />
                    <span className="text-sm font-body text-foreground font-semibold">{data.buddyDistance} km</span>
                    <span className="text-xs text-muted-foreground font-body">per candy</span>
                  </div>
                </div>
              </div>

              {/* Evolution Costs */}
              {data.evolutions.length > 0 && (
                <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
                  <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> Evolution Candy Costs
                  </h4>
                  <div className="space-y-2">
                    {data.evolutions.map((evo) => (
                      <div key={evo.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                        <span className="text-sm font-body text-foreground capitalize font-medium">{evo.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-primary font-semibold">{evo.candy} candy</span>
                          <span className="text-xs text-muted-foreground font-body">({evo.candy * data.buddyDistance} km walking)</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border flex justify-between text-xs font-body">
                      <span className="text-muted-foreground">Total to fully evolve</span>
                      <span className="font-mono text-foreground font-semibold">
                        {data.evolutions.reduce((a, e) => a + e.candy, 0)} candy ({data.evolutions.reduce((a, e) => a + e.candy, 0) * data.buddyDistance} km)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Power-Up Calculator */}
              <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
                <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" /> Power-Up Cost Calculator
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-body text-muted-foreground block mb-1">Current Level</label>
                    <select
                      value={currentLevel}
                      onChange={(e) => setCurrentLevel(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {Array.from({ length: 50 }, (_, i) => i + 1).map(l => (
                        <option key={l} value={l}>Level {l}{l > 40 ? " (XL)" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-body text-muted-foreground block mb-1">Target Level</label>
                    <select
                      value={targetLevel}
                      onChange={(e) => setTargetLevel(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {Array.from({ length: 50 }, (_, i) => i + 1).filter(l => l > currentLevel).map(l => (
                        <option key={l} value={l}>Level {l}{l > 40 ? " (XL)" : ""}{l === 51 ? " Best Buddy" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                    <p className="text-lg font-mono text-primary font-bold">{costs.totalCandy}</p>
                    <p className="text-[10px] text-muted-foreground font-body">Regular Candy</p>
                  </div>
                  {costs.totalXLCandy > 0 && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                      <p className="text-lg font-mono text-accent font-bold">{costs.totalXLCandy}</p>
                      <p className="text-[10px] text-muted-foreground font-body">XL Candy</p>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                    <p className="text-lg font-mono text-foreground font-bold">{costs.totalDust.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground font-body">Stardust</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                    <p className="text-lg font-mono text-secondary font-bold">{kmForCandy.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground font-body">km Walking</p>
                  </div>
                </div>
              </div>

              {/* Reference Table */}
              <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
                <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3">Power-Up Cost Reference</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-body">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Levels</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Candy/PU</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Dust/PU</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Total Candy</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Total Dust</th>
                      </tr>
                    </thead>
                    <tbody>
                      {powerUpCosts.map((row) => (
                        <tr key={row.levels} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-2 text-foreground">{row.levels}</td>
                          <td className="py-2 text-right text-primary font-mono">{row.candy}</td>
                          <td className="py-2 text-right font-mono text-muted-foreground">{row.stardust.toLocaleString()}</td>
                          <td className="py-2 text-right font-mono text-foreground">{row.total_candy}</td>
                          <td className="py-2 text-right font-mono text-foreground">{row.total_dust.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {!data && !error && !loading && !searched && (
            <div className="text-center py-12">
              <Footprints className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-body text-sm">Search a Pokémon to calculate buddy distance and candy costs</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BuddyCalculatorSection;
