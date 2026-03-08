import { motion } from "framer-motion";
import { Search, X, Loader2, Swords, Shield, Target } from "lucide-react";
import { useState, useCallback, useMemo } from "react";

const typeColorMap: Record<string, string> = {
  normal: "bg-[hsl(60,10%,55%)]", fire: "bg-[hsl(15,80%,50%)]", water: "bg-[hsl(220,70%,55%)]",
  electric: "bg-[hsl(48,90%,50%)]", grass: "bg-[hsl(100,55%,45%)]", ice: "bg-[hsl(185,60%,60%)]",
  fighting: "bg-[hsl(2,65%,42%)]", poison: "bg-[hsl(280,55%,45%)]", ground: "bg-[hsl(40,55%,50%)]",
  flying: "bg-[hsl(255,55%,65%)]", psychic: "bg-[hsl(340,70%,55%)]", bug: "bg-[hsl(75,65%,40%)]",
  rock: "bg-[hsl(45,45%,40%)]", ghost: "bg-[hsl(265,35%,40%)]", dragon: "bg-[hsl(260,70%,50%)]",
  dark: "bg-[hsl(25,25%,32%)]", steel: "bg-[hsl(220,15%,60%)]", fairy: "bg-[hsl(330,50%,65%)]",
};

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] text-white font-semibold capitalize mr-0.5 ${typeColorMap[type] || "bg-muted"}`}>
    {type}
  </span>
);

// Type effectiveness (attacking type → defending type)
const superEffective: Record<string, string[]> = {
  normal: [], fire: ["grass", "ice", "bug", "steel"], water: ["fire", "ground", "rock"],
  electric: ["water", "flying"], grass: ["water", "ground", "rock"],
  ice: ["grass", "ground", "flying", "dragon"], fighting: ["normal", "ice", "rock", "dark", "steel"],
  poison: ["grass", "fairy"], ground: ["fire", "electric", "poison", "rock", "steel"],
  flying: ["grass", "fighting", "bug"], psychic: ["fighting", "poison"],
  bug: ["grass", "psychic", "dark"], rock: ["fire", "ice", "flying", "bug"],
  ghost: ["psychic", "ghost"], dragon: ["dragon"],
  dark: ["psychic", "ghost"], steel: ["ice", "rock", "fairy"],
  fairy: ["fighting", "dragon", "dark"],
};

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

const immunities: Record<string, string[]> = {
  normal: ["ghost"], ghost: ["normal", "fighting"], dark: ["psychic"],
  fairy: ["dragon"], flying: ["ground"], ground: ["electric"], steel: ["poison"],
};

// Pre-built counter database: best attackers by type they're strong against
type CounterEntry = {
  name: string;
  types: string[];
  attackType: string;
  fastMove: string;
  chargeMove: string;
  baseDps: number;
};

const counterDatabase: CounterEntry[] = [
  // Fire counters
  { name: "Kyogre", types: ["water"], attackType: "water", fastMove: "Waterfall", chargeMove: "Origin Pulse", baseDps: 18.2 },
  { name: "Rhyperior", types: ["ground", "rock"], attackType: "rock", fastMove: "Smack Down", chargeMove: "Rock Wrecker", baseDps: 16.8 },
  { name: "Rampardos", types: ["rock"], attackType: "rock", fastMove: "Smack Down", chargeMove: "Rock Slide", baseDps: 17.5 },
  { name: "Groudon", types: ["ground"], attackType: "ground", fastMove: "Mud Shot", chargeMove: "Precipice Blades", baseDps: 17.1 },
  // Water counters
  { name: "Kartana", types: ["grass", "steel"], attackType: "grass", fastMove: "Razor Leaf", chargeMove: "Leaf Blade", baseDps: 17.8 },
  { name: "Xurkitree", types: ["electric"], attackType: "electric", fastMove: "Thunder Shock", chargeMove: "Discharge", baseDps: 17.2 },
  { name: "Thundurus (Therian)", types: ["electric", "flying"], attackType: "electric", fastMove: "Volt Switch", chargeMove: "Wildbolt Storm", baseDps: 17.9 },
  { name: "Roserade", types: ["grass", "poison"], attackType: "grass", fastMove: "Razor Leaf", chargeMove: "Solar Beam", baseDps: 15.6 },
  // Grass counters
  { name: "Reshiram", types: ["dragon", "fire"], attackType: "fire", fastMove: "Fire Fang", chargeMove: "Fusion Flare", baseDps: 17.4 },
  { name: "Chandelure", types: ["ghost", "fire"], attackType: "fire", fastMove: "Fire Spin", chargeMove: "Overheat", baseDps: 16.9 },
  { name: "Rayquaza", types: ["dragon", "flying"], attackType: "flying", fastMove: "Air Slash", chargeMove: "Dragon Ascent", baseDps: 17.6 },
  { name: "Pheromosa", types: ["bug", "fighting"], attackType: "bug", fastMove: "Bug Bite", chargeMove: "Bug Buzz", baseDps: 16.4 },
  // Electric counters
  { name: "Garchomp", types: ["dragon", "ground"], attackType: "ground", fastMove: "Mud Shot", chargeMove: "Earth Power", baseDps: 16.5 },
  { name: "Excadrill", types: ["ground", "steel"], attackType: "ground", fastMove: "Mud-Slap", chargeMove: "Drill Run", baseDps: 16.2 },
  { name: "Landorus (Therian)", types: ["ground", "flying"], attackType: "ground", fastMove: "Mud Shot", chargeMove: "Sandsear Storm", baseDps: 17.0 },
  // Ice counters
  { name: "Metagross", types: ["steel", "psychic"], attackType: "steel", fastMove: "Bullet Punch", chargeMove: "Meteor Mash", baseDps: 16.7 },
  { name: "Lucario", types: ["fighting", "steel"], attackType: "fighting", fastMove: "Force Palm", chargeMove: "Aura Sphere", baseDps: 17.3 },
  { name: "Terrakion", types: ["rock", "fighting"], attackType: "fighting", fastMove: "Double Kick", chargeMove: "Sacred Sword", baseDps: 16.1 },
  // Fighting counters
  { name: "Mewtwo", types: ["psychic"], attackType: "psychic", fastMove: "Confusion", chargeMove: "Psystrike", baseDps: 18.0 },
  { name: "Rayquaza", types: ["dragon", "flying"], attackType: "flying", fastMove: "Air Slash", chargeMove: "Dragon Ascent", baseDps: 17.6 },
  { name: "Togekiss", types: ["fairy", "flying"], attackType: "fairy", fastMove: "Charm", chargeMove: "Dazzling Gleam", baseDps: 14.8 },
  // Psychic counters
  { name: "Darkrai", types: ["dark"], attackType: "dark", fastMove: "Snarl", chargeMove: "Shadow Ball", baseDps: 16.8 },
  { name: "Gengar", types: ["ghost", "poison"], attackType: "ghost", fastMove: "Lick", chargeMove: "Shadow Ball", baseDps: 17.0 },
  { name: "Yveltal", types: ["dark", "flying"], attackType: "dark", fastMove: "Snarl", chargeMove: "Dark Pulse", baseDps: 15.9 },
  { name: "Chandelure", types: ["ghost", "fire"], attackType: "ghost", fastMove: "Hex", chargeMove: "Shadow Ball", baseDps: 16.5 },
  // Dragon counters
  { name: "Zacian (Crowned Sword)", types: ["fairy", "steel"], attackType: "fairy", fastMove: "Quick Attack", chargeMove: "Play Rough", baseDps: 17.5 },
  { name: "Kyurem (Black)", types: ["dragon", "ice"], attackType: "ice", fastMove: "Dragon Tail", chargeMove: "Blizzard", baseDps: 17.1 },
  { name: "Mamoswine", types: ["ice", "ground"], attackType: "ice", fastMove: "Powder Snow", chargeMove: "Avalanche", baseDps: 16.3 },
  { name: "Salamence", types: ["dragon", "flying"], attackType: "dragon", fastMove: "Dragon Tail", chargeMove: "Outrage", baseDps: 16.0 },
  // Ghost counters
  { name: "Darkrai", types: ["dark"], attackType: "dark", fastMove: "Snarl", chargeMove: "Dark Pulse", baseDps: 16.5 },
  { name: "Gengar", types: ["ghost", "poison"], attackType: "ghost", fastMove: "Lick", chargeMove: "Shadow Ball", baseDps: 17.0 },
  { name: "Chandelure", types: ["ghost", "fire"], attackType: "ghost", fastMove: "Hex", chargeMove: "Shadow Ball", baseDps: 16.5 },
  // Dark counters
  { name: "Lucario", types: ["fighting", "steel"], attackType: "fighting", fastMove: "Force Palm", chargeMove: "Aura Sphere", baseDps: 17.3 },
  { name: "Machamp", types: ["fighting"], attackType: "fighting", fastMove: "Counter", chargeMove: "Dynamic Punch", baseDps: 15.8 },
  { name: "Pheromosa", types: ["bug", "fighting"], attackType: "bug", fastMove: "Bug Bite", chargeMove: "Bug Buzz", baseDps: 16.4 },
  // Steel counters
  { name: "Reshiram", types: ["dragon", "fire"], attackType: "fire", fastMove: "Fire Fang", chargeMove: "Fusion Flare", baseDps: 17.4 },
  { name: "Groudon", types: ["ground"], attackType: "ground", fastMove: "Mud Shot", chargeMove: "Precipice Blades", baseDps: 17.1 },
  { name: "Lucario", types: ["fighting", "steel"], attackType: "fighting", fastMove: "Force Palm", chargeMove: "Aura Sphere", baseDps: 17.3 },
  // Fairy counters
  { name: "Metagross", types: ["steel", "psychic"], attackType: "steel", fastMove: "Bullet Punch", chargeMove: "Meteor Mash", baseDps: 16.7 },
  { name: "Roserade", types: ["grass", "poison"], attackType: "poison", fastMove: "Poison Jab", chargeMove: "Sludge Bomb", baseDps: 15.2 },
  // Bug counters
  { name: "Reshiram", types: ["dragon", "fire"], attackType: "fire", fastMove: "Fire Fang", chargeMove: "Fusion Flare", baseDps: 17.4 },
  { name: "Rampardos", types: ["rock"], attackType: "rock", fastMove: "Smack Down", chargeMove: "Rock Slide", baseDps: 17.5 },
  // Rock counters
  { name: "Kyogre", types: ["water"], attackType: "water", fastMove: "Waterfall", chargeMove: "Origin Pulse", baseDps: 18.2 },
  { name: "Kartana", types: ["grass", "steel"], attackType: "grass", fastMove: "Razor Leaf", chargeMove: "Leaf Blade", baseDps: 17.8 },
  { name: "Lucario", types: ["fighting", "steel"], attackType: "fighting", fastMove: "Force Palm", chargeMove: "Aura Sphere", baseDps: 17.3 },
  // Ground counters
  { name: "Kyogre", types: ["water"], attackType: "water", fastMove: "Waterfall", chargeMove: "Origin Pulse", baseDps: 18.2 },
  { name: "Kartana", types: ["grass", "steel"], attackType: "grass", fastMove: "Razor Leaf", chargeMove: "Leaf Blade", baseDps: 17.8 },
  { name: "Mamoswine", types: ["ice", "ground"], attackType: "ice", fastMove: "Powder Snow", chargeMove: "Avalanche", baseDps: 16.3 },
  // Flying counters
  { name: "Xurkitree", types: ["electric"], attackType: "electric", fastMove: "Thunder Shock", chargeMove: "Discharge", baseDps: 17.2 },
  { name: "Rampardos", types: ["rock"], attackType: "rock", fastMove: "Smack Down", chargeMove: "Rock Slide", baseDps: 17.5 },
  { name: "Mamoswine", types: ["ice", "ground"], attackType: "ice", fastMove: "Powder Snow", chargeMove: "Avalanche", baseDps: 16.3 },
  // Poison counters
  { name: "Mewtwo", types: ["psychic"], attackType: "psychic", fastMove: "Confusion", chargeMove: "Psystrike", baseDps: 18.0 },
  { name: "Groudon", types: ["ground"], attackType: "ground", fastMove: "Mud Shot", chargeMove: "Precipice Blades", baseDps: 17.1 },
  // Normal counters
  { name: "Lucario", types: ["fighting", "steel"], attackType: "fighting", fastMove: "Force Palm", chargeMove: "Aura Sphere", baseDps: 17.3 },
  { name: "Machamp", types: ["fighting"], attackType: "fighting", fastMove: "Counter", chargeMove: "Dynamic Punch", baseDps: 15.8 },
  { name: "Terrakion", types: ["rock", "fighting"], attackType: "fighting", fastMove: "Double Kick", chargeMove: "Sacred Sword", baseDps: 16.1 },
];

type BossData = {
  name: string;
  id: number;
  sprite: string;
  types: string[];
  attack: number;
  defense: number;
  stamina: number;
};

type CounterResult = {
  name: string;
  types: string[];
  fastMove: string;
  chargeMove: string;
  effectiveDps: number;
  attackType: string;
};

function getEffectiveCounters(bossTypes: string[]): CounterResult[] {
  const seen = new Map<string, CounterResult>();

  counterDatabase.forEach(counter => {
    // Check if this counter's attack type is super effective against any boss type
    const isSuperEffective = bossTypes.some(bt => superEffective[counter.attackType]?.includes(bt));
    if (!isSuperEffective) return;

    // Check for immunity
    const isImmune = bossTypes.some(bt => (immunities[bt] || []).includes(counter.attackType));
    if (isImmune) return;

    // Calculate multiplier
    let multiplier = 1.0;
    bossTypes.forEach(bt => {
      if (superEffective[counter.attackType]?.includes(bt)) multiplier *= 1.6;
    });

    // STAB bonus
    if (counter.types.includes(counter.attackType)) multiplier *= 1.2;

    const effectiveDps = Math.round(counter.baseDps * multiplier * 10) / 10;
    const key = counter.name + counter.attackType;

    if (!seen.has(key) || seen.get(key)!.effectiveDps < effectiveDps) {
      seen.set(key, {
        name: counter.name,
        types: counter.types,
        fastMove: counter.fastMove,
        chargeMove: counter.chargeMove,
        effectiveDps,
        attackType: counter.attackType,
      });
    }
  });

  return Array.from(seen.values())
    .sort((a, b) => b.effectiveDps - a.effectiveDps)
    .slice(0, 6);
}

const RaidCounterSection = () => {
  const [query, setQuery] = useState("");
  const [boss, setBoss] = useState<BossData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tier, setTier] = useState<5 | 3 | 1>(5);

  const searchBoss = useCallback(async (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setBoss(null);

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${trimmed}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();

      setBoss({
        name: data.name,
        id: data.id,
        sprite: data.sprites?.other?.["official-artwork"]?.front_default || data.sprites?.front_default || "",
        types: data.types.map((t: any) => t.type.name),
        attack: data.stats.find((s: any) => s.stat.name === "attack")?.base_stat || 0,
        defense: data.stats.find((s: any) => s.stat.name === "defense")?.base_stat || 0,
        stamina: data.stats.find((s: any) => s.stat.name === "hp")?.base_stat || 0,
      });
    } catch {
      setError("Pokémon not found. Try a name (e.g. mewtwo) or number.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchBoss(query);
  };

  const counters = useMemo(() => {
    if (!boss) return [];
    return getEffectiveCounters(boss.types);
  }, [boss]);

  // Estimated raid boss HP by tier
  const raidHp = tier === 5 ? 15000 : tier === 3 ? 3600 : 600;
  const maxDps = counters[0]?.effectiveDps || 20;

  return (
    <section id="raidcounter" className="py-20 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Raid Counter Calculator</h2>
          <p className="text-muted-foreground font-body">Input a raid boss and get the best counters with DPS estimates</p>
        </motion.div>

        <div className="max-w-4xl">
          {/* Tier Selector */}
          <div className="flex gap-2 mb-4">
            {([5, 3, 1] as const).map(t => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`px-4 py-2 rounded-xl text-xs font-body font-semibold transition-all ${
                  tier === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t === 5 ? "⭐ Tier 5 / Mega" : t === 3 ? "⭐ Tier 3" : "⭐ Tier 1"}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter raid boss name (e.g. mewtwo, dialga, rayquaza)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-20 py-3.5 rounded-2xl bg-card-gradient border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(""); setBoss(null); setError(""); }} className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <button type="submit" disabled={loading || !query.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-body font-semibold hover:brightness-110 transition-all disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
              </button>
            </div>
          </form>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive font-body mb-4">
              {error}
            </motion.p>
          )}

          {boss && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Boss Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card-gradient border border-border shadow-card mb-6">
                <img src={boss.sprite} alt={boss.name} className="w-20 h-20 object-contain" loading="lazy" />
                <div className="flex-1">
                  <h3 className="text-lg font-display text-foreground capitalize">{boss.name}</h3>
                  <div className="flex gap-1.5 mt-1 mb-2">
                    {boss.types.map(t => <TypeBadge key={t} type={t} />)}
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground font-body">
                    <span>ATK {boss.attack}</span>
                    <span>DEF {boss.defense}</span>
                    <span>STA {boss.stamina}</span>
                    <span className="text-primary font-semibold">~{raidHp.toLocaleString()} HP</span>
                  </div>
                </div>
              </div>

              {/* Counter Team */}
              <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Swords className="w-3.5 h-3.5 text-primary" /> Recommended Counter Team
                </h4>
                {counters.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-body text-center py-4">No strong type-based counters found for this Pokémon.</p>
                ) : (
                  <div className="space-y-3">
                    {counters.map((counter, i) => (
                      <motion.div
                        key={`${counter.name}-${counter.attackType}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border hover:bg-primary/5 transition-colors"
                      >
                        <span className="text-sm font-display text-primary w-6 text-center">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-body font-semibold text-foreground">{counter.name}</span>
                            <div className="flex gap-0.5">
                              {counter.types.map(t => <TypeBadge key={t} type={t} />)}
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-body">
                            {counter.fastMove} · {counter.chargeMove}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
                            <motion.div
                              className="h-full rounded-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${(counter.effectiveDps / maxDps) * 100}%` }}
                              transition={{ duration: 0.6, delay: i * 0.08 }}
                            />
                          </div>
                          <span className="text-xs font-mono text-foreground font-semibold w-14 text-right">
                            {counter.effectiveDps} DPS
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground font-body">
                    <span>
                      <Shield className="w-3 h-3 inline mr-1" />
                      Est. trainers needed: <strong className="text-foreground">{tier === 5 ? "3–5" : tier === 3 ? "1–2" : "1"}</strong>
                    </span>
                    <span>
                      DPS includes STAB (1.2×) and type effectiveness (1.6×)
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!boss && !error && !loading && (
            <div className="text-center py-12">
              <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-body text-sm">Enter a raid boss to see the best counters</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RaidCounterSection;
