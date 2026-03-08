import { motion } from "framer-motion";
import { Search, X, Loader2, Crosshair, Zap, Shield } from "lucide-react";
import { useState, useCallback } from "react";

const typeColorMap: Record<string, string> = {
  normal: "bg-[hsl(60,10%,55%)]", fire: "bg-[hsl(15,80%,50%)]", water: "bg-[hsl(220,70%,55%)]",
  electric: "bg-[hsl(48,90%,50%)]", grass: "bg-[hsl(100,55%,45%)]", ice: "bg-[hsl(185,60%,60%)]",
  fighting: "bg-[hsl(2,65%,42%)]", poison: "bg-[hsl(280,55%,45%)]", ground: "bg-[hsl(40,55%,50%)]",
  flying: "bg-[hsl(255,55%,65%)]", psychic: "bg-[hsl(340,70%,55%)]", bug: "bg-[hsl(75,65%,40%)]",
  rock: "bg-[hsl(45,45%,40%)]", ghost: "bg-[hsl(265,35%,40%)]", dragon: "bg-[hsl(260,70%,50%)]",
  dark: "bg-[hsl(25,25%,32%)]", steel: "bg-[hsl(220,15%,60%)]", fairy: "bg-[hsl(330,50%,65%)]",
};

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-[10px] text-white font-semibold capitalize ${typeColorMap[type] || "bg-muted"}`}>
    {type}
  </span>
);

// Full type effectiveness chart
const effectiveness: Record<string, Record<string, number>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

function getTypeMultiplier(moveType: string, defenderTypes: string[]): number {
  let mult = 1;
  for (const dt of defenderTypes) {
    const eff = effectiveness[moveType]?.[dt];
    if (eff !== undefined) mult *= eff;
  }
  return mult;
}

function getEffectivenessLabel(mult: number): { label: string; color: string } {
  if (mult === 0) return { label: "No Effect", color: "text-muted-foreground" };
  if (mult < 0.5) return { label: "Double Resisted", color: "text-destructive" };
  if (mult < 1) return { label: "Not Very Effective", color: "text-accent" };
  if (mult === 1) return { label: "Neutral", color: "text-muted-foreground" };
  if (mult <= 2) return { label: "Super Effective!", color: "text-primary" };
  return { label: "Double Super Effective!", color: "text-primary" };
}

type MoveData = {
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  damageClass: string;
  pp: number;
  effectChance: number | null;
  effectText: string;
};

type TargetData = {
  name: string;
  id: number;
  sprite: string;
  types: string[];
  defense: number;
  spDefense: number;
  hp: number;
};

type CalcResult = {
  move: MoveData;
  target: TargetData;
  multiplier: number;
  stab: boolean;
  estimatedDamage: { min: number; max: number };
};

function estimateDamage(
  movePower: number,
  attackStat: number,
  defenseStat: number,
  multiplier: number,
  stab: boolean,
  level: number = 50
): { min: number; max: number } {
  // Simplified main series damage formula
  const base = Math.floor(((2 * level / 5 + 2) * movePower * (attackStat / defenseStat)) / 50 + 2);
  const stabMult = stab ? 1.5 : 1;
  const max = Math.floor(base * stabMult * multiplier);
  const min = Math.floor(max * 0.85);
  return { min: Math.max(1, min), max: Math.max(1, max) };
}

const MoveCalculatorSection = () => {
  const [moveName, setMoveName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [attackerName, setAttackerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CalcResult | null>(null);
  const [attackerTypes, setAttackerTypes] = useState<string[]>([]);
  const [attackerStats, setAttackerStats] = useState<{ attack: number; spAttack: number }>({ attack: 100, spAttack: 100 });

  const calculate = useCallback(async () => {
    const move = moveName.trim().toLowerCase().replace(/ /g, "-");
    const target = targetName.trim().toLowerCase();
    const attacker = attackerName.trim().toLowerCase();
    if (!move || !target) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Fetch move, target, and optionally attacker in parallel
      const promises: Promise<any>[] = [
        fetch(`https://pokeapi.co/api/v2/move/${move}`).then(r => { if (!r.ok) throw new Error("Move not found"); return r.json(); }),
        fetch(`https://pokeapi.co/api/v2/pokemon/${target}`).then(r => { if (!r.ok) throw new Error("Target Pokémon not found"); return r.json(); }),
      ];
      if (attacker) {
        promises.push(
          fetch(`https://pokeapi.co/api/v2/pokemon/${attacker}`).then(r => { if (!r.ok) throw new Error("Attacker not found"); return r.json(); })
        );
      }

      const results = await Promise.all(promises);
      const moveData = results[0];
      const targetData = results[1];
      const attackerData = results[2];

      const moveInfo: MoveData = {
        name: moveData.name.replace(/-/g, " "),
        type: moveData.type.name,
        power: moveData.power,
        accuracy: moveData.accuracy,
        damageClass: moveData.damage_class.name,
        pp: moveData.pp,
        effectChance: moveData.effect_chance,
        effectText: moveData.effect_entries?.find((e: any) => e.language.name === "en")?.short_effect || "",
      };

      const targetInfo: TargetData = {
        name: targetData.name,
        id: targetData.id,
        sprite: targetData.sprites?.other?.["official-artwork"]?.front_default || targetData.sprites?.front_default || "",
        types: targetData.types.map((t: any) => t.type.name),
        defense: targetData.stats.find((s: any) => s.stat.name === "defense")?.base_stat || 100,
        spDefense: targetData.stats.find((s: any) => s.stat.name === "special-defense")?.base_stat || 100,
        hp: targetData.stats.find((s: any) => s.stat.name === "hp")?.base_stat || 100,
      };

      let atkTypes: string[] = [];
      let atkStats = { attack: 100, spAttack: 100 };
      if (attackerData) {
        atkTypes = attackerData.types.map((t: any) => t.type.name);
        atkStats = {
          attack: attackerData.stats.find((s: any) => s.stat.name === "attack")?.base_stat || 100,
          spAttack: attackerData.stats.find((s: any) => s.stat.name === "special-attack")?.base_stat || 100,
        };
      }
      setAttackerTypes(atkTypes);
      setAttackerStats(atkStats);

      const multiplier = getTypeMultiplier(moveInfo.type, targetInfo.types);
      const stab = atkTypes.includes(moveInfo.type);
      const isPhysical = moveInfo.damageClass === "physical";
      const atkStat = isPhysical ? atkStats.attack : atkStats.spAttack;
      const defStat = isPhysical ? targetInfo.defense : targetInfo.spDefense;

      const estimatedDamage = moveInfo.power
        ? estimateDamage(moveInfo.power, atkStat, defStat, multiplier, stab)
        : { min: 0, max: 0 };

      setResult({ move: moveInfo, target: targetInfo, multiplier, stab, estimatedDamage });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Check move and Pokémon names.");
    } finally {
      setLoading(false);
    }
  }, [moveName, targetName, attackerName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculate();
  };

  const reset = () => {
    setMoveName("");
    setTargetName("");
    setAttackerName("");
    setResult(null);
    setError("");
    setAttackerTypes([]);
  };

  return (
    <section id="movecalc" className="py-20 bg-card/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Move Effectiveness Calculator</h2>
          <p className="text-muted-foreground font-body">Calculate damage output for specific moves against any target Pokémon</p>
        </motion.div>

        <div className="max-w-4xl">
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Move */}
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Move</label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. thunderbolt"
                    value={moveName}
                    onChange={(e) => setMoveName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                </div>
              </div>

              {/* Target */}
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Target Pokémon</label>
                <div className="relative">
                  <Crosshair className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. gyarados"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                </div>
              </div>

              {/* Attacker (optional) */}
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Attacker <span className="text-muted-foreground/60 normal-case">(optional)</span></label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. pikachu"
                    value={attackerName}
                    onChange={(e) => setAttackerName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-background border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !moveName.trim() || !targetName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-body font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                Calculate
              </button>
              {result && (
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

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Move Info + Target */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Move Card */}
                <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                  <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-primary" /> Move Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-display text-foreground capitalize">{result.move.name}</span>
                      <TypeBadge type={result.move.type} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-muted/40 border border-border">
                        <p className="text-[10px] text-muted-foreground font-body uppercase">Power</p>
                        <p className="text-sm font-mono font-bold text-foreground">{result.move.power ?? "—"}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/40 border border-border">
                        <p className="text-[10px] text-muted-foreground font-body uppercase">Accuracy</p>
                        <p className="text-sm font-mono font-bold text-foreground">{result.move.accuracy ? `${result.move.accuracy}%` : "—"}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-muted/40 border border-border">
                        <p className="text-[10px] text-muted-foreground font-body uppercase">Class</p>
                        <p className="text-sm font-mono font-bold text-foreground capitalize">{result.move.damageClass}</p>
                      </div>
                    </div>
                    {result.move.effectText && (
                      <p className="text-[11px] text-muted-foreground font-body mt-1 leading-relaxed">
                        {result.move.effectText.replace("$effect_chance", String(result.move.effectChance || ""))}
                      </p>
                    )}
                  </div>
                </div>

                {/* Target Card */}
                <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                  <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary" /> Target
                  </h4>
                  <div className="flex items-center gap-3">
                    <img src={result.target.sprite} alt={result.target.name} className="w-20 h-20 object-contain" loading="lazy" />
                    <div>
                      <h3 className="text-lg font-display text-foreground capitalize">{result.target.name}</h3>
                      <div className="flex gap-1 mt-1 mb-2">
                        {result.target.types.map(t => <TypeBadge key={t} type={t} />)}
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground font-body">
                        <span>DEF {result.target.defense}</span>
                        <span>SP.DEF {result.target.spDefense}</span>
                        <span>HP {result.target.hp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result Card */}
              <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
                <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-4">Damage Output</h4>

                {/* Effectiveness */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className={`text-lg font-display font-bold ${getEffectivenessLabel(result.multiplier).color}`}>
                    {result.multiplier === 0 ? "0×" : `${result.multiplier}×`}
                  </div>
                  <span className={`text-sm font-body font-semibold ${getEffectivenessLabel(result.multiplier).color}`}>
                    {getEffectivenessLabel(result.multiplier).label}
                  </span>
                  {result.stab && (
                    <span className="px-2 py-0.5 rounded-lg bg-primary/15 text-primary text-[11px] font-body font-semibold border border-primary/20">
                      STAB ×1.5
                    </span>
                  )}
                </div>

                {/* Damage Estimate */}
                {result.move.power ? (
                  <div className="space-y-3">
                    <div className="flex items-end gap-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-body uppercase mb-1">Estimated Damage (Lv. 50)</p>
                        <p className="text-2xl font-mono font-bold text-foreground">
                          {result.estimatedDamage.min}–{result.estimatedDamage.max}
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-[10px] text-muted-foreground font-body uppercase mb-1">% of Target HP</p>
                        <p className="text-lg font-mono font-bold text-foreground">
                          {Math.round((result.estimatedDamage.max / (result.target.hp * 2 + 110)) * 100)}%
                        </p>
                      </div>
                    </div>

                    {/* Damage bar */}
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          result.multiplier >= 2 ? "bg-primary" :
                          result.multiplier > 1 ? "bg-secondary" :
                          result.multiplier === 1 ? "bg-accent" :
                          "bg-destructive"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.round((result.estimatedDamage.max / (result.target.hp * 2 + 110)) * 100))}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>

                    <p className="text-[11px] text-muted-foreground font-body">
                      {attackerName.trim()
                        ? `Using ${attackerName.trim()}'s base stats. `
                        : "Using default base 100 ATK/SP.ATK. Specify an attacker for accurate results. "
                      }
                      Total multiplier: ×{(result.multiplier * (result.stab ? 1.5 : 1)).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground font-body">
                    This is a status move — no direct damage calculation available.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {!result && !error && !loading && (
            <div className="text-center py-12">
              <Crosshair className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-body text-sm">Enter a move and target Pokémon to calculate damage effectiveness</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MoveCalculatorSection;
