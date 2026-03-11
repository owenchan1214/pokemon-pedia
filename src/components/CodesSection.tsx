import { motion } from "framer-motion";
import { Copy, Check, Gift, AlertTriangle } from "lucide-react";
import { useState } from "react";

const codes = [
  { code: "FENDIxFRGMTxPOKEMON", reward: "FENDI × FRGMT × POKÉMON hoodie (avatar item)", expires: "Active", active: true },
  { code: "LRQEV2VZ59UDA", reward: "Verizon outfit (mask, jacket, backpack)", expires: "Long-lived", active: true },
  { code: "QFWM3SRJPVRY5", reward: "Timed Research for Unown X", expires: "Expired Mar 1", active: false },
  { code: "2PKXPAT2RJXKL", reward: "Timed Research for Unown Y", expires: "Expired Mar 1", active: false },
  { code: "GOTOURKALOS", reward: "GO Tour: Kalos starter Timed Research", expires: "Expired Mar 2", active: false },
  { code: "TH4NKY0UF41RYMUCH", reward: "Very Fairy Timed Research (Sylveon)", expires: "Expired Mar 1", active: false },
  { code: "6K343X373BDQM", reward: "Timed Research for Unown Y / ZA", expires: "Expired", active: false },
];

const CodesSection = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const activeCodes = codes.filter(c => c.active);
  const expiredCodes = codes.filter(c => !c.active);

  return (
    <section id="codes" className="py-20 bg-card/40">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Promo Codes</h2>
          <p className="text-muted-foreground font-body">Redeem these codes in-game for free items · Updated March 2026</p>
        </motion.div>

        {/* Active codes */}
        {activeCodes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-body font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Active Codes
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
              {activeCodes.map((c, i) => (
                <motion.div
                  key={c.code}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="relative p-5 rounded-2xl border shadow-card bg-card-gradient border-primary/25 hover:border-primary/50 transition-colors"
                >
                  <Gift className="w-5 h-5 mb-3 text-primary" />
                  <p className="font-body font-semibold text-foreground mb-1 text-sm">{c.reward}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <code className="flex-1 text-xs font-mono bg-muted/60 px-3 py-2 rounded-lg border border-border truncate">
                      {c.code}
                    </code>
                    <button
                      onClick={() => handleCopy(c.code, codes.indexOf(c))}
                      className="p-2 rounded-lg bg-muted hover:bg-primary/15 transition-colors cursor-pointer"
                    >
                      {copiedIndex === codes.indexOf(c) ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs mt-2 font-body text-primary/80">{c.expires}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Low code notice */}
        <div className="mb-6 p-4 rounded-2xl bg-muted/40 border border-border max-w-5xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground font-body">
            Most March 2026 codes have expired. New codes are typically released during events, Community Days, and Pokémon Presents. Check back regularly!
          </p>
        </div>

        {/* Expired codes */}
        {expiredCodes.length > 0 && (
          <div>
            <h3 className="text-sm font-body font-semibold text-muted-foreground uppercase tracking-wider mb-4">Recently Expired</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl">
              {expiredCodes.map((c, i) => (
                <motion.div
                  key={c.code}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="relative p-5 rounded-2xl border shadow-card bg-muted/40 border-border opacity-60 transition-colors"
                >
                  <Gift className="w-5 h-5 mb-3 text-muted-foreground" />
                  <p className="font-body font-semibold text-foreground mb-1 text-sm">{c.reward}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <code className="flex-1 text-xs font-mono bg-muted/60 px-3 py-2 rounded-lg border border-border truncate">
                      {c.code}
                    </code>
                  </div>
                  <p className="text-xs mt-2 font-body text-destructive/80">{c.expires}</p>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-body font-bold bg-destructive/15 text-destructive">
                    EXPIRED
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

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
