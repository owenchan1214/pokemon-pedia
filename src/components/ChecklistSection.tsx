import { motion } from "framer-motion";
import { Search, X, Loader2, Check, Star, Sparkles, Crown, Dumbbell } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const typeColorMap: Record<string, string> = {
  normal: "bg-[hsl(60,10%,55%)]", fire: "bg-[hsl(15,80%,50%)]", water: "bg-[hsl(220,70%,55%)]",
  electric: "bg-[hsl(48,90%,50%)]", grass: "bg-[hsl(100,55%,45%)]", ice: "bg-[hsl(185,60%,60%)]",
  fighting: "bg-[hsl(2,65%,42%)]", poison: "bg-[hsl(280,55%,45%)]", ground: "bg-[hsl(40,55%,50%)]",
  flying: "bg-[hsl(255,55%,65%)]", psychic: "bg-[hsl(340,70%,55%)]", bug: "bg-[hsl(75,65%,40%)]",
  rock: "bg-[hsl(45,45%,40%)]", ghost: "bg-[hsl(265,35%,40%)]", dragon: "bg-[hsl(260,70%,50%)]",
  dark: "bg-[hsl(25,25%,32%)]", steel: "bg-[hsl(220,15%,60%)]", fairy: "bg-[hsl(330,50%,65%)]",
};

type CheckCategory = "normal" | "shiny" | "hundo" | "mega" | "gigantamax";

const categories: { key: CheckCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "normal", label: "Normal", icon: <Check className="w-3.5 h-3.5" />, color: "bg-primary text-primary-foreground" },
  { key: "shiny", label: "Shiny", icon: <Star className="w-3.5 h-3.5" />, color: "bg-[hsl(var(--shiny))] text-foreground" },
  { key: "hundo", label: "100% IV", icon: <Dumbbell className="w-3.5 h-3.5" />, color: "bg-accent text-accent-foreground" },
  { key: "mega", label: "Mega", icon: <Sparkles className="w-3.5 h-3.5" />, color: "bg-[hsl(var(--mega))] text-white" },
  { key: "gigantamax", label: "Gigantamax", icon: <Crown className="w-3.5 h-3.5" />, color: "bg-[hsl(var(--legendary))] text-white" },
];

type CheckedPokemon = {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  checked: CheckCategory[];
};

const STORAGE_KEY = "pgo-checklist";

const loadChecklist = (): Record<number, CheckedPokemon> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveChecklist = (data: Record<number, CheckedPokemon>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] text-white font-semibold capitalize ${typeColorMap[type] || "bg-muted"}`}>
    {type}
  </span>
);

const ChecklistSection = () => {
  const [checklist, setChecklist] = useState<Record<number, CheckedPokemon>>(loadChecklist);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<CheckCategory | "all">("all");

  useEffect(() => {
    saveChecklist(checklist);
  }, [checklist]);

  const addPokemon = useCallback(async () => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${trimmed}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const id = data.id;
      if (checklist[id]) {
        setError("Already in your checklist!");
        return;
      }
      setChecklist(prev => ({
        ...prev,
        [id]: {
          id,
          name: data.name,
          sprite: data.sprites?.other?.["official-artwork"]?.front_default || data.sprites?.front_default || "",
          types: data.types.map((t: any) => t.type.name),
          checked: [],
        },
      }));
      setQuery("");
    } catch {
      setError("Pokémon not found");
    } finally {
      setLoading(false);
    }
  }, [query, checklist]);

  const toggleCategory = (id: number, cat: CheckCategory) => {
    setChecklist(prev => {
      const poke = prev[id];
      if (!poke) return prev;
      const checked = poke.checked.includes(cat)
        ? poke.checked.filter(c => c !== cat)
        : [...poke.checked, cat];
      return { ...prev, [id]: { ...poke, checked } };
    });
  };

  const removePokemon = (id: number) => {
    setChecklist(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const entries = Object.values(checklist).sort((a, b) => a.id - b.id);
  const filtered = filter === "all" ? entries : entries.filter(e => e.checked.includes(filter));

  const stats = categories.map(cat => ({
    ...cat,
    count: entries.filter(e => e.checked.includes(cat.key)).length,
  }));

  return (
    <section id="checklist" className="py-20 bg-card/30">
      <div className="container px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Pokémon Checklist</h2>
          <p className="text-muted-foreground font-body">Track your catches — normal, shiny, 100% IV, mega & gigantamax</p>
        </motion.div>

        <div className="max-w-4xl">
          {/* Add Pokémon */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Add a Pokémon by name or number..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addPokemon()}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card-gradient border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button onClick={addPokemon} disabled={loading || !query.trim()} className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-body font-semibold hover:brightness-110 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
            </button>
          </div>
          {error && <p className="text-xs text-destructive font-body mb-4">{error}</p>}

          {/* Stats Summary */}
          {entries.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
              {stats.map(s => (
                <div key={s.key} className="flex items-center gap-2 p-3 rounded-xl bg-card-gradient border border-border">
                  <span className={`p-1.5 rounded-lg ${s.color}`}>{s.icon}</span>
                  <div>
                    <p className="text-lg font-display text-foreground leading-none">{s.count}</p>
                    <p className="text-[10px] text-muted-foreground font-body">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filter Tabs */}
          {entries.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-all ${
                  filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All ({entries.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setFilter(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-all ${
                    filter === cat.key ? cat.color : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Pokémon List */}
          <div className="space-y-2">
            {filtered.map(poke => (
              <motion.div
                key={poke.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card-gradient border border-border shadow-card"
              >
                <img src={poke.sprite} alt={poke.name} className="w-12 h-12 object-contain shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">#{String(poke.id).padStart(4, "0")}</span>
                    <span className="text-sm font-display text-foreground capitalize">{poke.name}</span>
                  </div>
                  <div className="flex gap-1 mt-0.5">
                    {poke.types.map(t => <TypeBadge key={t} type={t} />)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {categories.map(cat => {
                    const active = poke.checked.includes(cat.key);
                    return (
                      <button
                        key={cat.key}
                        onClick={() => toggleCategory(poke.id, cat.key)}
                        title={cat.label}
                        className={`p-1.5 rounded-lg text-[10px] font-body font-semibold transition-all border ${
                          active
                            ? `${cat.color} border-transparent`
                            : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {cat.icon}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => removePokemon(poke.id)} className="p-1 rounded-full hover:bg-destructive/10 transition-colors shrink-0">
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>

          {entries.length === 0 && (
            <div className="text-center py-12">
              <Check className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-body text-sm">Add Pokémon to start tracking your catches</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChecklistSection;
