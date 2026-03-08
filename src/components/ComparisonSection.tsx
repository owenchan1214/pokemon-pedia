import { motion } from "framer-motion";
import { Search, Loader2, ArrowLeftRight, Swords, Shield, Zap, Heart, Activity, Wind } from "lucide-react";
import { useState, useCallback } from "react";

const typeColorMap: Record<string, string> = {
  normal: "bg-[hsl(60,10%,55%)]", fire: "bg-[hsl(15,80%,50%)]", water: "bg-[hsl(220,70%,55%)]",
  electric: "bg-[hsl(48,90%,50%)]", grass: "bg-[hsl(100,55%,45%)]", ice: "bg-[hsl(185,60%,60%)]",
  fighting: "bg-[hsl(2,65%,42%)]", poison: "bg-[hsl(280,55%,45%)]", ground: "bg-[hsl(40,55%,50%)]",
  flying: "bg-[hsl(255,55%,65%)]", psychic: "bg-[hsl(340,70%,55%)]", bug: "bg-[hsl(75,65%,40%)]",
  rock: "bg-[hsl(45,45%,40%)]", ghost: "bg-[hsl(265,35%,40%)]", dragon: "bg-[hsl(260,70%,50%)]",
  dark: "bg-[hsl(25,25%,32%)]", steel: "bg-[hsl(220,15%,60%)]", fairy: "bg-[hsl(330,50%,65%)]",
};

const typeEffectiveness: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

const allTypes = Object.keys(typeColorMap);

type CompPokemon = {
  name: string;
  id: number;
  sprite: string;
  types: string[];
  stats: { name: string; value: number }[];
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

const getDefensiveMultiplier = (attackType: string, defenderTypes: string[]): number => {
  let mult = 1;
  defenderTypes.forEach(dt => {
    // Check what attackType does against dt as a defender
    const eff = typeEffectiveness[attackType]?.[dt];
    if (eff !== undefined) mult *= eff;
  });
  return mult;
};

const getMatchupSummary = (attacker: CompPokemon, defender: CompPokemon) => {
  const superEffective: string[] = [];
  const notVeryEffective: string[] = [];
  const immune: string[] = [];

  attacker.types.forEach(at => {
    const mult = getDefensiveMultiplier(at, defender.types);
    if (mult >= 2) superEffective.push(at);
    else if (mult === 0) immune.push(at);
    else if (mult < 1) notVeryEffective.push(at);
  });

  return { superEffective, notVeryEffective, immune };
};

const PokemonSearch = ({ label, pokemon, onSelect }: { label: string; pokemon: CompPokemon | null; onSelect: (p: CompPokemon) => void }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = useCallback(async () => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${trimmed}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      onSelect({
        name: data.name,
        id: data.id,
        sprite: data.sprites?.other?.["official-artwork"]?.front_default || data.sprites?.front_default || "",
        types: data.types.map((t: any) => t.type.name),
        stats: data.stats.map((s: any) => ({ name: s.stat.name, value: s.base_stat })),
        height: data.height / 10,
        weight: data.weight / 10,
      });
    } catch {
      setError("Not found");
    } finally {
      setLoading(false);
    }
  }, [query, onSelect]);

  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Name or #..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-card-gradient border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button onClick={search} disabled={loading || !query.trim()} className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-body font-semibold hover:brightness-110 transition-all disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive font-body">{error}</p>}
      {pokemon && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center p-4 rounded-2xl bg-card-gradient border border-border">
          <img src={pokemon.sprite} alt={pokemon.name} className="w-28 h-28 object-contain" loading="lazy" />
          <p className="text-xs text-muted-foreground font-mono">#{String(pokemon.id).padStart(4, "0")}</p>
          <h4 className="text-lg font-display text-foreground capitalize">{pokemon.name}</h4>
          <div className="flex gap-1.5 mt-1">
            {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
          </div>
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground font-body">
            <span>{pokemon.height}m</span>
            <span>{pokemon.weight}kg</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const ComparisonSection = () => {
  const [pokemonA, setPokemonA] = useState<CompPokemon | null>(null);
  const [pokemonB, setPokemonB] = useState<CompPokemon | null>(null);

  const both = pokemonA && pokemonB;

  // Defensive profile: for each type, calculate how effective it is against this pokemon
  const getDefensiveProfile = (pokemon: CompPokemon) => {
    return allTypes.map(at => ({
      type: at,
      multiplier: getDefensiveMultiplier(at, pokemon.types),
    }));
  };

  return (
    <section id="compare" className="py-20 bg-card/30">
      <div className="container px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Pokémon Comparison</h2>
          <p className="text-muted-foreground font-body">Compare two Pokémon side-by-side — stats, typing & matchup</p>
        </motion.div>

        <div className="max-w-5xl">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start mb-8">
            <PokemonSearch label="Pokémon A" pokemon={pokemonA} onSelect={setPokemonA} />
            <div className="hidden sm:flex items-center justify-center pt-8">
              <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
            </div>
            <PokemonSearch label="Pokémon B" pokemon={pokemonB} onSelect={setPokemonB} />
          </div>

          {/* Stat Comparison */}
          {both && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Stats Head-to-Head */}
              <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
                <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-4">Stat Comparison</h4>
                <div className="space-y-3">
                  {pokemonA.stats.map((sa, i) => {
                    const sb = pokemonB.stats[i];
                    const max = Math.max(sa.value, sb.value, 1);
                    const aWins = sa.value > sb.value;
                    const bWins = sb.value > sa.value;
                    return (
                      <div key={sa.name} className="flex items-center gap-2">
                        <span className="text-primary">{statIcons[sa.name]}</span>
                        <span className="text-[11px] font-body text-muted-foreground w-12 shrink-0">{statLabels[sa.name]}</span>
                        {/* A bar (right-aligned) */}
                        <span className={`text-xs font-mono w-8 text-right shrink-0 ${aWins ? "text-primary font-bold" : "text-foreground"}`}>{sa.value}</span>
                        <div className="flex-1 flex gap-1">
                          <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden flex justify-end">
                            <motion.div
                              className={`h-full rounded-full ${aWins ? "bg-primary" : "bg-muted-foreground/40"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(sa.value / max) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${bWins ? "bg-secondary" : "bg-muted-foreground/40"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(sb.value / max) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                        <span className={`text-xs font-mono w-8 shrink-0 ${bWins ? "text-secondary font-bold" : "text-foreground"}`}>{sb.value}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs font-body">
                  <span className="font-mono text-primary font-semibold capitalize">{pokemonA.name}: {pokemonA.stats.reduce((a, s) => a + s.value, 0)}</span>
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-mono text-secondary font-semibold capitalize">{pokemonB.name}: {pokemonB.stats.reduce((a, s) => a + s.value, 0)}</span>
                </div>
              </div>

              {/* Matchup Analysis */}
              <div className="grid md:grid-cols-2 gap-4">
                {[{ attacker: pokemonA, defender: pokemonB, label: `${pokemonA.name} → ${pokemonB.name}` },
                  { attacker: pokemonB, defender: pokemonA, label: `${pokemonB.name} → ${pokemonA.name}` }].map(({ attacker, defender, label }) => {
                  const matchup = getMatchupSummary(attacker, defender);
                  return (
                    <div key={label} className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                      <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Swords className="w-3.5 h-3.5 text-primary" />
                        <span className="capitalize">{label}</span>
                      </h4>
                      {matchup.superEffective.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[11px] text-muted-foreground font-body mb-1">Super Effective (2×+)</p>
                          <div className="flex flex-wrap gap-1">{matchup.superEffective.map(t => <TypeBadge key={t} type={t} />)}</div>
                        </div>
                      )}
                      {matchup.notVeryEffective.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[11px] text-muted-foreground font-body mb-1">Not Very Effective</p>
                          <div className="flex flex-wrap gap-1">{matchup.notVeryEffective.map(t => <TypeBadge key={t} type={t} />)}</div>
                        </div>
                      )}
                      {matchup.immune.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[11px] text-muted-foreground font-body mb-1">No Effect</p>
                          <div className="flex flex-wrap gap-1">{matchup.immune.map(t => <TypeBadge key={t} type={t} />)}</div>
                        </div>
                      )}
                      {matchup.superEffective.length === 0 && matchup.notVeryEffective.length === 0 && matchup.immune.length === 0 && (
                        <p className="text-xs text-muted-foreground font-body">Neutral matchup</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Defensive Profile */}
              <div className="grid md:grid-cols-2 gap-4">
                {[pokemonA, pokemonB].map(poke => {
                  const profile = getDefensiveProfile(poke);
                  const weakTo = profile.filter(p => p.multiplier > 1);
                  const resistsTo = profile.filter(p => p.multiplier < 1 && p.multiplier > 0);
                  const immuneTo = profile.filter(p => p.multiplier === 0);
                  return (
                    <div key={poke.name} className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                      <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 capitalize">
                        <Shield className="w-3.5 h-3.5 inline mr-1 text-primary" />{poke.name} Defenses
                      </h4>
                      {weakTo.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[11px] text-muted-foreground font-body mb-1">Weak to</p>
                          <div className="flex flex-wrap gap-1">
                            {weakTo.map(p => (
                              <span key={p.type} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] text-white font-semibold capitalize ${typeColorMap[p.type]}`}>
                                {p.multiplier}× {p.type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {resistsTo.length > 0 && (
                        <div className="mb-2">
                          <p className="text-[11px] text-muted-foreground font-body mb-1">Resists</p>
                          <div className="flex flex-wrap gap-1">
                            {resistsTo.map(p => (
                              <span key={p.type} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] text-white/70 font-semibold capitalize ${typeColorMap[p.type]}`}>
                                {p.multiplier}× {p.type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {immuneTo.length > 0 && (
                        <div>
                          <p className="text-[11px] text-muted-foreground font-body mb-1">Immune to</p>
                          <div className="flex flex-wrap gap-1">
                            {immuneTo.map(p => (
                              <span key={p.type} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] text-white/50 font-semibold capitalize ${typeColorMap[p.type]}`}>
                                0× {p.type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {!both && (
            <div className="text-center py-12">
              <ArrowLeftRight className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-body text-sm">Search two Pokémon above to compare them</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
