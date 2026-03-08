import { motion } from "framer-motion";
import { Users, Plus, X, Shield, Swords, ChevronDown, Crown, Trophy } from "lucide-react";
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

type PokemonOption = { name: string; types: PType[]; role?: string };

const greatLeaguePool: PokemonOption[] = [
  { name: "Jellicent", types: ["Water", "Ghost"], role: "Safe Switch" },
  { name: "Altaria", types: ["Dragon", "Flying"], role: "Closer" },
  { name: "Azumarill", types: ["Water", "Fairy"], role: "Lead" },
  { name: "Furret", types: ["Normal"], role: "Safe Switch" },
  { name: "Empoleon", types: ["Water", "Steel"], role: "Closer" },
  { name: "Wigglytuff", types: ["Normal", "Fairy"], role: "Lead" },
  { name: "Corviknight", types: ["Flying", "Steel"], role: "Safe Switch" },
  { name: "Lickilicky", types: ["Normal"], role: "Closer" },
  { name: "Swampert", types: ["Water", "Ground"], role: "Lead" },
  { name: "Venusaur", types: ["Grass", "Poison"], role: "Closer" },
  { name: "Bastiodon", types: ["Rock", "Steel"], role: "Lead" },
  { name: "Trevenant", types: ["Ghost", "Grass"], role: "Safe Switch" },
  { name: "Galarian Stunfisk", types: ["Ground", "Steel"], role: "Lead" },
  { name: "Medicham", types: ["Fighting", "Psychic"], role: "Lead" },
  { name: "Registeel", types: ["Steel"], role: "Closer" },
  { name: "Skarmory", types: ["Steel", "Flying"], role: "Lead" },
  { name: "Lickitung", types: ["Normal"], role: "Safe Switch" },
  { name: "Sableye", types: ["Dark", "Ghost"], role: "Lead" },
  { name: "Umbreon", types: ["Dark"], role: "Safe Switch" },
  { name: "Toxapex", types: ["Poison", "Water"], role: "Closer" },
  { name: "Mandibuzz", types: ["Dark", "Flying"], role: "Safe Switch" },
  { name: "Nidoqueen", types: ["Poison", "Ground"], role: "Closer" },
  { name: "Pelipper", types: ["Water", "Flying"], role: "Lead" },
  { name: "Lanturn", types: ["Water", "Electric"], role: "Safe Switch" },
];

const ultraLeaguePool: PokemonOption[] = [
  { name: "Galarian Moltres", types: ["Dark", "Flying"], role: "Lead" },
  { name: "Corviknight", types: ["Flying", "Steel"], role: "Safe Switch" },
  { name: "Lapras", types: ["Water", "Ice"], role: "Lead" },
  { name: "Jellicent", types: ["Water", "Ghost"], role: "Safe Switch" },
  { name: "Florges", types: ["Fairy"], role: "Closer" },
  { name: "Empoleon", types: ["Water", "Steel"], role: "Closer" },
  { name: "Clefable", types: ["Fairy"], role: "Closer" },
  { name: "Giratina (Altered)", types: ["Ghost", "Dragon"], role: "Lead" },
  { name: "Cresselia", types: ["Psychic"], role: "Safe Switch" },
  { name: "Cobalion", types: ["Steel", "Fighting"], role: "Lead" },
  { name: "Swampert", types: ["Water", "Ground"], role: "Lead" },
  { name: "Talonflame", types: ["Fire", "Flying"], role: "Lead" },
  { name: "Walrein", types: ["Ice", "Water"], role: "Closer" },
  { name: "Registeel", types: ["Steel"], role: "Closer" },
  { name: "Venusaur", types: ["Grass", "Poison"], role: "Closer" },
  { name: "Mandibuzz", types: ["Dark", "Flying"], role: "Safe Switch" },
  { name: "Charizard", types: ["Fire", "Flying"], role: "Closer" },
  { name: "Gyarados", types: ["Water", "Flying"], role: "Lead" },
  { name: "Toxicroak", types: ["Poison", "Fighting"], role: "Closer" },
  { name: "Umbreon", types: ["Dark"], role: "Safe Switch" },
];

const masterLeaguePool: PokemonOption[] = [
  { name: "Zacian (Crowned)", types: ["Fairy", "Steel"], role: "Lead" },
  { name: "Palkia (Origin)", types: ["Water", "Dragon"], role: "Closer" },
  { name: "Metagross", types: ["Steel", "Psychic"], role: "Safe Switch" },
  { name: "Xerneas", types: ["Fairy"], role: "Lead" },
  { name: "Dialga (Origin)", types: ["Steel", "Dragon"], role: "Lead" },
  { name: "Reshiram", types: ["Dragon", "Fire"], role: "Closer" },
  { name: "Kyurem (White)", types: ["Dragon", "Ice"], role: "Closer" },
  { name: "Lunala", types: ["Psychic", "Ghost"], role: "Safe Switch" },
  { name: "Kyurem (Black)", types: ["Dragon", "Ice"], role: "Closer" },
  { name: "Kyogre", types: ["Water"], role: "Lead" },
  { name: "Groudon", types: ["Ground"], role: "Lead" },
  { name: "Rayquaza", types: ["Dragon", "Flying"], role: "Closer" },
  { name: "Mewtwo", types: ["Psychic"], role: "Safe Switch" },
  { name: "Giratina (Origin)", types: ["Ghost", "Dragon"], role: "Safe Switch" },
  { name: "Darkrai", types: ["Dark"], role: "Closer" },
  { name: "Dragonite", types: ["Dragon", "Flying"], role: "Safe Switch" },
  { name: "Garchomp", types: ["Dragon", "Ground"], role: "Closer" },
  { name: "Tyranitar", types: ["Rock", "Dark"], role: "Closer" },
  { name: "Togekiss", types: ["Fairy", "Flying"], role: "Lead" },
  { name: "Excadrill", types: ["Ground", "Steel"], role: "Closer" },
  { name: "Zamazenta (Crowned)", types: ["Fighting", "Steel"], role: "Lead" },
  { name: "Zekrom", types: ["Dragon", "Electric"], role: "Closer" },
];

const leagueConfig = [
  { id: "great", name: "Great League", cap: "1,500 CP", icon: Shield, pool: greatLeaguePool, color: "text-secondary" },
  { id: "ultra", name: "Ultra League", cap: "2,500 CP", icon: Swords, pool: ultraLeaguePool, color: "text-[hsl(var(--legendary))]" },
  { id: "master", name: "Master League", cap: "No Limit", icon: Crown, pool: masterLeaguePool, color: "text-accent" },
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

// Defensive type chart: what types resist what
const defensiveResistances: Record<PType, PType[]> = {
  Normal: [], Fire: ["Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"],
  Water: ["Fire", "Water", "Ice", "Steel"], Electric: ["Electric", "Flying", "Steel"],
  Grass: ["Water", "Electric", "Grass", "Ground"], Ice: ["Ice"],
  Fighting: ["Bug", "Rock", "Dark"], Poison: ["Grass", "Fighting", "Poison", "Bug", "Fairy"],
  Ground: ["Poison", "Rock"], Flying: ["Grass", "Fighting", "Bug"],
  Psychic: ["Fighting", "Psychic"], Bug: ["Grass", "Fighting", "Ground"],
  Rock: ["Normal", "Fire", "Poison", "Flying"], Ghost: ["Poison", "Bug"],
  Dragon: ["Fire", "Water", "Electric", "Grass"], Dark: ["Ghost", "Dark"],
  Steel: ["Normal", "Grass", "Ice", "Flying", "Psychic", "Bug", "Rock", "Dragon", "Steel", "Fairy"],
  Fairy: ["Fighting", "Bug", "Dark"],
};

const defensiveImmunities: Record<PType, PType[]> = {
  Normal: ["Ghost"], Fire: [], Water: [], Electric: [], Grass: [], Ice: [],
  Fighting: [], Poison: [], Ground: ["Electric"], Flying: ["Ground"],
  Psychic: [], Bug: [], Rock: [], Ghost: ["Normal", "Fighting"],
  Dragon: [], Dark: ["Psychic"], Steel: ["Poison"], Fairy: ["Dragon"],
};

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] text-white font-semibold mr-1 ${typeColorMap[type] || "bg-muted"}`}>
    {type}
  </span>
);

const RoleBadge = ({ role }: { role: string }) => {
  const colors = role === "Lead" ? "bg-primary/15 text-primary" : role === "Closer" ? "bg-accent/15 text-accent" : "bg-secondary/15 text-secondary";
  return <span className={`text-[9px] font-body font-semibold px-1.5 py-0.5 rounded ${colors}`}>{role}</span>;
};

const TeamBuilderSection = () => {
  const [league, setLeague] = useState("great");
  const [team, setTeam] = useState<PokemonOption[]>([]);
  const [searchOpen, setSearchOpen] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentLeague = leagueConfig.find(l => l.id === league)!;

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

  const switchLeague = (newLeague: string) => {
    setLeague(newLeague);
    setTeam([]);
    setSearchOpen(null);
    setSearchQuery("");
  };

  const filteredPool = useMemo(() => {
    const selected = new Set(team.map(p => p.name));
    let list = currentLeague.pool.filter(p => !selected.has(p.name));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [searchQuery, team, currentLeague.pool]);

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

    // Defensive analysis
    const weakTo = new Map<PType, number>();
    const resistsCount = new Map<PType, number>();

    team.forEach(pokemon => {
      allTypes.forEach(attackType => {
        let mult = 1;
        pokemon.types.forEach(defType => {
          if (effectiveness[attackType].superEffective.includes(defType)) mult *= 2;
          if (defensiveResistances[defType]?.includes(attackType)) mult *= 0.5;
          if (defensiveImmunities[defType]?.includes(attackType)) mult *= 0;
        });
        if (mult >= 2) weakTo.set(attackType, (weakTo.get(attackType) || 0) + 1);
        if (mult < 1) resistsCount.set(attackType, (resistsCount.get(attackType) || 0) + 1);
      });
    });

    const sharedWeaknesses = Array.from(weakTo.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));

    // Types the team resists well (2+ members resist)
    const teamResistances = Array.from(resistsCount.entries())
      .filter(([, count]) => count >= 2)
      .map(([type]) => type);

    // Team role balance
    const roles = team.map(p => p.role || "Unknown");
    const hasLead = roles.includes("Lead");
    const hasCloser = roles.includes("Closer");
    const hasSwitch = roles.includes("Safe Switch");
    const roleBalance = { hasLead, hasCloser, hasSwitch, balanced: hasLead && hasCloser && hasSwitch };

    return {
      superEffectiveAgainst: Array.from(superEffectiveAgainst),
      notCovered: Array.from(notCovered),
      sharedWeaknesses,
      teamResistances,
      coveragePercent: Math.round((superEffectiveAgainst.size / allTypes.length) * 100),
      roleBalance,
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
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">PvP Team Builder</h2>
          <p className="text-muted-foreground font-body">Build a team of 3 for any league and analyze type coverage, weaknesses & role balance</p>
        </motion.div>

        {/* League Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {leagueConfig.map(l => (
            <button
              key={l.id}
              onClick={() => switchLeague(l.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-body font-semibold text-sm transition-all ${
                league === l.id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              <l.icon className="w-4 h-4" />
              {l.name}
              <span className="text-xs opacity-70">({l.cap})</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl">
          {/* Team Slots */}
          <div className="space-y-4">
            <h3 className="text-sm font-body font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Your {currentLeague.name} Team
            </h3>
            <div className="space-y-3">
              {[0, 1, 2].map((slot) => {
                const pokemon = team[slot];
                return (
                  <motion.div
                    key={`${league}-${slot}`}
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
                            <div className="flex items-center gap-2">
                              <p className="font-body font-semibold text-foreground">{pokemon.name}</p>
                              {pokemon.role && <RoleBadge role={pokemon.role} />}
                            </div>
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
                          <span className="font-body text-sm">
                            Add {slot === 0 ? "Lead" : slot === 1 ? "Safe Switch" : "Closer"}
                          </span>
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
                            <div className="max-h-52 overflow-y-auto">
                              {filteredPool.length === 0 ? (
                                <p className="p-4 text-sm text-muted-foreground font-body text-center">No Pokémon found</p>
                              ) : (
                                filteredPool.map(p => (
                                  <button
                                    key={p.name}
                                    onClick={() => addToTeam(p, slot)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-primary/5 transition-colors text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-body text-sm text-foreground">{p.name}</span>
                                      {p.role && <RoleBadge role={p.role} />}
                                    </div>
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
              <Swords className="w-4 h-4 text-primary" /> Team Analysis
            </h3>
            {!coverage ? (
              <div className="p-8 rounded-2xl bg-card-gradient border border-border shadow-card text-center">
                <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground font-body text-sm">Add Pokémon to see your team's type coverage & role balance</p>
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
                      className={`h-full rounded-full ${coverage.coveragePercent >= 80 ? "bg-primary" : coverage.coveragePercent >= 50 ? "bg-secondary" : "bg-accent"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${coverage.coveragePercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-body mt-2">
                    Super effective against {coverage.superEffectiveAgainst.length} of {allTypes.length} types
                  </p>
                </div>

                {/* Role Balance */}
                <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="font-body text-sm text-foreground font-semibold">Role Balance</span>
                    {coverage.roleBalance.balanced && (
                      <span className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-lg bg-primary/15 text-primary">✓ Balanced</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Lead", has: coverage.roleBalance.hasLead },
                      { label: "Safe Switch", has: coverage.roleBalance.hasSwitch },
                      { label: "Closer", has: coverage.roleBalance.hasCloser },
                    ].map(r => (
                      <div key={r.label} className={`p-2 rounded-xl text-center border ${r.has ? "bg-primary/10 border-primary/20" : "bg-muted/30 border-border"}`}>
                        <p className={`text-[10px] font-body font-semibold uppercase ${r.has ? "text-primary" : "text-muted-foreground"}`}>
                          {r.has ? "✓" : "✗"} {r.label}
                        </p>
                      </div>
                    ))}
                  </div>
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

                {/* Team Resistances */}
                {coverage.teamResistances.length > 0 && (
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 shadow-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="font-body text-sm text-foreground font-semibold">Strong Team Resistances</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {coverage.teamResistances.map(t => <TypeBadge key={t} type={t} />)}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-body mt-2">
                      2+ team members resist these types
                    </p>
                  </div>
                )}

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
                      {coverage.sharedWeaknesses.map(({ type, count }) => (
                        <span key={type} className="flex items-center gap-1">
                          <TypeBadge type={type} />
                          <span className="text-[10px] text-destructive font-mono font-bold">×{count}</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground font-body mt-2">
                      Multiple team members share these weaknesses — consider swapping
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
