import { motion } from "framer-motion";
import { useState } from "react";

const types = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
];

const typeColors: Record<string, string> = {
  Normal: "bg-[hsl(60,10%,55%)]", Fire: "bg-[hsl(15,80%,50%)]", Water: "bg-[hsl(220,70%,55%)]",
  Electric: "bg-[hsl(48,90%,50%)]", Grass: "bg-[hsl(100,55%,45%)]", Ice: "bg-[hsl(185,60%,60%)]",
  Fighting: "bg-[hsl(2,65%,42%)]", Poison: "bg-[hsl(280,55%,45%)]", Ground: "bg-[hsl(40,55%,50%)]",
  Flying: "bg-[hsl(255,55%,65%)]", Psychic: "bg-[hsl(340,70%,55%)]", Bug: "bg-[hsl(75,65%,40%)]",
  Rock: "bg-[hsl(45,45%,40%)]", Ghost: "bg-[hsl(265,35%,40%)]", Dragon: "bg-[hsl(260,70%,50%)]",
  Dark: "bg-[hsl(25,25%,32%)]", Steel: "bg-[hsl(220,15%,60%)]", Fairy: "bg-[hsl(330,50%,65%)]",
};

// Effectiveness: attacker (row) vs defender (col)
// 2 = super effective, 0.5 = not very effective, 0 = no effect, 1 = normal
const chart: Record<string, Record<string, number>> = {
  Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground:   { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying:   { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy:    { Fire: 0.5, Poison: 0.5, Fighting: 2, Dragon: 2, Dark: 2, Steel: 0.5 },
};

const getEffectiveness = (attacker: string, defender: string): number => {
  return chart[attacker]?.[defender] ?? 1;
};

const cellStyle = (val: number) => {
  if (val === 2) return "bg-primary/80 text-primary-foreground font-bold";
  if (val === 0.5) return "bg-destructive/30 text-foreground";
  if (val === 0) return "bg-foreground/10 text-muted-foreground line-through";
  return "text-muted-foreground/40";
};

const cellText = (val: number) => {
  if (val === 2) return "2×";
  if (val === 0.5) return "½";
  if (val === 0) return "0";
  return "";
};

const TypeChartSection = () => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  return (
    <section id="typechart" className="py-20 bg-card/40">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Type Effectiveness</h2>
          <p className="text-muted-foreground font-body">Attack type (row) vs Defender type (column)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="overflow-x-auto rounded-2xl border border-border shadow-card bg-card-gradient"
        >
          <table className="min-w-[700px] w-full text-[10px] sm:text-xs font-body">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card p-1 sm:p-2 font-display text-muted-foreground text-[10px]">ATK ↓ / DEF →</th>
                {types.map(t => (
                  <th
                    key={t}
                    className={`p-1 sm:p-2 text-center cursor-pointer transition-opacity ${hoveredType && hoveredType !== t ? "opacity-40" : ""}`}
                    onMouseEnter={() => setHoveredType(t)}
                    onMouseLeave={() => setHoveredType(null)}
                  >
                    <span className={`inline-block px-1 py-0.5 rounded text-[9px] sm:text-[10px] text-white font-semibold ${typeColors[t]}`}>
                      {t.slice(0, 3).toUpperCase()}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {types.map(attacker => (
                <tr
                  key={attacker}
                  className={`transition-opacity ${hoveredType && hoveredType !== attacker ? "opacity-60" : ""}`}
                  onMouseEnter={() => setHoveredType(attacker)}
                  onMouseLeave={() => setHoveredType(null)}
                >
                  <td className="sticky left-0 z-10 bg-card p-1 sm:p-2 font-semibold whitespace-nowrap">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] text-white font-semibold ${typeColors[attacker]}`}>
                      {attacker.slice(0, 3).toUpperCase()}
                    </span>
                  </td>
                  {types.map(defender => {
                    const val = getEffectiveness(attacker, defender);
                    return (
                      <td
                        key={defender}
                        className={`p-1 sm:p-2 text-center rounded-sm ${cellStyle(val)}`}
                      >
                        {cellText(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <div className="flex flex-wrap gap-4 mt-6 text-xs font-body text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-primary/80" /> 2× Super Effective</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-destructive/30" /> ½ Not Very Effective</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-foreground/10" /> 0 No Effect</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded border border-border" /> 1× Normal</span>
        </div>
      </div>
    </section>
  );
};

export default TypeChartSection;
