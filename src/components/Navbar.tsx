import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Globe } from "lucide-react";
import { useI18n, LANGUAGES } from "@/lib/i18n";

const navKeys = [
  { href: "#events", key: "nav.events" },
  { href: "#codes", key: "nav.codes" },
  { href: "#raids", key: "nav.raids" },
  { href: "#typechart", key: "nav.types" },
  { href: "#pokedex", key: "nav.pokedex" },
  { href: "#raidcounter", key: "nav.counters" },
  { href: "#movecalc", key: "nav.moves" },
  { href: "#ivcalc", key: "nav.ivcalc" },
  { href: "#pvp", key: "nav.pvp" },
  { href: "#teambuilder", key: "nav.team" },
  { href: "#compare", key: "nav.compare" },
  { href: "#buddycalc", key: "nav.buddy" },
  { href: "#spawns", key: "nav.spawns" },
  { href: "#shinyodds", key: "nav.shiny" },
  { href: "#luckytrade", key: "nav.trades" },
  { href: "#checklist", key: "nav.checklist" },
  { href: "#leaderboard", key: "nav.leaderboard" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang, t } = useI18n();
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDark(true);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === lang);

  return (
    <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border">
      <div className="container px-4 flex items-center justify-between h-14">
        <a href="#" className="font-display text-lg text-gradient-gold">
          PGO HUB
        </a>
        <div className="hidden md:flex items-center gap-6">
          {navKeys.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-body text-muted-foreground hover:text-primary transition-colors">
              {t(l.key)}
            </a>
          ))}

          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-body text-muted-foreground">{currentLang?.flag}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-body hover:bg-primary/10 transition-colors cursor-pointer ${
                      lang === l.code ? "text-primary bg-primary/5" : "text-foreground"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
            {dark ? <Sun className="w-4 h-4 text-shiny" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          {/* Mobile language picker */}
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-body hover:bg-primary/10 transition-colors cursor-pointer ${
                      lang === l.code ? "text-primary bg-primary/5" : "text-foreground"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
            {dark ? <Sun className="w-4 h-4 text-shiny" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button className="p-2 cursor-pointer" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          {navKeys.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-body text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              {t(l.key)}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
