import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";

const links = [
  { href: "#events", label: "Events" },
  { href: "#codes", label: "Codes" },
  { href: "#raids", label: "Raids" },
  { href: "#typechart", label: "Types" },
  { href: "#pvp", label: "PvP" },
  { href: "#leaderboard", label: "Leaderboard" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
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

  return (
    <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border">
      <div className="container px-4 flex items-center justify-between h-14">
        <a href="#" className="font-display text-lg text-gradient-gold">
          PGO HUB
        </a>
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-body text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
          <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-muted transition-colors">
            {dark ? <Sun className="w-4 h-4 text-shiny" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-muted transition-colors">
            {dark ? <Sun className="w-4 h-4 text-shiny" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button className="p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-body text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
