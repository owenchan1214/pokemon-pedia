import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Gift, AlertTriangle, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

type PromoCode = {
  code: string;
  reward: string;
  expires?: string;
  active: boolean;
  source?: string;
};

const defaultCodes: PromoCode[] = [
  { code: "FENDIxFRGMTxPOKEMON", reward: "FENDI × FRGMT × POKÉMON avatar hoodie", expires: "Active (no expiry)", active: true },
  { code: "LRQEV2VZ59UDA", reward: "Verizon outfit (mask, jacket, backpack)", expires: "Long-lived", active: true },
  { code: "GOTOURKALOS", reward: "GO Tour: Kalos starter Timed Research", expires: "Expired Mar 2", active: false },
  { code: "QFWM3SRJPVRY5", reward: "Timed Research for Unown X", expires: "Expired Mar 1", active: false },
  { code: "2PKXPAT2RJXKL", reward: "Timed Research for Unown Y", expires: "Expired Mar 1", active: false },
  { code: "TH4NKY0UF41RYMUCH", reward: "Very Fairy Timed Research (Sylveon)", expires: "Expired Mar 1", active: false },
  { code: "6K343X373BDQM", reward: "Timed Research for Unown Y / ZA", expires: "Expired", active: false },
];

const CodesSection = () => {
  const { t } = useI18n();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [codes, setCodes] = useState<PromoCode[]>(defaultCodes);
  const [isFetching, setIsFetching] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAutoFetch = useCallback(async () => {
    setIsFetching(true);
    setScanResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-promo-codes");
      if (error) throw error;

      if (data?.success && data.codes?.length > 0) {
        const scrapedCodes: PromoCode[] = data.codes.map((c: any) => ({
          code: c.code,
          reward: c.reward || "Promo reward",
          expires: c.active ? "Active" : "Expired",
          active: c.active,
          source: c.source,
        }));

        // Merge: keep existing + add new ones
        const existingKeys = new Set(codes.map((c) => c.code.toUpperCase()));
        const newCodes = scrapedCodes.filter((c) => !existingKeys.has(c.code.toUpperCase()));

        if (newCodes.length > 0) {
          setCodes((prev) => [...newCodes, ...prev]);
          setScanResult(`${newCodes.length} ${t("codes.found")}`);
        } else {
          setScanResult(t("codes.no_new"));
        }
        setLastScan(new Date().toLocaleTimeString());
      } else {
        setScanResult(t("codes.no_new"));
        setLastScan(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Auto-fetch error:", err);
      setScanResult("Error fetching codes");
    } finally {
      setIsFetching(false);
    }
  }, [codes, t]);

  const activeCodes = codes.filter((c) => c.active);
  const expiredCodes = codes.filter((c) => !c.active);

  return (
    <section id="codes" className="py-20 bg-card/40">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">{t("codes.title")}</h2>
            <p className="text-muted-foreground font-body">{t("codes.subtitle")} · Updated March 2026</p>
          </div>
          <div className="flex items-center gap-3">
            {lastScan && (
              <span className="text-xs text-muted-foreground font-body">
                {t("codes.last_scan")}: {lastScan}
              </span>
            )}
            <button
              onClick={handleAutoFetch}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary text-sm font-body font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isFetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("codes.fetching")}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {t("codes.fetch")}
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Scan result feedback */}
        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 rounded-xl bg-primary/10 border border-primary/25 text-sm font-body text-primary max-w-5xl"
            >
              {scanResult}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active codes */}
        {activeCodes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-body font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> {t("codes.active")}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
              {activeCodes.map((c, i) => {
                const globalIdx = codes.indexOf(c);
                return (
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
                        onClick={() => handleCopy(c.code, globalIdx)}
                        className="p-2 rounded-lg bg-muted hover:bg-primary/15 transition-colors cursor-pointer"
                      >
                        {copiedIndex === globalIdx ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs font-body text-primary/80">{c.expires}</p>
                      {c.source && (
                        <span className="text-[10px] font-body text-muted-foreground">
                          {t("codes.source")}: {c.source}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Low code notice */}
        <div className="mb-6 p-4 rounded-2xl bg-muted/40 border border-border max-w-5xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground font-body">{t("codes.notice")}</p>
        </div>

        {/* Expired codes */}
        {expiredCodes.length > 0 && (
          <div>
            <h3 className="text-sm font-body font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("codes.expired")}</h3>
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
          💡 {t("codes.redeem")} <span className="text-secondary">Settings → Offer Redemption</span> {t("codes.or_via")}{" "}
          <a href="https://rewards.nianticlabs.com/pokemongo" target="_blank" rel="noopener" className="text-secondary underline inline-flex items-center gap-1">
            rewards.nianticlabs.com <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </section>
  );
};

export default CodesSection;
