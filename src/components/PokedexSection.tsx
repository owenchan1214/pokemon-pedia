import { motion } from "framer-motion";
import { Search, X, Loader2, Swords, Shield, Zap, Heart, Activity, Wind } from "lucide-react";
import { useState, useCallback } from "react";

const typeColorMap: Record<string, string> = {
  normal: "bg-[hsl(60,10%,55%)]", fire: "bg-[hsl(15,80%,50%)]", water: "bg-[hsl(220,70%,55%)]",
  electric: "bg-[hsl(48,90%,50%)]", grass: "bg-[hsl(100,55%,45%)]", ice: "bg-[hsl(185,60%,60%)]",
  fighting: "bg-[hsl(2,65%,42%)]", poison: "bg-[hsl(280,55%,45%)]", ground: "bg-[hsl(40,55%,50%)]",
  flying: "bg-[hsl(255,55%,65%)]", psychic: "bg-[hsl(340,70%,55%)]", bug: "bg-[hsl(75,65%,40%)]",
  rock: "bg-[hsl(45,45%,40%)]", ghost: "bg-[hsl(265,35%,40%)]", dragon: "bg-[hsl(260,70%,50%)]",
  dark: "bg-[hsl(25,25%,32%)]", steel: "bg-[hsl(220,15%,60%)]", fairy: "bg-[hsl(330,50%,65%)]",
};

// Types that are super effective against each type
const weaknesses: Record<string, string[]> = {
  normal: ["fighting"], fire: ["water", "ground", "rock"], water: ["electric", "grass"],
  electric: ["ground"], grass: ["fire", "ice", "poison", "flying", "bug"],
  ice: ["fire", "fighting", "rock", "steel"], fighting: ["flying", "psychic", "fairy"],
  poison: ["ground", "psychic"], ground: ["water", "grass", "ice"],
  flying: ["electric", "ice", "rock"], psychic: ["bug", "ghost", "dark"],
  bug: ["fire", "flying", "rock"], rock: ["water", "grass", "fighting", "ground", "steel"],
  ghost: ["ghost", "dark"], dragon: ["ice", "dragon", "fairy"],
  dark: ["fighting", "bug", "fairy"], steel: ["fire", "fighting", "ground"],
  fairy: ["poison", "steel"],
};

// Best counter types for each defensive type
const getCounterTypes = (types: string[]): string[] => {
  const counterMap = new Map<string, number>();
  types.forEach(t => {
    (weaknesses[t] || []).forEach(c => {
      counterMap.set(c, (counterMap.get(c) || 0) + 1);
    });
  });
  return Array.from(counterMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([type]) => type);
};

type PokemonData = {
  name: string;
  id: number;
  sprite: string;
  types: string[];
  stats: { name: string; value: number }[];
  moves: { name: string; type: string; learnMethod: string }[];
  height: number;
  weight: number;
};

const statIcons: Record<string, React.ReactNode> = {
  hp: <Heart className="w-3.5 h-3.5" />,
  attack: <Swords className="w-3.5 h-3.5" />,
  defense: <Shield className="w-3.5 h-3.5" />,
  "special-attack": <Zap className="w-3.5 h-3.5" />,
  "special-defense": <Activity className="w-3.5 h-3.5" />,
  speed: <Wind className="w-3.5 h-3.5" />,
};

const statLabels: Record<string, string> = {
  hp: "HP", attack: "ATK", defense: "DEF",
  "special-attack": "SP.ATK", "special-defense": "SP.DEF", speed: "SPD",
};

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-[11px] text-white font-semibold capitalize ${typeColorMap[type] || "bg-muted"}`}>
    {type}
  </span>
);

const PokedexSection = () => {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const searchPokemon = useCallback(async (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setPokemon(null);
    setSearched(true);

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${trimmed}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();

      // Get move types (first 12 level-up/tm moves)
      const movesRaw = data.moves
        .filter((m: any) => {
          const method = m.version_group_details?.[0]?.move_learn_method?.name;
          return method === "level-up" || method === "machine";
        })
        .slice(0, 12);

      // Fetch move details in parallel (limit to 8 for speed)
      const moveDetails = await Promise.all(
        movesRaw.slice(0, 8).map(async (m: any) => {
          try {
            const moveRes = await fetch(m.move.url);
            const moveData = await moveRes.json();
            return {
              name: m.move.name.replace(/-/g, " "),
              type: moveData.type?.name || "normal",
              learnMethod: m.version_group_details?.[0]?.move_learn_method?.name || "",
            };
          } catch {
            return {
              name: m.move.name.replace(/-/g, " "),
              type: "normal",
              learnMethod: m.version_group_details?.[0]?.move_learn_method?.name || "",
            };
          }
        })
      );

      setPokemon({
        name: data.name,
        id: data.id,
        sprite: data.sprites?.other?.["official-artwork"]?.front_default || data.sprites?.front_default || "",
        types: data.types.map((t: any) => t.type.name),
        stats: data.stats.map((s: any) => ({ name: s.stat.name, value: s.base_stat })),
        moves: moveDetails,
        height: data.height / 10,
        weight: data.weight / 10,
      });
    } catch {
      setError("Pokémon not found. Try a name (e.g. pikachu) or Pokédex number.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPokemon(query);
  };

  const counterTypes = pokemon ? getCounterTypes(pokemon.types) : [];

  return (
    <section id="pokedex" className="py-20 bg-card/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Pokédex Search</h2>
          <p className="text-muted-foreground font-body">Look up any Pokémon's stats, moves & best counters</p>
        </motion.div>

        <div className="max-w-4xl">
          {/* Search */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or number (e.g. pikachu, 25)..."
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

          {/* Error */}
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive font-body mb-4">
              {error}
            </motion.p>
          )}

          {/* Result */}
          {pokemon && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-[240px_1fr] gap-6"
            >
              {/* Left: Image + Info */}
              <div className="flex flex-col items-center p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
                <img
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  className="w-40 h-40 object-contain mb-3"
                  loading="lazy"
                />
                <p className="text-xs text-muted-foreground font-mono mb-1">#{String(pokemon.id).padStart(4, "0")}</p>
                <h3 className="text-xl font-display text-foreground capitalize mb-2">{pokemon.name}</h3>
                <div className="flex gap-1.5 mb-3">
                  {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground font-body">
                  <span>{pokemon.height} m</span>
                  <span>{pokemon.weight} kg</span>
                </div>
              </div>

              {/* Right: Stats, Moves, Counters */}
              <div className="space-y-4">
                {/* Stats */}
                <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                  <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3">Base Stats</h4>
                  <div className="space-y-2">
                    {pokemon.stats.map(s => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="text-primary">{statIcons[s.name]}</span>
                        <span className="text-[11px] font-body text-muted-foreground w-12">{statLabels[s.name]}</span>
                        <span className="text-xs font-mono text-foreground w-8 text-right">{s.value}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${s.value >= 100 ? "bg-primary" : s.value >= 70 ? "bg-secondary" : "bg-accent"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (s.value / 160) * 100)}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs font-body">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-mono text-foreground font-semibold">{pokemon.stats.reduce((a, s) => a + s.value, 0)}</span>
                  </div>
                </div>

                {/* Counters */}
                <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                  <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Swords className="w-3.5 h-3.5 text-primary" /> Best Counter Types
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {counterTypes.length > 0 ? (
                      counterTypes.map(t => (
                        <span key={t} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-white font-semibold capitalize ${typeColorMap[t]}`}>
                          2× {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground font-body">No strong counters</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-body mt-2">
                    Use these types for super effective damage against {pokemon.name}
                  </p>
                </div>

                {/* Moves */}
                <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                  <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3">Notable Moves</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {pokemon.moves.map((m, i) => (
                      <div key={i} className="flex flex-col gap-1 p-2 rounded-xl bg-muted/40 border border-border">
                        <span className="text-xs font-body text-foreground capitalize leading-tight">{m.name}</span>
                        <TypeBadge type={m.type} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {!pokemon && !error && !loading && !searched && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-body text-sm">Search for any Pokémon to see its full profile</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PokedexSection;
