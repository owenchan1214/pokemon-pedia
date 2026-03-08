import { motion } from "framer-motion";
import { Copy, Check, Gift } from "lucide-react";
import { useState } from "react";

const codes = [
  { code: "TH4NKY0UF41RYMUCH", reward: "Very Fairy Timed Research", expires: "No expiry listed", active: true },
  { code: "FENDIxFRGMTxPOKEMON", reward: "FENDI×FRGMT×POKÉMON avatar hoodie", expires: "No expiry listed", active: true },
  { code: "GOTOURKALOS", reward: "GO Tour Kalos Timed Research", expires: "Expired", active: false },
];

const CodesSection = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="codes" className="py-20 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Promo Codes</h2>
          <p className="text-muted-foreground font-body">Redeem these codes in-game for free items</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
          {codes.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-5 rounded-xl border shadow-card ${
                c.active
                  ? "bg-card-gradient border-primary/30 hover:border-primary/60"
                  : "bg-card/50 border-border opacity-60"
              } transition-colors`}
            >
              <Gift className={`w-5 h-5 mb-3 ${c.active ? "text-primary" : "text-muted-foreground"}`} />
              <p className="font-body font-semibold text-foreground mb-1 text-sm">{c.reward}</p>
              <div className="flex items-center gap-2 mt-3">
                <code className="flex-1 text-xs font-mono bg-muted/50 px-3 py-2 rounded border border-border truncate">
                  {c.code}
                </code>
                {c.active && (
                  <button
                    onClick={() => handleCopy(c.code, i)}
                    className="p-2 rounded-md bg-muted hover:bg-primary/20 transition-colors"
                  >
                    {copiedIndex === i ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
              <p className={`text-xs mt-2 font-body ${c.active ? "text-primary/80" : "text-destructive/80"}`}>
                {c.expires}
              </p>
              {!c.active && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-body font-bold bg-destructive/20 text-destructive">
                  EXPIRED
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground font-body mt-6">
          💡 Redeem at <span className="text-secondary">Settings → Offer Redemption</span> in the Pokémon GO app, or via{" "}
          <a href="https://rewards.nianticlabs.com/pokemongo" target="_blank" rel="noopener" className="text-secondary underline">
            rewards.nianticlabs.com
          </a>
        </p>
      </div>
    </section>
  );
};

export default CodesSection;
