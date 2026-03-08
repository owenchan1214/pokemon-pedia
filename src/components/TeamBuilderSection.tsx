import { motion } from "framer-motion";
import { Users, Plus, X, Shield, Swords, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";

const allTypes = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison",
  "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
] as const;

type PType = typeof allTypes[number];

const typeColorMap: Record<string, string> = {
  Normal: "bg-[hsl(60,10%,55%)]", Fire: "bg-[hsl(15,80%,50%)]", Water: "bg-[hsl(220,70%,55%)]",
  Electric: "bg-[hsl(48,90%,50%)]", Grass: "bg-[hsl(100,55%,45%)]", Ice: "bg-[hsl(185,60%,60%)]",
  Fighting: "bg-[hsl(2,65%,42%)]", Poison: "bg-[hsl(280,55%,45%)]", Ground: "bg-[hsl(40,55%,50%)]",
  Flying: "bg-[hsl(255,55%,65%)]", Psychic: "bg-[hsl(340,70%,55%)]", Bug: "bg-[hsl(75,65%,40%)]",
  Rock: "bg-[hsl(45,45%,40%)]", Ghost: "bg-[hsl(265,35%,40%)]", Dragon: "bg-[hsl(260,70%,50%)]",
  Dark: "bg-[hsl(25,25%,32%)]", Steel: "bg-[hsl(220,15%,60%)]", Fairy: "bg-[hsl(330,50%,65%)]",
};

type PokemonOption = { name: string; types: PType[] };

const pokemonPool: PokemonOption[] = [
  { name: "Zacian (Crowned Sword)", types: ["Fairy", "Steel"] },
  { name: "Calyrex (Shadow Rider)", types: ["Psychic", "Ghost"] },
  { name: "Deoxys (Attack)", types: ["Psychic"] },
  { name: "Thundurus (Therian)", types: ["Electric", "Flying"] },
  { name: "Blacephalon", types: ["Fire", "Ghost"] },
  { name: "Mewtwo", types: ["Psychic"] },
  { name: "Lucario", types: ["Fighting", "Steel"] },
  { name: "Hoopa (Unbound)", types: ["Psychic", "Dark"] },
  { name: "Kyurem (Black)", types: ["Dragon", "Ice"] },
  { name: "Salamence", types: ["Dragon", "Flying"] },
  { name: "Kartana", types: ["Grass", "Steel"] },
  { name: "Reshiram", types: ["Dragon", "Fire"] },
  { name: "Palkia (Origin)", types: ["Water", "Dragon"] },
  { name: "Rayquaza", types: ["Dragon", "Flying"] },
  { name: "Kyogre", types: ["Water"] },
  { name: "Groudon", types: ["Ground"] },
  { name: "Darkrai", types: ["Dark"] },
  { name: "Gengar", types: ["Ghost", "Poison"] },
  { name: "Metagross", types: ["Steel", "Psychic"] },
  { name: "Dragonite", types: ["Dragon", "Flying"] },
  { name: "Dialga", types: ["Steel", "Dragon"] },
  { name: "Zekrom", types: ["Dragon", "Electric"] },
  { name: "Chandelure", types: ["Ghost", "Fire"] },
  { name: "Garchomp", types: ["Dragon", "Ground"] },
  { name: "Tyranitar", types: ["Rock", "Dark"] },
  { name: "Machamp", types: ["Fighting"] },
  { name: "Togekiss", types: ["Fairy", "Flying"] },
  { name: "Swampert", types: ["Water", "Ground"] },
  { name: "Venusaur", types: ["Grass", "Poison"] },
  { name: "Charizard", types: ["Fire", "Flying"] },
  { name: "Blastoise", types: ["Water"] },
  { name: "Gyarados", types: ["Water", "Flying"] },
  { name: "Rhyperior", types: ["Ground", "Rock"] },
  { name: "Excadrill", types: ["Ground", "Steel"] },
  { name: "Mamoswine", types: ["Ice", "Ground"] },
  { name: "Volcarona", types: ["Bug", "Fire"] },
];

// Type effectiveness chart
const effectiveness: Record<PType, { superEffective: PType[]; notVeryEffective: PType[]; immune: PType[] }> = {
  Normal:   { superEffective: [], notVeryEffective: ["Rock", "Steel"], immune: ["Ghost"] },
  Fire:     { superEffective: ["Grass", "Ice", "Bug", "Steel"], notVeryEffective: ["Fire", "Water", "Rock", "Dragon"], immune: [] },
  Water:    { superEffective: ["Fire", "Ground", "Rock"], notVeryEffective: ["Water", "Grass", "Dragon"], immune: [] },
  Electric: { superEffective: ["Water", "Flying"], notVeryEffective: ["Electric", "Grass", "Dragon"], immune: ["Ground"] },
  Grass:    { superEffective: ["Water", "Ground", "Rock"], notVeryEffective: ["Fire", "Grass", "Poison", "Flying", "Bug", "Dragon", "Steel"], immune: [] },
  Ice:      { superEffective: ["Grass", "Ground", "Flying", "Dragon"], notVeryEffective: ["Fire", "Water", "Ice", "Steel"], immune: [] },
  Fighting: { superEffective: ["Normal", "Ice", "Rock", "Dark", "Steel"], notVeryEffective: ["Poison", "Flying", "Psychic", "Bug", "Fairy"], immune: ["Ghost"] },
  Poison:   { superEffective: ["Grass", "Fairy"], notVeryEffective: ["Poison", "Ground", "Rock", "Ghost"], immune: ["Steel"] },
  Ground:   { superEffective: ["Fire", "Electric", "Poison", "Rock", "Steel"], notVeryEffective: ["Grass", "Bug"], immune: ["Flying"] },
  Flying:   { superEffective: ["Grass", "Fighting", "Bug"], notVeryEffective: ["Electric", "Rock", "Steel"], immune: [] },
  Psychic:  { superEffective: ["Fighting", "Poison"], notVeryEffective: ["Psychic", "Steel"], immune: ["Dark"] },
  Bug:      { superEffective: ["Grass", "Psychic", "Dark"], notVeryEffective: ["Fire", "Fighting", "Poison", "Flying", "Ghost", "Steel", "Fairy"], immune: [] },
  Rock:     { superEffective: ["Fire", "Ice", "Flying", "Bug"], notVeryEffective: ["Fighting", "Ground", "Steel"], immune: [] },
  Ghost:    { superEffective: ["Psychic", "Ghost"], notVeryEffective: ["Dark"], immune: ["Normal"] },
  Dragon:   { superEffective: ["Dragon"], notVeryEffective: ["Steel"], immune: ["Fairy"] },
  Dark:     { superEffective: ["Psychic", "Ghost"], notVeryEffective: ["Fighting", "Dark", "Fairy"], immune: [] },
  Steel:    { superEffective: ["Ice", "Rock", "Fairy"], notVeryEffective: ["Fire", "Water", "Electric", "Steel"], immune: [] },
  Fairy:    { superEffective: ["Fighting", "Dragon", "Dark"], notVeryEffective: ["Fire", "Poison", "Steel"], immune: [] },
};

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] text-white font-semibold mr-1 ${typeColorMap[type] || "bg-muted"}`}>
    {type}
  </span>
);

const TeamBuilderSection = () => {
  const [team, setTeam] = useState<PokemonOption[]>([]);
  const [searchOpen, setSearchOpen] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const addToTeam = (pokemon: PokemonOption, slot: number) => {
    const newTeam = [...team];
    if (slot < team.length) {
      newTeam[slot] = pokemon;
    } else {
      newTeam.push(pokemon);
    }
    setTeam(newTeam);
    setSearchOpen(null);
    setSearchQuery("");
  };

  const removeFromTeam = (index: number) => {
    setTeam(team.filter((_, i) => i !== index));
  };

  const filteredPool = useMemo(() => {
    const selected = new Set(team.map(p => p.name));
    let list = pokemonPool.filter(p => !selected.has(p.name));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [searchQuery, team]);

  // Coverage analysis
  const coverage = useMemo(() => {
    if (team.length === 0) return null;

    const teamTypes = new Set<PType>();
    team.forEach(p => p.types.forEach(t => teamTypes.add(t)));

    const superEffectiveAgainst = new Set<PType>();
    const notCovered = new Set<PType>(allTypes);

    teamTypes.forEach(attackType => {
      const eff = effectiveness[attackType];
      eff.superEffective.forEach(t => {
        superEffectiveAgainst.add(t);
        notCovered.delete(t);
      });
    });

    // Defensive weaknesses
    const weakTo = new Map<PType, number>();
    const resistsMap = new Map<PType, number>();

    team.forEach(pokemon => {
      allTypes.forEach(attackType => {
        const eff = effectiveness[attackType];
        pokemon.types.forEach(defType => {
          if (eff.superEffective.includes(defType)) {
            weakTo.set(attackType, (weakTo.get(attackType) || 0) + 1);
          }
          if (eff.notVeryEffective.includes(defType) || eff.immune.includes(defType)) {
            resistsMap.set(attackType, (resistsMap.get(attackType) || 0) + 1);
          }
        });
      });
    });

    const sharedWeaknesses = Array.from(weakTo.entries())
      .filter(([type, count]) => count >= 2 && !resistsMap.has(type))
      .map(([type]) => type);

    return {
      superEffectiveAgainst: Array.from(superEffectiveAgainst),
      notCovered: Array.from(notCovered),
      sharedWeaknesses,
      coveragePercent: Math.round((superEffectiveAgainst.size / allTypes.length) * 100),
    };
  }, [team]);

  return (
    <section id="teambuilder" className="py-20 bg-card/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Team Builder</h2>
          <p className="text-muted-foreground font-body">Pick up to 3 Pokémon and analyze your type coverage</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl">
          {/* Team Slots */}
          <div className="space-y-4">
            <h3 className="text-sm font-body font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Your Team
            </h3>
            <div className="space-y-3">
              {[0, 1, 2].map((slot) => {
                const pokemon = team[slot];
                return (
                  <motion.div
                    key={slot}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: slot * 0.1 }}
                    className="relative"
                  >
                    {pokemon ? (
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-display text-primary">{slot + 1}</span>
                          <div>
                            <p className="font-body font-semibold text-foreground">{pokemon.name}</p>
                            <div className="mt-1">
                              {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromTeam(slot)}
                          className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => setSearchOpen(searchOpen === slot ? null : slot)}
                          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="font-body text-sm">Add Pokémon #{slot + 1}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${searchOpen === slot ? "rotate-180" : ""}`} />
                        </button>
                        {searchOpen === slot && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-20 top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-card overflow-hidden"
                          >
                            <input
                              autoFocus
                              type="text"
                              placeholder="Search Pokémon..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full px-4 py-3 bg-transparent border-b border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none"
                            />
                            <div className="max-h-48 overflow-y-auto">
                              {filteredPool.length === 0 ? (
                                <p className="p-4 text-sm text-muted-foreground font-body text-center">No Pokémon found</p>
                              ) : (
                                filteredPool.map(p => (
                                  <button
                                    key={p.name}
                                    onClick={() => addToTeam(p, slot)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-primary/5 transition-colors text-left"
                                  >
                                    <span className="font-body text-sm text-foreground">{p.name}</span>
                                    <div>{p.types.map(t => <TypeBadge key={t} type={t} />)}</div>
                                  </button>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Coverage Analysis */}
          <div className="space-y-4">
            <h3 className="text-sm font-body font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-primary" /> Type Coverage Analysis
            </h3>
            {!coverage ? (
              <div className="p-8 rounded-2xl bg-card-gradient border border-border shadow-card text-center">
                <p className="text-muted-foreground font-body">Add Pokémon to see your team's type coverage</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Coverage Meter */}
                <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-sm text-foreground font-semibold">Offensive Coverage</span>
                    <span className="font-mono text-sm text-primary font-bold">{coverage.coveragePercent}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${coverage.coveragePercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-body mt-2">
                    Super effective against {coverage.superEffectiveAgainst.length} of {allTypes.length} types
                  </p>
                </div>

                {/* Super Effective */}
                <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Swords className="w-4 h-4 text-primary" />
                    <span className="font-body text-sm text-foreground font-semibold">Super Effective Against</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {coverage.superEffectiveAgainst.length > 0 ? (
                      coverage.superEffectiveAgainst.map(t => <TypeBadge key={t} type={t} />)
                    ) : (
                      <span className="text-xs text-muted-foreground font-body">None</span>
                    )}
                  </div>
                </div>

                {/* Not Covered */}
                {coverage.notCovered.length > 0 && (
                  <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="font-body text-sm text-foreground font-semibold">Not Super Effective Against</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {coverage.notCovered.map(t => <TypeBadge key={t} type={t} />)}
                    </div>
                  </div>
                )}

                {/* Shared Weaknesses */}
                {coverage.sharedWeaknesses.length > 0 && (
                  <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 shadow-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-destructive" />
                      <span className="font-body text-sm text-destructive font-semibold">⚠ Shared Weaknesses</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {coverage.sharedWeaknesses.map(t => <TypeBadge key={t} type={t} />)}
                    </div>
                    <p className="text-xs text-muted-foreground font-body mt-2">
                      Multiple team members are weak to these types
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamBuilderSection;
