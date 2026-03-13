import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Language = "en" | "es" | "fr" | "de" | "ja";

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.events": "Events",
    "nav.codes": "Codes",
    "nav.raids": "Raids",
    "nav.types": "Types",
    "nav.pokedex": "Pokédex",
    "nav.counters": "Counters",
    "nav.moves": "Moves",
    "nav.ivcalc": "IV Calc",
    "nav.pvp": "PvP",
    "nav.team": "Team",
    "nav.compare": "Compare",
    "nav.buddy": "Buddy",
    "nav.spawns": "Spawns",
    "nav.shiny": "Shiny",
    "nav.trades": "Trades",
    "nav.checklist": "Checklist",
    "nav.leaderboard": "Leaderboard",
    "codes.title": "Promo Codes",
    "codes.subtitle": "Redeem these codes in-game for free items",
    "codes.active": "Active Codes",
    "codes.expired": "Recently Expired",
    "codes.fetch": "Auto-fetch latest codes",
    "codes.fetching": "Scanning code sites…",
    "codes.copied": "Copied!",
    "codes.notice": "Most March 2026 codes have expired. New codes are typically released during events, Community Days, and Pokémon Presents. Check back regularly!",
    "codes.redeem": "Redeem at",
    "codes.or_via": "in the Pokémon GO app, or via",
    "codes.source": "Source",
    "codes.no_new": "No new codes found",
    "codes.found": "codes found",
    "codes.last_scan": "Last scan",
    "codes.auto_updated": "Auto-updated every 2 days",
    "codes.loading": "Loading codes...",
  },
  es: {
    "nav.events": "Eventos",
    "nav.codes": "Códigos",
    "nav.raids": "Incursiones",
    "nav.types": "Tipos",
    "nav.pokedex": "Pokédex",
    "nav.counters": "Contadores",
    "nav.moves": "Movimientos",
    "nav.ivcalc": "Calc IV",
    "nav.pvp": "PvP",
    "nav.team": "Equipo",
    "nav.compare": "Comparar",
    "nav.buddy": "Compañero",
    "nav.spawns": "Apariciones",
    "nav.shiny": "Shiny",
    "nav.trades": "Intercambios",
    "nav.checklist": "Lista",
    "nav.leaderboard": "Clasificación",
    "codes.title": "Códigos Promocionales",
    "codes.subtitle": "Canjea estos códigos en el juego por artículos gratis",
    "codes.active": "Códigos Activos",
    "codes.expired": "Expirados Recientemente",
    "codes.fetch": "Buscar códigos nuevos",
    "codes.fetching": "Escaneando sitios…",
    "codes.copied": "¡Copiado!",
    "codes.notice": "La mayoría de los códigos de marzo 2026 han expirado. Los nuevos códigos se lanzan durante eventos y Días de la Comunidad.",
    "codes.redeem": "Canjear en",
    "codes.or_via": "en la app de Pokémon GO, o en",
    "codes.source": "Fuente",
    "codes.no_new": "No se encontraron códigos nuevos",
    "codes.found": "códigos encontrados",
    "codes.last_scan": "Último escaneo",
    "codes.auto_updated": "Actualizado automáticamente cada 2 días",
    "codes.loading": "Cargando códigos...",
  },
  fr: {
    "nav.events": "Événements",
    "nav.codes": "Codes",
    "nav.raids": "Raids",
    "nav.types": "Types",
    "nav.pokedex": "Pokédex",
    "nav.counters": "Compteurs",
    "nav.moves": "Attaques",
    "nav.ivcalc": "Calc IV",
    "nav.pvp": "PvP",
    "nav.team": "Équipe",
    "nav.compare": "Comparer",
    "nav.buddy": "Copain",
    "nav.spawns": "Apparitions",
    "nav.shiny": "Shiny",
    "nav.trades": "Échanges",
    "nav.checklist": "Liste",
    "nav.leaderboard": "Classement",
    "codes.title": "Codes Promo",
    "codes.subtitle": "Échangez ces codes en jeu pour des objets gratuits",
    "codes.active": "Codes Actifs",
    "codes.expired": "Récemment Expirés",
    "codes.fetch": "Rechercher de nouveaux codes",
    "codes.fetching": "Scan des sites en cours…",
    "codes.copied": "Copié !",
    "codes.notice": "La plupart des codes de mars 2026 ont expiré. De nouveaux codes sont publiés lors des événements et Journées Communauté.",
    "codes.redeem": "Échanger dans",
    "codes.or_via": "dans l'appli Pokémon GO, ou sur",
    "codes.source": "Source",
    "codes.no_new": "Aucun nouveau code trouvé",
    "codes.found": "codes trouvés",
    "codes.last_scan": "Dernier scan",
    "codes.auto_updated": "Mis à jour automatiquement tous les 2 jours",
    "codes.loading": "Chargement des codes...",
  },
  de: {
    "nav.events": "Events",
    "nav.codes": "Codes",
    "nav.raids": "Raids",
    "nav.types": "Typen",
    "nav.pokedex": "Pokédex",
    "nav.counters": "Konter",
    "nav.moves": "Attacken",
    "nav.ivcalc": "IV-Rechner",
    "nav.pvp": "PvP",
    "nav.team": "Team",
    "nav.compare": "Vergleich",
    "nav.buddy": "Kumpel",
    "nav.spawns": "Spawns",
    "nav.shiny": "Shiny",
    "nav.trades": "Tausche",
    "nav.checklist": "Checkliste",
    "nav.leaderboard": "Rangliste",
    "codes.title": "Promo-Codes",
    "codes.subtitle": "Löse diese Codes im Spiel ein für kostenlose Items",
    "codes.active": "Aktive Codes",
    "codes.expired": "Kürzlich Abgelaufen",
    "codes.fetch": "Neue Codes suchen",
    "codes.fetching": "Seiten werden gescannt…",
    "codes.copied": "Kopiert!",
    "codes.notice": "Die meisten Codes vom März 2026 sind abgelaufen. Neue Codes werden bei Events und Community Days veröffentlicht.",
    "codes.redeem": "Einlösen unter",
    "codes.or_via": "in der Pokémon GO App, oder über",
    "codes.source": "Quelle",
    "codes.no_new": "Keine neuen Codes gefunden",
    "codes.found": "Codes gefunden",
    "codes.last_scan": "Letzter Scan",
  },
  ja: {
    "nav.events": "イベント",
    "nav.codes": "コード",
    "nav.raids": "レイド",
    "nav.types": "タイプ",
    "nav.pokedex": "図鑑",
    "nav.counters": "カウンター",
    "nav.moves": "技",
    "nav.ivcalc": "個体値計算",
    "nav.pvp": "PvP",
    "nav.team": "チーム",
    "nav.compare": "比較",
    "nav.buddy": "相棒",
    "nav.spawns": "出現",
    "nav.shiny": "色違い",
    "nav.trades": "交換",
    "nav.checklist": "チェック",
    "nav.leaderboard": "ランキング",
    "codes.title": "プロモコード",
    "codes.subtitle": "ゲーム内でコードを入力して無料アイテムをゲット",
    "codes.active": "有効なコード",
    "codes.expired": "最近期限切れ",
    "codes.fetch": "最新コードを検索",
    "codes.fetching": "サイトをスキャン中…",
    "codes.copied": "コピーしました！",
    "codes.notice": "2026年3月のコードはほとんど期限切れです。新しいコードはイベントやコミュニティ・デイで公開されます。",
    "codes.redeem": "引き換え場所",
    "codes.or_via": "Pokémon GOアプリ内、または",
    "codes.source": "ソース",
    "codes.no_new": "新しいコードは見つかりませんでした",
    "codes.found": "件のコードが見つかりました",
    "codes.last_scan": "最終スキャン",
  },
};

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("pgo-lang") as Language) || "en";
    }
    return "en";
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem("pgo-lang", l);
  }, []);

  const t = useCallback(
    (key: string) => translations[lang]?.[key] || translations.en[key] || key,
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
