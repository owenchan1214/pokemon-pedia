import { motion } from "framer-motion";
import { MapPin, TreePine, Clock, RotateCcw, Sparkles, Bug, Flame, Droplets, Zap, Leaf, Snowflake, Mountain, Wind } from "lucide-react";
import { useState } from "react";

const typeColorMap: Record<string, string> = {
  normal: "bg-[hsl(60,10%,55%)]", fire: "bg-[hsl(15,80%,50%)]", water: "bg-[hsl(220,70%,55%)]",
  electric: "bg-[hsl(48,90%,50%)]", grass: "bg-[hsl(100,55%,45%)]", ice: "bg-[hsl(185,60%,60%)]",
  fighting: "bg-[hsl(2,65%,42%)]", poison: "bg-[hsl(280,55%,45%)]", ground: "bg-[hsl(40,55%,50%)]",
  flying: "bg-[hsl(255,55%,65%)]", psychic: "bg-[hsl(340,70%,55%)]", bug: "bg-[hsl(75,65%,40%)]",
  rock: "bg-[hsl(45,45%,40%)]", ghost: "bg-[hsl(265,35%,40%)]", dragon: "bg-[hsl(260,70%,50%)]",
  dark: "bg-[hsl(25,25%,32%)]", steel: "bg-[hsl(220,15%,60%)]", fairy: "bg-[hsl(330,50%,65%)]",
};

// Biome/habitat spawn data for Pokémon GO
type Biome = {
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  borderColor: string;
  commonSpawns: { name: string; type: string; rarity: "common" | "uncommon" | "rare" }[];
  weatherBoost: string;
};

const biomes: Biome[] = [
  {
    name: "Urban / City",
    icon: <MapPin className="w-4 h-4" />,
    description: "Streets, buildings, shopping areas",
    color: "bg-muted/40",
    borderColor: "border-muted-foreground/20",
    weatherBoost: "Partly Cloudy, Cloudy",
    commonSpawns: [
      { name: "Pidgey", type: "normal", rarity: "common" },
      { name: "Rattata", type: "normal", rarity: "common" },
      { name: "Murkrow", type: "dark", rarity: "common" },
      { name: "Patrat", type: "normal", rarity: "common" },
      { name: "Litleo", type: "fire", rarity: "uncommon" },
      { name: "Pawniard", type: "dark", rarity: "uncommon" },
      { name: "Zorua", type: "dark", rarity: "rare" },
      { name: "Deino", type: "dark", rarity: "rare" },
    ],
  },
  {
    name: "Water / Beach",
    icon: <Droplets className="w-4 h-4" />,
    description: "Rivers, lakes, oceans, coastlines",
    color: "bg-secondary/10",
    borderColor: "border-secondary/20",
    weatherBoost: "Rainy",
    commonSpawns: [
      { name: "Magikarp", type: "water", rarity: "common" },
      { name: "Psyduck", type: "water", rarity: "common" },
      { name: "Slowpoke", type: "water", rarity: "common" },
      { name: "Marill", type: "water", rarity: "common" },
      { name: "Wailmer", type: "water", rarity: "uncommon" },
      { name: "Feebas", type: "water", rarity: "uncommon" },
      { name: "Dratini", type: "dragon", rarity: "rare" },
      { name: "Lapras", type: "ice", rarity: "rare" },
    ],
  },
  {
    name: "Forest / Park",
    icon: <TreePine className="w-4 h-4" />,
    description: "Parks, forests, nature reserves",
    color: "bg-primary/10",
    borderColor: "border-primary/20",
    weatherBoost: "Sunny / Clear",
    commonSpawns: [
      { name: "Caterpie", type: "bug", rarity: "common" },
      { name: "Oddish", type: "grass", rarity: "common" },
      { name: "Bellsprout", type: "grass", rarity: "common" },
      { name: "Seedot", type: "grass", rarity: "common" },
      { name: "Scyther", type: "bug", rarity: "uncommon" },
      { name: "Tangela", type: "grass", rarity: "uncommon" },
      { name: "Heracross", type: "bug", rarity: "rare" },
      { name: "Tropius", type: "grass", rarity: "rare" },
    ],
  },
  {
    name: "Mountain / Hiking",
    icon: <Mountain className="w-4 h-4" />,
    description: "Highlands, rocky terrain, elevation",
    color: "bg-accent/10",
    borderColor: "border-accent/20",
    weatherBoost: "Windy, Partly Cloudy",
    commonSpawns: [
      { name: "Geodude", type: "rock", rarity: "common" },
      { name: "Machop", type: "fighting", rarity: "common" },
      { name: "Aron", type: "steel", rarity: "common" },
      { name: "Rhyhorn", type: "ground", rarity: "uncommon" },
      { name: "Larvitar", type: "rock", rarity: "uncommon" },
      { name: "Beldum", type: "steel", rarity: "rare" },
      { name: "Gible", type: "dragon", rarity: "rare" },
      { name: "Axew", type: "dragon", rarity: "rare" },
    ],
  },
  {
    name: "Residential",
    icon: <Wind className="w-4 h-4" />,
    description: "Neighborhoods, suburbs, houses",
    color: "bg-[hsl(var(--shiny))]/10",
    borderColor: "border-[hsl(var(--shiny))]/20",
    weatherBoost: "Varies by weather",
    commonSpawns: [
      { name: "Starly", type: "normal", rarity: "common" },
      { name: "Bidoof", type: "normal", rarity: "common" },
      { name: "Sentret", type: "normal", rarity: "common" },
      { name: "Skitty", type: "normal", rarity: "common" },
      { name: "Eevee", type: "normal", rarity: "uncommon" },
      { name: "Chansey", type: "normal", rarity: "rare" },
      { name: "Snorlax", type: "normal", rarity: "rare" },
      { name: "Togetic", type: "fairy", rarity: "rare" },
    ],
  },
];

// Nesting species – rotates every 2 weeks in GO
type NestSpecies = {
  name: string;
  type: string;
  tier: "S" | "A" | "B" | "C";
  note: string;
};

const nestingSpecies: NestSpecies[] = [
  { name: "Charmander", type: "fire", tier: "S", note: "Great for Mega Charizard candy" },
  { name: "Machop", type: "fighting", tier: "S", note: "Top fighting attacker evolution" },
  { name: "Gastly", type: "ghost", tier: "S", note: "Mega Gengar candy farming" },
  { name: "Rhyhorn", type: "ground", tier: "S", note: "Rhyperior is a top rock attacker" },
  { name: "Magikarp", type: "water", tier: "A", note: "Mega Gyarados + easy shiny hunt" },
  { name: "Eevee", type: "normal", tier: "A", note: "Multiple useful evolutions" },
  { name: "Swinub", type: "ice", tier: "A", note: "Mamoswine is elite for raids" },
  { name: "Roselia", type: "grass", tier: "A", note: "Roserade is solid for grass/poison" },
  { name: "Ralts", type: "psychic", tier: "A", note: "Gardevoir & Gallade both useful" },
  { name: "Gible", type: "dragon", tier: "S", note: "Garchomp is a top-tier dragon" },
  { name: "Larvitar", type: "rock", tier: "S", note: "Tyranitar for dark/rock raids" },
  { name: "Beldum", type: "steel", tier: "S", note: "Metagross with Meteor Mash" },
  { name: "Dratini", type: "dragon", tier: "A", note: "Dragonite + Mega Dragonite" },
  { name: "Abra", type: "psychic", tier: "B", note: "Mega Alakazam candy" },
  { name: "Electabuzz", type: "electric", tier: "B", note: "Electivire is a good electric" },
  { name: "Magmar", type: "fire", tier: "B", note: "Magmortar is a decent fire type" },
  { name: "Sneasel", type: "dark", tier: "B", note: "Weavile for dark/ice DPS" },
  { name: "Aron", type: "steel", tier: "B", note: "Mega Aggron candy" },
  { name: "Swablu", type: "normal", tier: "C", note: "Mega Altaria candy, easy shiny" },
  { name: "Seedot", type: "grass", tier: "C", note: "Shiftry for grass/dark niche" },
  { name: "Voltorb", type: "electric", tier: "C", note: "Quick evolves for XP" },
  { name: "Nidoran♂", type: "poison", tier: "C", note: "Nidoking is a budget ground/poison" },
  { name: "Poliwag", type: "water", tier: "B", note: "Poliwrath for fighting, Politoed for PvP" },
  { name: "Geodude", type: "rock", tier: "B", note: "Golem for rock DPS" },
];

// Current nest rotation (simulated - rotates every 2 weeks)
const getCurrentRotation = () => {
  const epoch = new Date("2026-01-05T00:00:00Z").getTime();
  const now = Date.now();
  const twoWeeks = 14 * 24 * 60 * 60 * 1000;
  const rotationIndex = Math.floor((now - epoch) / twoWeeks);
  const nextRotation = new Date(epoch + (rotationIndex + 1) * twoWeeks);

  // Shuffle based on rotation
  const shuffled = [...nestingSpecies].sort((a, b) => {
    const hashA = (a.name.charCodeAt(0) * 31 + rotationIndex) % 100;
    const hashB = (b.name.charCodeAt(0) * 31 + rotationIndex) % 100;
    return hashA - hashB;
  });

  return {
    featured: shuffled.slice(0, 8),
    nextRotation,
    rotationNumber: rotationIndex + 1,
  };
};

const rarityBadge = (rarity: "common" | "uncommon" | "rare") => {
  const styles = {
    common: "bg-muted text-muted-foreground",
    uncommon: "bg-primary/15 text-primary",
    rare: "bg-accent/15 text-accent",
  };
  return (
    <span className={`text-[9px] font-body font-semibold px-1.5 py-0.5 rounded ${styles[rarity]}`}>
      {rarity}
    </span>
  );
};

const tierColor: Record<string, string> = {
  S: "text-accent font-bold",
  A: "text-primary font-semibold",
  B: "text-secondary font-medium",
  C: "text-muted-foreground",
};

const SpawnNestSection = () => {
  const [selectedBiome, setSelectedBiome] = useState(0);
  const rotation = getCurrentRotation();
  const [tierFilter, setTierFilter] = useState<string | null>(null);

  const filteredNests = tierFilter
    ? rotation.featured.filter(n => n.tier === tierFilter)
    : rotation.featured;

  return (
    <section id="spawns" className="py-20 bg-card/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Spawn & Nest Tracker</h2>
          <p className="text-muted-foreground font-body">Explore biome spawns and current nesting species rotations</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Biome Spawns */}
          <div className="space-y-4">
            <h3 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Biome Spawn Guide
            </h3>

            {/* Biome Tabs */}
            <div className="flex flex-wrap gap-2">
              {biomes.map((biome, i) => (
                <button
                  key={biome.name}
                  onClick={() => setSelectedBiome(i)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-body font-medium transition-all ${
                    selectedBiome === i
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card-gradient border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {biome.icon}
                  {biome.name}
                </button>
              ))}
            </div>

            {/* Selected Biome Detail */}
            <motion.div
              key={selectedBiome}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border shadow-card ${biomes[selectedBiome].color} ${biomes[selectedBiome].borderColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-body text-foreground font-semibold">{biomes[selectedBiome].name}</h4>
                  <p className="text-[11px] text-muted-foreground font-body">{biomes[selectedBiome].description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground font-body">Weather Boost</p>
                  <p className="text-xs font-body text-foreground font-medium">{biomes[selectedBiome].weatherBoost}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {biomes[selectedBiome].commonSpawns.map((spawn) => (
                  <div
                    key={spawn.name}
                    className="flex flex-col gap-1 p-2.5 rounded-xl bg-background/60 border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-body text-foreground font-medium">{spawn.name}</span>
                      {rarityBadge(spawn.rarity)}
                    </div>
                    <span className={`inline-block w-fit px-1.5 py-0.5 rounded text-[9px] text-white font-semibold capitalize ${typeColorMap[spawn.type] || "bg-muted"}`}>
                      {spawn.type}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Spawn Tips */}
            <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
              <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--shiny))]" /> Spawn Tips
              </h4>
              <ul className="space-y-1.5 text-xs font-body text-muted-foreground">
                <li>🌦️ Weather affects spawns — rainy weather boosts Water, Electric & Bug types</li>
                <li>🕐 Spawn pools change at midnight and some Pokémon only appear at night</li>
                <li>📍 Lure Modules at PokéStops increase spawn rates for 30 minutes</li>
                <li>🧲 Magnetic/Glacial/Mossy Lures attract specific types</li>
                <li>🎫 Incense spawns 1 Pokémon every 5 min (1/min during events)</li>
              </ul>
            </div>
          </div>

          {/* Nest Tracker */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <TreePine className="w-3.5 h-3.5 text-primary" /> Current Nest Rotation
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground">#{rotation.rotationNumber}</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground font-body">
                  Next rotation: {rotation.nextRotation.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>

              {/* Tier Filters */}
              <div className="flex gap-1.5 mb-3">
                <button
                  onClick={() => setTierFilter(null)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-body font-semibold transition-all ${
                    !tierFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {["S", "A", "B", "C"].map(t => (
                  <button
                    key={t}
                    onClick={() => setTierFilter(tierFilter === t ? null : t)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-body font-semibold transition-all ${
                      tierFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Tier {t}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredNests.map((nest, i) => (
                  <motion.div
                    key={nest.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-mono w-5 text-center ${tierColor[nest.tier]}`}>{nest.tier}</span>
                      <div>
                        <span className="text-xs font-body text-foreground font-medium">{nest.name}</span>
                        <p className="text-[10px] text-muted-foreground font-body">{nest.note}</p>
                      </div>
                    </div>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] text-white font-semibold capitalize ${typeColorMap[nest.type] || "bg-muted"}`}>
                      {nest.type}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Nest Info */}
            <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
              <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-secondary" /> How Nests Work
              </h4>
              <ul className="space-y-1.5 text-xs font-body text-muted-foreground">
                <li>🔄 Nests rotate every 2 weeks (biweekly on Wednesday)</li>
                <li>📍 Found in parks, playgrounds, and large green areas</li>
                <li>🎯 Nests spawn the same species frequently in one location</li>
                <li>⭐ S-tier nests are worth traveling for candy farming</li>
                <li>🗺️ Use local community maps to find nests near you</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpawnNestSection;
