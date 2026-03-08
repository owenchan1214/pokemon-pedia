import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const typeColorMap: Record<string, string> = {
  normal: "bg-[hsl(60,10%,55%)]", fire: "bg-[hsl(15,80%,50%)]", water: "bg-[hsl(220,70%,55%)]",
  electric: "bg-[hsl(48,90%,50%)]", grass: "bg-[hsl(100,55%,45%)]", ice: "bg-[hsl(185,60%,60%)]",
  fighting: "bg-[hsl(2,65%,42%)]", poison: "bg-[hsl(280,55%,45%)]", ground: "bg-[hsl(40,55%,50%)]",
  flying: "bg-[hsl(255,55%,65%)]", psychic: "bg-[hsl(340,70%,55%)]", bug: "bg-[hsl(75,65%,40%)]",
  rock: "bg-[hsl(45,45%,40%)]", ghost: "bg-[hsl(265,35%,40%)]", dragon: "bg-[hsl(260,70%,50%)]",
  dark: "bg-[hsl(25,25%,32%)]", steel: "bg-[hsl(220,15%,60%)]", fairy: "bg-[hsl(330,50%,65%)]",
};

// Pokémon GO available Mega Evolutions (as of 2026)
const goMegaAvailable = new Set([
  "venusaur", "charizard", "blastoise", "beedrill", "pidgeot",
  "alakazam", "slowbro", "gengar", "kangaskhan", "pinsir",
  "gyarados", "aerodactyl", "ampharos", "steelix", "scizor",
  "heracross", "houndoom", "tyranitar", "sceptile", "blaziken",
  "swampert", "gardevoir", "sableye", "mawile", "aggron",
  "medicham", "manectric", "sharpedo", "camerupt", "altaria",
  "banette", "absol", "glalie", "salamence", "metagross",
  "latias", "latios", "rayquaza", "lopunny", "garchomp",
  "lucario", "abomasnow", "gallade", "diancie", "groudon", "kyogre",
]);

// Pokémon GO available Gigantamax forms (Dynamax feature added 2024-2025)
const goGmaxAvailable = new Set([
  "charizard", "blastoise", "venusaur", "pikachu", "eevee",
  "snorlax", "gengar", "machamp", "lapras", "kingler",
  "toxtricity", "alcremie", "duraludon", "urshifu",
  "rillaboom", "cinderace", "inteleon",
]);

type EvoStage = {
  name: string;
  id: number;
  sprite: string;
  types: string[];
  trigger?: string;
  minLevel?: number | null;
  item?: string | null;
};

type SpecialForm = {
  name: string;
  formName: string;
  sprite: string;
  types: string[];
  category: "mega" | "gmax" | "other";
};

type EvolutionChainData = {
  chain: EvoStage[];
  specialForms: SpecialForm[];
};

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] text-white font-semibold capitalize ${typeColorMap[type] || "bg-muted"}`}>
    {type}
  </span>
);

function parseChain(chain: any): { name: string; trigger?: string; minLevel?: number | null; item?: string | null }[] {
  const results: { name: string; trigger?: string; minLevel?: number | null; item?: string | null }[] = [];
  function walk(node: any) {
    const details = node.evolution_details?.[0];
    results.push({
      name: node.species.name,
      trigger: details?.trigger?.name,
      minLevel: details?.min_level,
      item: details?.item?.name?.replace(/-/g, " ") || details?.held_item?.name?.replace(/-/g, " "),
    });
    if (node.evolves_to?.length) {
      node.evolves_to.forEach((e: any) => walk(e));
    }
  }
  walk(chain);
  return results;
}

async function fetchEvolutionChain(pokemonId: number): Promise<EvolutionChainData> {
  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
  if (!speciesRes.ok) throw new Error("Species not found");
  const speciesData = await speciesRes.json();

  const specialForms: SpecialForm[] = [];
  const varieties = speciesData.varieties || [];
  const baseName = speciesData.name;

  const formPromises = varieties
    .filter((v: any) => !v.is_default)
    .slice(0, 4)
    .map(async (v: any) => {
      try {
        const formRes = await fetch(v.pokemon.url);
        const formData = await formRes.json();
        const formName = v.pokemon.name.replace(`${baseName}-`, "");
        let category: "mega" | "gmax" | "other" = "other";
        if (formName.includes("mega")) category = "mega";
        if (formName.includes("gmax")) category = "gmax";

        // Filter: Only show forms available in Pokémon GO
        if (category === "gmax" && !goGmaxAvailable.has(baseName)) return null;
        if (category === "mega" && !goMegaAvailable.has(baseName)) return null;

        return {
          name: v.pokemon.name,
          formName: formName.replace(/-/g, " "),
          sprite: formData.sprites?.other?.["official-artwork"]?.front_default || formData.sprites?.front_default || "",
          types: formData.types.map((t: any) => t.type.name),
          category,
        };
      } catch {
        return null;
      }
    });

  const formResults = await Promise.all(formPromises);
  formResults.forEach(f => { if (f) specialForms.push(f); });

  const evoRes = await fetch(speciesData.evolution_chain.url);
  if (!evoRes.ok) throw new Error("Evolution chain not found");
  const evoData = await evoRes.json();
  const parsed = parseChain(evoData.chain);

  const stagePromises = parsed.map(async (stage) => {
    try {
      const pokRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${stage.name}`);
      const pokData = await pokRes.json();
      return {
        ...stage,
        id: pokData.id,
        sprite: pokData.sprites?.other?.["official-artwork"]?.front_default || pokData.sprites?.front_default || "",
        types: pokData.types.map((t: any) => t.type.name),
      } as EvoStage;
    } catch {
      return { ...stage, id: 0, sprite: "", types: [] } as EvoStage;
    }
  });

  const chain = await Promise.all(stagePromises);
  return { chain, specialForms };
}

type Props = {
  pokemonId: number;
  pokemonName: string;
  onSelectPokemon?: (name: string) => void;
};

const EvolutionChain = ({ pokemonId, pokemonName, onSelectPokemon }: Props) => {
  const [data, setData] = useState<EvolutionChainData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchEvolutionChain(pokemonId)
      .then(d => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pokemonId]);

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
        <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3">Evolution Chain</h4>
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || (data.chain.length <= 1 && data.specialForms.length === 0)) {
    return null;
  }

  const megaForms = data.specialForms.filter(f => f.category === "mega");

  return (
    <div className="space-y-4">
      {data.chain.length > 1 && (
        <div className="p-4 rounded-2xl bg-card-gradient border border-border shadow-card">
          <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-4">Evolution Chain</h4>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {data.chain.map((stage, i) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-2"
              >
                {i > 0 && (
                  <div className="flex flex-col items-center mx-1">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span className="text-[9px] text-muted-foreground font-body text-center max-w-16 leading-tight">
                      {stage.minLevel ? `Lv. ${stage.minLevel}` : stage.item ? stage.item : stage.trigger === "trade" ? "Trade" : ""}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => onSelectPokemon?.(stage.name)}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer ${
                    stage.name === pokemonName
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/40 hover:scale-105"
                  }`}
                  title={`View ${stage.name}`}
                >
                  {stage.sprite && (
                    <img src={stage.sprite} alt={stage.name} className="w-16 h-16 object-contain" loading="lazy" />
                  )}
                  <span className="text-[11px] font-body text-foreground capitalize mt-1 font-medium">{stage.name}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {stage.types.map(t => <TypeBadge key={t} type={t} />)}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {megaForms.length > 0 && (
        <div className="p-4 rounded-2xl bg-card-gradient border border-[hsl(var(--mega))]/30 shadow-card">
          <h4 className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--mega))]" /> Mega Evolution{megaForms.length > 1 ? "s" : ""} (Pokémon GO)
          </h4>
          <div className="flex flex-wrap gap-4 justify-center">
            {megaForms.map((form, i) => (
              <motion.div
                key={form.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center p-3 rounded-xl bg-[hsl(var(--mega))]/5 border border-[hsl(var(--mega))]/20"
              >
                {form.sprite && (
                  <img src={form.sprite} alt={form.formName} className="w-20 h-20 object-contain" loading="lazy" />
                )}
                <span className="text-[11px] font-body text-foreground capitalize mt-1 font-semibold">{form.formName}</span>
                <div className="flex gap-0.5 mt-1">
                  {form.types.map(t => <TypeBadge key={t} type={t} />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvolutionChain;
