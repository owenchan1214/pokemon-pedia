import { motion } from "framer-motion";
import { Calculator, Search, Loader2, X, Star, TrendingUp } from "lucide-react";
import { useState, useCallback } from "react";

// CP multipliers by trainer level (half-levels included for power-up reference)
const cpMultipliers: Record<number, number> = {
  1: 0.094, 1.5: 0.1351374318, 2: 0.16639787, 2.5: 0.192650919, 3: 0.21573247,
  3.5: 0.2365726613, 4: 0.25572005, 4.5: 0.2735303812, 5: 0.29024988,
  5.5: 0.3060573775, 6: 0.3210876, 6.5: 0.3354450362, 7: 0.34921268,
  7.5: 0.3624577511, 8: 0.3752356, 8.5: 0.387592416, 9: 0.39956728,
  9.5: 0.4111935514, 10: 0.4225, 10.5: 0.4329264091, 11: 0.44310755,
  11.5: 0.4530599591, 12: 0.4627984, 12.5: 0.472336093, 13: 0.48168495,
  13.5: 0.4908558003, 14: 0.49985844, 14.5: 0.508701765, 15: 0.51739395,
  15.5: 0.5259425113, 16: 0.5343543, 16.5: 0.5426357375, 17: 0.5507927,
  17.5: 0.5588305862, 18: 0.5667545, 18.5: 0.5745691333, 19: 0.5822789,
  19.5: 0.5898879072, 20: 0.5974, 20.5: 0.6048236651, 21: 0.6121573,
  21.5: 0.6194041216, 22: 0.6265671, 22.5: 0.6336491432, 23: 0.64065295,
  23.5: 0.6475809666, 24: 0.65443563, 24.5: 0.6612192524, 25: 0.667934,
  25.5: 0.6745818959, 26: 0.6811649, 26.5: 0.6876849038, 27: 0.69414365,
  27.5: 0.7005428Pokemon, 28: 0.7068842, 28.5: 0.7131691091, 29: 0.7193991,
  29.5: 0.7255756136, 30: 0.7317, 30.5: 0.7347410093, 31: 0.7377695,
  31.5: 0.7407855938, 32: 0.74378943, 32.5: 0.7467812109, 33: 0.74976104,
  33.5: 0.7527290867, 34: 0.7556855, 34.5: 0.7586303683, 35: 0.76156384,
  35.5: 0.7644860647, 36: 0.76739717, 36.5: 0.7702972656, 37: 0.7731865,
  37.5: 0.7760649Pokemon, 38: 0.77893275, 38.5: 0.7817900Pokemon, 39: 0.784637,
  39.5: 0.7874736075, 40: 0.7903, 40.5: 0.792803968, 41: 0.79530001,
  41.5: 0.797800Pokemon, 42: 0.8003, 42.5: 0.802799Pokemon, 43: 0.8053,
  43.5: 0.807799Pokemon, 44: 0.8103, 44.5: 0.812799Pokemon, 45: 0.8153,
  45.5: 0.817699Pokemon, 46: 0.8201, 46.5: 0.822499Pokemon, 47: 0.8249,
  47.5: 0.827299Pokemon, 48: 0.8297, 48.5: 0.832099Pokemon, 49: 0.8345,
  49.5: 0.836899Pokemon, 50: 0.8393, 50.5: 0.841699Pokemon, 51: 0.8441,
};

// Stardust costs by level
const dustCostByLevel: Record<number, number> = {
  1: 200, 1.5: 200, 2: 200, 2.5: 200, 3: 400, 3.5: 400, 4: 400, 4.5: 400,
  5: 600, 5.5: 600, 6: 600, 6.5: 600, 7: 800, 7.5: 800, 8: 800, 8.5: 800,
  9: 1000, 9.5: 1000, 10: 1000, 10.5: 1000, 11: 1300, 11.5: 1300, 12: 1300, 12.5: 1300,
  13: 1600, 13.5: 1600, 14: 1600, 14.5: 1600, 15: 1900, 15.5: 1900, 16: 1900, 16.5: 1900,
  17: 2200, 17.5: 2200, 18: 2200, 18.5: 2200, 19: 2500, 19.5: 2500, 20: 2500, 20.5: 2500,
  21: 3000, 21.5: 3000, 22: 3000, 22.5: 3000, 23: 3500, 23.5: 3500, 24: 3500, 24.5: 3500,
  25: 4000, 25.5: 4000, 26: 4000, 26.5: 4000, 27: 4500, 27.5: 4500, 28: 4500, 28.5: 4500,
  29: 5000, 29.5: 5000, 30: 5000, 30.5: 5000, 31: 6000, 31.5: 6000, 32: 6000, 32.5: 6000,
  33: 7000, 33.5: 7000, 34: 7000, 34.5: 7000, 35: 8000, 35.5: 8000, 36: 8000, 36.5: 8000,
  37: 9000, 37.5: 9000, 38: 9000, 38.5: 9000, 39: 10000, 39.5: 10000, 40: 10000, 40.5: 10000,
  41: 11000, 41.5: 11000, 42: 11000, 42.5: 11000, 43: 12000, 43.5: 12000, 44: 12000, 44.5: 12000,
  45: 13000, 45.5: 13000, 46: 13000, 46.5: 13000, 47: 14000, 47.5: 14000, 48: 14000, 48.5: 14000,
  49: 15000, 49.5: 15000, 50: 15000, 50.5: 15000, 51: 15000,
};

type BaseStats = { attack: number; defense: number; stamina: number };
type IVResult = { level: number; attack: number; defense: number; stamina: number; perfection: number; cp: number };

function calculateCP(baseAtk: number, baseDef: number, baseSta: number, ivAtk: number, ivDef: number, ivSta: number, level: number): number {
  const cpm = cpMultipliers[level];
  if (!cpm) return 0;
  const atk = baseAtk + ivAtk;
  const def = baseDef + ivDef;
  const sta = baseSta + ivSta;
  return Math.max(10, Math.floor((atk * Math.sqrt(def) * Math.sqrt(sta) * cpm * cpm) / 10));
}

function calculateHP(baseSta: number, ivSta: number, level: number): number {
  const cpm = cpMultipliers[level];
  if (!cpm) return 0;
  return Math.max(10, Math.floor((baseSta + ivSta) * cpm));
}

function findIVs(baseStats: BaseStats, targetCP: number, targetHP: number, dustCost: number): IVResult[] {
  const results: IVResult[] = [];
  
  // Find possible levels from dust cost
  const possibleLevels: number[] = [];
  for (const [lvl, cost] of Object.entries(dustCostByLevel)) {
    if (cost === dustCost) possibleLevels.push(parseFloat(lvl));
  }
  
  if (possibleLevels.length === 0) return results;

  for (const level of possibleLevels) {
    for (let atkIV = 0; atkIV <= 15; atkIV++) {
      for (let defIV = 0; defIV <= 15; defIV++) {
        for (let staIV = 0; staIV <= 15; staIV++) {
          const cp = calculateCP(baseStats.attack, baseStats.defense, baseStats.stamina, atkIV, defIV, staIV, level);
          const hp = calculateHP(baseStats.stamina, staIV, level);
          
          if (cp === targetCP && hp === targetHP) {
            results.push({
              level,
              attack: atkIV,
              defense: defIV,
              stamina: staIV,
              perfection: Math.round(((atkIV + defIV + staIV) / 45) * 100),
              cp,
            });
          }
        }
      }
    }
  }

  return results.sort((a, b) => b.perfection - a.perfection);
}

const dustOptions = [200, 400, 600, 800, 1000, 1300, 1600, 1900, 2200, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000];

const IVBar = ({ value, label }: { value: number; label: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-body text-muted-foreground w-8">{label}</span>
    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${value === 15 ? "bg-primary" : value >= 13 ? "bg-secondary" : value >= 10 ? "bg-accent" : "bg-destructive"}`}
        initial={{ width: 0 }}
        animate={{ width: `${(value / 15) * 100}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
    <span className="text-xs font-mono text-foreground font-semibold w-5 text-right">{value}</span>
  </div>
);

const IVCalculatorSection = () => {
  const [pokemonName, setPokemonName] = useState("");
  const [cp, setCp] = useState("");
  const [hp, setHp] = useState("");
  const [dust, setDust] = useState(200);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<IVResult[]>([]);
  const [pokemonInfo, setPokemonInfo] = useState<{ name: string; sprite: string; types: string[] } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const typeColorMap: Record<string, string> = {
    normal: "bg-[hsl(60,10%,55%)]", fire: "bg-[hsl(15,80%,50%)]", water: "bg-[hsl(220,70%,55%)]",
    electric: "bg-[hsl(48,90%,50%)]", grass: "bg-[hsl(100,55%,45%)]", ice: "bg-[hsl(185,60%,60%)]",
    fighting: "bg-[hsl(2,65%,42%)]", poison: "bg-[hsl(280,55%,45%)]", ground: "bg-[hsl(40,55%,50%)]",
    flying: "bg-[hsl(255,55%,65%)]", psychic: "bg-[hsl(340,70%,55%)]", bug: "bg-[hsl(75,65%,40%)]",
    rock: "bg-[hsl(45,45%,40%)]", ghost: "bg-[hsl(265,35%,40%)]", dragon: "bg-[hsl(260,70%,50%)]",
    dark: "bg-[hsl(25,25%,32%)]", steel: "bg-[hsl(220,15%,60%)]", fairy: "bg-[hsl(330,50%,65%)]",
  };

  const calculate = useCallback(async () => {
    const trimmed = pokemonName.trim().toLowerCase();
    if (!trimmed || !cp || !hp) return;
    
    setLoading(true);
    setError("");
    setResults([]);
    setPokemonInfo(null);
    setHasSearched(true);

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${trimmed}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();

      const baseStats: BaseStats = {
        attack: data.stats.find((s: any) => s.stat.name === "attack")?.base_stat || 0,
        defense: data.stats.find((s: any) => s.stat.name === "defense")?.base_stat || 0,
        stamina: data.stats.find((s: any) => s.stat.name === "hp")?.base_stat || 0,
      };

      setPokemonInfo({
        name: data.name,
        sprite: data.sprites?.other?.["official-artwork"]?.front_default || data.sprites?.front_default || "",
        types: data.types.map((t: any) => t.type.name),
      });

      const ivResults = findIVs(baseStats, parseInt(cp), parseInt(hp), dust);
      setResults(ivResults);

      if (ivResults.length === 0) {
        setError("No IV combinations match. Double-check CP, HP, and Stardust cost.");
      }
    } catch {
      setError("Pokémon not found. Try a name (e.g. pikachu) or number.");
    } finally {
      setLoading(false);
    }
  }, [pokemonName, cp, hp, dust]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculate();
  };

  const reset = () => {
    setPokemonName("");
    setCp("");
    setHp("");
    setDust(200);
    setResults([]);
    setPokemonInfo(null);
    setError("");
    setHasSearched(false);
  };

  return (
    <section id="ivcalc" className="py-20 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">IV Calculator</h2>
          <p className="text-muted-foreground font-body">Estimate your Pokémon's hidden Individual Values from CP, HP, and Stardust cost</p>
        </motion.div>

        <div className="max-w-4xl">
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Pokemon Name */}
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Pokémon</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. pikachu, 25"
                    value={pokemonName}
                    onChange={(e) => setPokemonName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                </div>
              </div>

              {/* Stardust */}
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Stardust to Power Up</label>
                <select
                  value={dust}
                  onChange={(e) => setDust(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                >
                  {dustOptions.map(d => (
                    <option key={d} value={d}>{d.toLocaleString()} Stardust</option>
                  ))}
                </select>
              </div>

              {/* CP */}
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">CP</label>
                <input
                  type="number"
                  placeholder="Current CP"
                  value={cp}
                  onChange={(e) => setCp(e.target.value)}
                  min="10"
                  max="9999"
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>

              {/* HP */}
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">HP</label>
                <input
                  type="number"
                  placeholder="Current HP"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  min="10"
                  max="999"
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !pokemonName.trim() || !cp || !hp}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-body font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                Calculate IVs
              </button>
              {hasSearched && (
                <button type="button" onClick={reset} className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-body hover:bg-muted/80 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive font-body mb-4">
              {error}
            </motion.p>
          )}

          {pokemonInfo && results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Pokemon Info Header */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card-gradient border border-border shadow-card mb-4">
                <img src={pokemonInfo.sprite} alt={pokemonInfo.name} className="w-16 h-16 object-contain" loading="lazy" />
                <div>
                  <h3 className="text-lg font-display text-foreground capitalize">{pokemonInfo.name}</h3>
                  <div className="flex gap-1 mt-1">
                    {pokemonInfo.types.map(t => (
                      <span key={t} className={`inline-block px-1.5 py-0.5 rounded text-[10px] text-white font-semibold capitalize ${typeColorMap[t] || "bg-muted"}`}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-muted-foreground font-body">{results.length} possible combination{results.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-3">
                {results.slice(0, 10).map((result, i) => (
                  <motion.div
                    key={`${result.level}-${result.attack}-${result.defense}-${result.stamina}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-body font-bold px-2 py-0.5 rounded-lg ${
                          result.perfection >= 96 ? "bg-primary/20 text-primary" :
                          result.perfection >= 82 ? "bg-secondary/20 text-secondary" :
                          result.perfection >= 67 ? "bg-accent/20 text-accent" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {result.perfection >= 96 ? "★★★" : result.perfection >= 82 ? "★★" : result.perfection >= 67 ? "★" : "○"} {result.perfection}%
                        </span>
                        <span className="text-[11px] text-muted-foreground font-body">Level {result.level}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <TrendingUp className="w-3 h-3" />
                        {result.attack}/{result.defense}/{result.stamina}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <IVBar value={result.attack} label="ATK" />
                      <IVBar value={result.defense} label="DEF" />
                      <IVBar value={result.stamina} label="STA" />
                    </div>
                  </motion.div>
                ))}
                {results.length > 10 && (
                  <p className="text-center text-xs text-muted-foreground font-body py-2">
                    Showing top 10 of {results.length} combinations
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {!hasSearched && (
            <div className="text-center py-12">
              <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-body text-sm">Enter your Pokémon's details to discover its hidden IVs</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default IVCalculatorSection;
