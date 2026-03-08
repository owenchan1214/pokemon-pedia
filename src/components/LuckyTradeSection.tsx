import { motion } from "framer-motion";
import { Star, HandshakeIcon, Search, X, Loader2, Sparkles, Users, ArrowRightLeft } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const typeColorMap: Record<string, string> = {
  normal: "bg-[hsl(60,10%,55%)]", fire: "bg-[hsl(15,80%,50%)]", water: "bg-[hsl(220,70%,55%)]",
  electric: "bg-[hsl(48,90%,50%)]", grass: "bg-[hsl(100,55%,45%)]", ice: "bg-[hsl(185,60%,60%)]",
  fighting: "bg-[hsl(2,65%,42%)]", poison: "bg-[hsl(280,55%,45%)]", ground: "bg-[hsl(40,55%,50%)]",
  flying: "bg-[hsl(255,55%,65%)]", psychic: "bg-[hsl(340,70%,55%)]", bug: "bg-[hsl(75,65%,40%)]",
  rock: "bg-[hsl(45,45%,40%)]", ghost: "bg-[hsl(265,35%,40%)]", dragon: "bg-[hsl(260,70%,50%)]",
  dark: "bg-[hsl(25,25%,32%)]", steel: "bg-[hsl(220,15%,60%)]", fairy: "bg-[hsl(330,50%,65%)]",
};

// Friendship levels and their trade stardust discounts
type FriendshipLevel = "none" | "good" | "great" | "ultra" | "best";

const friendshipData: Record<FriendshipLevel, { label: string; days: number; discount: number; color: string }> = {
  none: { label: "No Friendship", days: 0, discount: 1, color: "text-muted-foreground" },
  good: { label: "Good Friend", days: 1, discount: 1, color: "text-muted-foreground" },
  great: { label: "Great Friend", days: 7, discount: 0.96, color: "text-secondary" },
  ultra: { label: "Ultra Friend", days: 30, discount: 0.92, color: "text-primary" },
  best: { label: "Best Friend", days: 90, discount: 0.96, color: "text-accent" },
};

// Trade stardust costs
type TradeCategory = "standard" | "shiny_legendary" | "new_dex";

const baseTradeCosts: Record<FriendshipLevel, Record<TradeCategory, number>> = {
  none: { standard: 100, shiny_legendary: 1000000, new_dex: 20000 },
  good: { standard: 100, shiny_legendary: 1000000, new_dex: 20000 },
  great: { standard: 100, shiny_legendary: 800000, new_dex: 16000 },
  ultra: { standard: 100, shiny_legendary: 80000, new_dex: 1600 },
  best: { standard: 100, shiny_legendary: 40000, new_dex: 800 },
};

// Lucky trade costs (always reduced)
const luckyTradeCosts: Record<TradeCategory, number> = {
  standard: 100,
  shiny_legendary: 800,
  new_dex: 800,
};

// Power-up stardust costs: regular vs lucky
const powerUpDustRegular = [
  { levels: "1–10", dust: 200 }, { levels: "11–20", dust: 1000 },
  { levels: "21–25", dust: 2500 }, { levels: "26–30", dust: 3500 },
  { levels: "31–35", dust: 5000 }, { levels: "36–40", dust: 7000 },
  { levels: "41–50", dust: 10000 },
];

type LuckyPokemon = {
  name: string;
  id: number;
  sprite: string;
  types: string[];
  addedAt: number;
};

const LuckyTradeSection = () => {
  const [luckyList, setLuckyList] = useState<LuckyPokemon[]>(() => {
    const saved = localStorage.getItem("luckyPokemon");
    return saved ? JSON.parse(saved) : [];
  });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [friendship, setFriendship] = useState<FriendshipLevel>("best");
  const [tradeType, setTradeType] = useState<TradeCategory>("standard");
  const [isLucky, setIsLucky] = useState(false);

  useEffect(() => {
    localStorage.setItem("luckyPokemon", JSON.stringify(luckyList));
  }, [luckyList]);

  const addLucky = useCallback(async () => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    if (luckyList.some(p => p.name === trimmed)) return;
    setLoading(true);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${trimmed}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLuckyList(prev => [{
        name: data.name,
        id: data.id,
        sprite: data.sprites?.other?.["official-artwork"]?.front_default || data.sprites?.front_default || "",
        types: data.types.map((t: any) => t.type.name),
        addedAt: Date.now(),
      }, ...prev]);
      setQuery("");
    } catch { /* ignore */ }
    setLoading(false);
  }, [query, luckyList]);

  const removeLucky = (name: string) => {
    setLuckyList(prev => prev.filter(p => p.name !== name));
  };

  const tradeCost = isLucky
    ? luckyTradeCosts[tradeType]
    : baseTradeCosts[friendship][tradeType];

  const tradeTypes: { key: TradeCategory; label: string; desc: string }[] = [
    { key: "standard", label: "Standard", desc: "Regular Pokémon you both have" },
    { key: "new_dex", label: "New Dex Entry", desc: "Pokémon not in receiver's Pokédex" },
    { key: "shiny_legendary", label: "Shiny / Legendary", desc: "Shiny or Legendary Pokémon" },
  ];

  return (
    <section id="luckytrade" className="py-20 bg-card/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Lucky Trades & Stardust Calculator</h2>
          <p className="text-muted-foreground font-body">Track your Lucky Pokémon and calculate trade costs</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 max-w-5xl">
          {/* Trade Cost Calculator */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
              <h3 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <ArrowRightLeft className="w-3.5 h-3.5 text-primary" /> Trade Cost Calculator
              </h3>

              {/* Friendship Level */}
              <div className="mb-4">
                <label className="text-xs font-body text-muted-foreground block mb-2">Friendship Level</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(friendshipData) as [FriendshipLevel, typeof friendshipData.none][]).map(([key, data]) => (
                    <button
                      key={key}
                      onClick={() => setFriendship(key)}
                      className={`px-3 py-2 rounded-xl text-xs font-body font-medium transition-all ${
                        friendship === key
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted/40 border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {data.label}
                      <span className="block text-[9px] opacity-70">{data.days > 0 ? `${data.days}+ days` : "—"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trade Type */}
              <div className="mb-4">
                <label className="text-xs font-body text-muted-foreground block mb-2">Trade Type</label>
                <div className="space-y-2">
                  {tradeTypes.map(tt => (
                    <button
                      key={tt.key}
                      onClick={() => setTradeType(tt.key)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        tradeType === tt.key
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-muted/30 border border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-xs font-body text-foreground font-semibold">{tt.label}</span>
                      <p className="text-[10px] text-muted-foreground font-body">{tt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lucky Toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setIsLucky(!isLucky)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all w-full justify-center ${
                    isLucky
                      ? "bg-[hsl(var(--shiny))]/15 border border-[hsl(var(--shiny))]/30 text-[hsl(var(--shiny))]"
                      : "bg-muted/40 border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Star className={`w-4 h-4 ${isLucky ? "fill-current" : ""}`} />
                  <span className="text-xs font-body font-semibold">{isLucky ? "Lucky Trade ✨" : "Regular Trade"}</span>
                </button>
              </div>

              {/* Result */}
              <motion.div
                key={`${friendship}-${tradeType}-${isLucky}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-2xl text-center ${
                  isLucky ? "bg-[hsl(var(--shiny))]/10 border border-[hsl(var(--shiny))]/20" : "bg-primary/10 border border-primary/20"
                }`}
              >
                <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-1">Stardust Cost</p>
                <p className={`text-3xl font-mono font-bold ${isLucky ? "text-[hsl(var(--shiny))]" : "text-primary"}`}>
                  {tradeCost.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  {isLucky && "Lucky trades always cost minimum stardust"}
                  {!isLucky && friendship === "best" && "Best friends get maximum discount"}
                  {!isLucky && friendship !== "best" && `Upgrade friendship to reduce cost`}
                </p>
                {!isLucky && tradeCost > luckyTradeCosts[tradeType] && (
                  <p className="text-[11px] font-body mt-2 text-[hsl(var(--shiny))]">
                    ✨ Lucky trade would cost only {luckyTradeCosts[tradeType].toLocaleString()} (save {(tradeCost - luckyTradeCosts[tradeType]).toLocaleString()})
                  </p>
                )}
              </motion.div>
            </div>

            {/* Full Cost Reference */}
            <div className="p-5 rounded-2xl bg-card-gradient border border-border shadow-card">
              <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3">Trade Cost Reference</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-body">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Friendship</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Standard</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">New Dex</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Shiny/Legend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.entries(baseTradeCosts) as [FriendshipLevel, Record<TradeCategory, number>][]).map(([level, costs]) => (
                      <tr key={level} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                        friendship === level ? "bg-primary/5" : ""
                      }`}>
                        <td className={`py-2 font-medium ${friendshipData[level].color}`}>{friendshipData[level].label}</td>
                        <td className="py-2 text-right font-mono text-foreground">{costs.standard.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono text-foreground">{costs.new_dex.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono text-foreground">{costs.shiny_legendary.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-border/50 bg-[hsl(var(--shiny))]/5">
                      <td className="py-2 font-medium text-[hsl(var(--shiny))]">✨ Lucky Trade</td>
                      <td className="py-2 text-right font-mono text-[hsl(var(--shiny))]">{luckyTradeCosts.standard.toLocaleString()}</td>
                      <td className="py-2 text-right font-mono text-[hsl(var(--shiny))]">{luckyTradeCosts.new_dex.toLocaleString()}</td>
                      <td className="py-2 text-right font-mono text-[hsl(var(--shiny))]">{luckyTradeCosts.shiny_legendary.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lucky Benefits */}
            <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
              <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--shiny))]" /> Lucky Pokémon Benefits
              </h4>
              <ul className="space-y-1.5 text-xs font-body text-muted-foreground">
                <li>⭐ Guaranteed minimum 12/12/12 IVs (floor of 12 for each stat)</li>
                <li>✨ 50% less stardust to power up</li>
                <li>🤝 Lucky Friends: Guaranteed Lucky on next trade (Best Friends only)</li>
                <li>📅 Pokémon from July–August 2016 have highest Lucky chance</li>
                <li>📊 Lucky rate increases with older Pokémon and fewer Lucky owned</li>
              </ul>
            </div>
          </div>

          {/* Lucky Pokémon Tracker */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-card-gradient border border-[hsl(var(--shiny))]/20 shadow-card">
              <h3 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-[hsl(var(--shiny))]" /> Lucky Pokémon Collection
              </h3>
              <p className="text-[11px] text-muted-foreground font-body mb-3">Track your Lucky Pokémon from trades</p>

              {/* Add Lucky */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Add Pokémon..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addLucky()}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-foreground font-body text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--shiny))]/40"
                  />
                </div>
                <button
                  onClick={addLucky}
                  disabled={loading || !query.trim()}
                  className="px-3 py-2 rounded-xl bg-[hsl(var(--shiny))] text-white text-xs font-body font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add"}
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 mb-3 p-2.5 rounded-xl bg-[hsl(var(--shiny))]/10 border border-[hsl(var(--shiny))]/15">
                <Star className="w-4 h-4 text-[hsl(var(--shiny))]" />
                <div>
                  <p className="text-lg font-mono text-[hsl(var(--shiny))] font-bold">{luckyList.length}</p>
                  <p className="text-[10px] text-muted-foreground font-body">Lucky Pokémon</p>
                </div>
              </div>

              {/* List */}
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {luckyList.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-body text-center py-6">No Lucky Pokémon tracked yet</p>
                ) : (
                  luckyList.map((poke) => (
                    <motion.div
                      key={poke.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors group"
                    >
                      <img src={poke.sprite} alt={poke.name} className="w-10 h-10 object-contain" loading="lazy" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-body text-foreground font-medium capitalize block truncate">{poke.name}</span>
                        <div className="flex gap-0.5">
                          {poke.types.map(t => (
                            <span key={t} className={`inline-block px-1 py-0.5 rounded text-[8px] text-white font-semibold capitalize ${typeColorMap[t]}`}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => removeLucky(poke.name)}
                        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Lucky Trade Tips */}
            <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
              <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-secondary" /> Trading Tips
              </h4>
              <ul className="space-y-1.5 text-xs font-body text-muted-foreground">
                <li>📏 Must be within 100m of trade partner</li>
                <li>🔄 1 Special Trade per day (shiny, legendary, new dex)</li>
                <li>🎂 Older Pokémon have higher Lucky chance</li>
                <li>💯 Lucky Pokémon are best for PvP (high IV floor)</li>
                <li>🏆 Reach Best Friends for lowest trade costs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LuckyTradeSection;
