import { motion } from "framer-motion";
import { Sparkles, Search, X, Loader2, Dice1, Info } from "lucide-react";
import { useState, useCallback } from "react";

const typeColorMap: Record<string, string> = {
  normal: "bg-[hsl(60,10%,55%)]", fire: "bg-[hsl(15,80%,50%)]", water: "bg-[hsl(220,70%,55%)]",
  electric: "bg-[hsl(48,90%,50%)]", grass: "bg-[hsl(100,55%,45%)]", ice: "bg-[hsl(185,60%,60%)]",
  fighting: "bg-[hsl(2,65%,42%)]", poison: "bg-[hsl(280,55%,45%)]", ground: "bg-[hsl(40,55%,50%)]",
  flying: "bg-[hsl(255,55%,65%)]", psychic: "bg-[hsl(340,70%,55%)]", bug: "bg-[hsl(75,65%,40%)]",
  rock: "bg-[hsl(45,45%,40%)]", ghost: "bg-[hsl(265,35%,40%)]", dragon: "bg-[hsl(260,70%,50%)]",
  dark: "bg-[hsl(25,25%,32%)]", steel: "bg-[hsl(220,15%,60%)]", fairy: "bg-[hsl(330,50%,65%)]",
};

// Pokémon GO shiny rate categories
type ShinyCategory = "standard" | "boosted" | "permaboost" | "legendary" | "mythical" | "community" | "raid_day" | "safari";

type ShinyRateInfo = {
  category: ShinyCategory;
  baseRate: number;
  label: string;
  color: string;
  description: string;
};

const shinyRates: Record<ShinyCategory, ShinyRateInfo> = {
  standard: { category: "standard", baseRate: 1 / 512, label: "Standard", color: "text-muted-foreground", description: "Wild encounters, eggs, research" },
  boosted: { category: "boosted", baseRate: 1 / 128, label: "Boosted", color: "text-secondary", description: "During spotlight hours or special events" },
  permaboost: { category: "permaboost", baseRate: 1 / 64, label: "Permaboost", color: "text-primary", description: "Onix, Scyther, Sneasel, Aerodactyl, etc." },
  legendary: { category: "legendary", baseRate: 1 / 20, label: "Legendary Raid", color: "text-[hsl(var(--legendary))]", description: "T5 raid bosses with shiny available" },
  mythical: { category: "mythical", baseRate: 1 / 20, label: "Mythical", color: "text-[hsl(var(--legendary))]", description: "EX raids and special mythical encounters" },
  community: { category: "community", baseRate: 1 / 25, label: "Community Day", color: "text-[hsl(var(--shiny))]", description: "During Community Day event hours" },
  raid_day: { category: "raid_day", baseRate: 1 / 10, label: "Raid Day", color: "text-accent", description: "Special 3-hour raid day events" },
  safari: { category: "safari", baseRate: 1 / 50, label: "Safari Zone / GO Fest", color: "text-[hsl(var(--mega))]", description: "Ticketed live events" },
};

// Known permaboost species
const permaboostSpecies = new Set([
  "onix", "scyther", "pinsir", "aerodactyl", "sneasel", "skarmory", "pineco",
  "gligar", "absol", "mawile", "clamperl", "bronzor", "alomomola", "espurr",
  "klink", "timburr", "rockruff", "jangmo-o", "noibat",
]);

// Known legendaries/mythicals with shiny
const legendarySpecies = new Set([
  "articuno", "zapdos", "moltres", "mewtwo", "raikou", "entei", "suicune",
  "lugia", "ho-oh", "regirock", "regice", "registeel", "latias", "latios",
  "kyogre", "groudon", "rayquaza", "dialga", "palkia", "giratina", "heatran",
  "cresselia", "cobalion", "terrakion", "virizion", "reshiram", "zekrom",
  "landorus", "tornadus", "thundurus", "xerneas", "yveltal", "zygarde",
  "tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini", "solgaleo", "lunala",
  "nihilego", "buzzwole", "pheromosa", "xurkitree", "kartana", "celesteela",
  "guzzlord", "zacian", "zamazenta", "regieleki", "regidrago",
]);

const mythicalSpecies = new Set([
  "mew", "celebi", "jirachi", "deoxys", "darkrai", "shaymin",
  "victini", "genesect", "meltan", "melmetal",
]);

function getShinyCategory(name: string, isLegendary: boolean, isMythical: boolean): ShinyCategory {
  if (mythicalSpecies.has(name) || isMythical) return "mythical";
  if (legendarySpecies.has(name) || isLegendary) return "legendary";
  if (permaboostSpecies.has(name)) return "permaboost";
  return "standard";
}

type PokemonShinyData = {
  name: string;
  id: number;
  sprite: string;
  shinySprite: string;
  types: string[];
  hasShiny: boolean;
  category: ShinyCategory;
};

const ShinyOddsCalculator = () => {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState<PokemonShinyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [encounters, setEncounters] = useState(50);

  const searchPokemon = useCallback(async (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setPokemon(null);
    setSearched(true);

    try {
      const [pokRes, specRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${trimmed}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${trimmed}`),
      ]);
      if (!pokRes.ok || !specRes.ok) throw new Error("not found");
      const [pokData, specData] = await Promise.all([pokRes.json(), specRes.json()]);

      const hasShiny = !!pokData.sprites?.front_shiny;
      const category = getShinyCategory(
        specData.name,
        specData.is_legendary,
        specData.is_mythical,
      );

      setPokemon({
        name: pokData.name,
        id: pokData.id,
        sprite: pokData.sprites?.other?.["official-artwork"]?.front_default || pokData.sprites?.front_default || "",
        shinySprite: pokData.sprites?.other?.["official-artwork"]?.front_shiny || pokData.sprites?.front_shiny || "",
        types: pokData.types.map((t: any) => t.type.name),
        hasShiny,
        category,
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

  // Probability of at least one shiny in N encounters
  const calcProb = (rate: number, n: number) => {
    return 1 - Math.pow(1 - rate, n);
  };

  const rateInfo = pokemon ? shinyRates[pokemon.category] : null;

  // All scenarios for this Pokémon
  const scenarios = pokemon ? [
    { ...shinyRates[pokemon.category], label: `${shinyRates[pokemon.category].label} (Base)` },
    ...(pokemon.category === "standard" ? [shinyRates.boosted, shinyRates.community] : []),
    ...(pokemon.category === "permaboost" ? [shinyRates.community] : []),
    ...(pokemon.category === "legendary" ? [shinyRates.raid_day] : []),
    shinyRates.safari,
  ] : [];

  return (
    <section id="shinyodds" className="py-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Shiny Odds Calculator</h2>
          <p className="text-muted-foreground font-body">Check shiny rates across different encounter methods</p>
        </motion.div>

        <div className="max-w-4xl">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Pokémon (e.g. pikachu, rayquaza)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-20 py-3.5 rounded-2xl bg-card-gradient border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(""); setPokemon(null); setSearched(false); setError(""); }} className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <button type="submit" disabled={loading || !query.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-body font-semibold hover:brightness-110 transition-all disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </button>
            </div>
          </form>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive font-body mb-4">{error}</motion.p>
          )}

          {pokemon && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Pokemon Header */}
              <div className="p-5 rounded-2xl bg-card-gradient border border-[hsl(var(--shiny))]/30 shadow-card flex flex-col sm:flex-row items-center gap-5">
                <div className="flex gap-3 items-center">
                  <div className="relative">
                    <img src={pokemon.sprite} alt={pokemon.name} className="w-20 h-20 object-contain" loading="lazy" />
                  </div>
                  {pokemon.shinySprite && (
                    <div className="relative">
                      <img src={pokemon.shinySprite} alt={`${pokemon.name} shiny`} className="w-20 h-20 object-contain" loading="lazy" />
                      <span className="absolute -top-1 -right-1 text-xs">✨</span>
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs text-muted-foreground font-mono">#{String(pokemon.id).padStart(4, "0")}</p>
                  <h3 className="text-xl font-display text-foreground capitalize">{pokemon.name}</h3>
                  <div className="flex gap-1.5 mt-1 justify-center sm:justify-start">
                    {pokemon.types.map(t => (
                      <span key={t} className={`inline-block px-2 py-0.5 rounded text-[11px] text-white font-semibold capitalize ${typeColorMap[t] || "bg-muted"}`}>{t}</span>
                    ))}
                  </div>
                  {rateInfo && (
                    <div className="mt-2 flex items-center gap-2">
                      <Sparkles className={`w-3.5 h-3.5 ${rateInfo.color}`} />
                      <span className={`text-sm font-body font-semibold ${rateInfo.color}`}>{rateInfo.label}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        1/{Math.round(1 / rateInfo.baseRate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Encounter Slider */}
              <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
                <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Dice1 className="w-3.5 h-3.5 text-primary" /> Probability Calculator
                </h4>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-body text-muted-foreground">Number of Encounters</label>
                    <input
                      type="number"
                      value={encounters}
                      onChange={(e) => setEncounters(Math.max(1, Math.min(5000, Number(e.target.value))))}
                      className="w-20 px-2 py-1 rounded-lg bg-background border border-border text-foreground text-sm font-mono text-right focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={2000}
                    value={encounters}
                    onChange={(e) => setEncounters(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                    <span>1</span>
                    <span>500</span>
                    <span>1000</span>
                    <span>2000</span>
                  </div>
                </div>

                {/* Probability Results */}
                <div className="space-y-2">
                  {scenarios.map((scenario) => {
                    const prob = calcProb(scenario.baseRate, encounters);
                    const pct = (prob * 100).toFixed(1);
                    return (
                      <div key={scenario.category + scenario.label} className="p-3 rounded-xl bg-muted/30 border border-border">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <span className={`text-xs font-body font-semibold ${scenario.color}`}>{scenario.label}</span>
                            <span className="text-[10px] text-muted-foreground font-mono ml-2">1/{Math.round(1 / scenario.baseRate)}</span>
                          </div>
                          <span className={`text-sm font-mono font-bold ${
                            prob >= 0.9 ? "text-primary" : prob >= 0.5 ? "text-secondary" : prob >= 0.25 ? "text-accent" : "text-muted-foreground"
                          }`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              prob >= 0.9 ? "bg-primary" : prob >= 0.5 ? "bg-secondary" : prob >= 0.25 ? "bg-accent" : "bg-muted-foreground/40"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, prob * 100)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-body mt-1">{scenario.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              {rateInfo && (
                <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
                  <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-secondary" /> Quick Stats
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                      <p className="text-lg font-mono text-[hsl(var(--shiny))] font-bold">
                        {Math.round(1 / rateInfo.baseRate)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-body">Avg encounters for 1 shiny</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                      <p className="text-lg font-mono text-primary font-bold">
                        {Math.ceil(Math.log(1 - 0.5) / Math.log(1 - rateInfo.baseRate))}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-body">50% chance mark</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                      <p className="text-lg font-mono text-secondary font-bold">
                        {Math.ceil(Math.log(1 - 0.9) / Math.log(1 - rateInfo.baseRate))}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-body">90% chance mark</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                      <p className="text-lg font-mono text-accent font-bold">
                        {Math.ceil(Math.log(1 - 0.99) / Math.log(1 - rateInfo.baseRate))}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-body">99% chance mark</p>
                    </div>
                  </div>
                </div>
              )}

              {/* All Rates Reference */}
              <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
                <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3">All Shiny Rates in Pokémon GO</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-body">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Method</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Rate</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">%</th>
                        <th className="text-right py-2 text-muted-foreground font-medium hidden sm:table-cell">50% in</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(shinyRates).map((rate) => (
                        <tr key={rate.category} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                          pokemon.category === rate.category ? "bg-primary/5" : ""
                        }`}>
                          <td className={`py-2 font-medium ${rate.color}`}>{rate.label}</td>
                          <td className="py-2 text-right font-mono text-foreground">1/{Math.round(1 / rate.baseRate)}</td>
                          <td className="py-2 text-right font-mono text-muted-foreground">{(rate.baseRate * 100).toFixed(2)}%</td>
                          <td className="py-2 text-right font-mono text-muted-foreground hidden sm:table-cell">
                            {Math.ceil(Math.log(1 - 0.5) / Math.log(1 - rate.baseRate))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {!pokemon && !error && !loading && !searched && (
            <div className="text-center py-12">
              <Sparkles className="w-10 h-10 text-[hsl(var(--shiny))]/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-body text-sm">Search a Pokémon to see its shiny odds across all encounter methods</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShinyOddsCalculator;
