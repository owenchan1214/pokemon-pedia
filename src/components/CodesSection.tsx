import { motion } from "framer-motion";
import { Copy, Check, Gift, AlertTriangle, ExternalLink, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

type PromoCode = {
  code: string;
  reward: string;
  expires?: string;
  active: boolean;
  source?: string;
};

const CodesSection = () => {
  const { t } = useI18n();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('code, reward, source, active, expires, updated_at')
        .order('active', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Find the most recent updated_at
        const mostRecent = data.reduce((latest: string, c: any) => 
          c.updated_at > latest ? c.updated_at : latest, data[0].updated_at);
        setLastUpdated(mostRecent);

        setCodes(data.map((c: any) => ({
          code: c.code,
          reward: c.reward || 'Promo reward',
          expires: c.expires || (c.active ? 'Active' : 'Expired'),
          active: c.active,
          source: c.source,
        })));
      }
    } catch (err) {
      console.error('Error loading codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const activeCodes = codes.filter((c) => c.active);
  const expiredCodes = codes.filter((c) => !c.active);

  return (
    <section id="codes" className="py-20 bg-card/40">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">{t("codes.title")}</h2>
          <p className="text-muted-foreground font-body">{t("codes.subtitle")} · {t("codes.auto_updated")}</p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground/70 font-body mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {t("codes.last_updated")}: {new Date(lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </motion.div>

        {isLoading && (
          <div className="mb-6 text-sm text-muted-foreground font-body">{t("codes.loading") || "Loading codes..."}</div>
        )}

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
