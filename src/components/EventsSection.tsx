import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Star, Bug, Flame, Swords, Search, ChevronDown, Gift, Sparkles, List, CalendarDays, Filter, ChevronLeft, ChevronRight, Bell, BellOff, BellRing } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

interface EventDetails {
  description: string;
  bonuses: string[];
  spawns: string[];
  raids: string[];
  exclusiveMoves?: string[];
}

interface GameEvent {
  date: string;
  name: string;
  icon: React.ElementType;
  tag: string;
  tagColor: string;
  end: Date;
  start: Date;
  details: EventDetails;
}

const events: GameEvent[] = [
  // === MARCH 2026 ===
  {
    date: "Mar 3 – 9", name: "Pokémon 30th Anniversary Event", icon: Star,
    tag: "Live", tagColor: "bg-primary/15 text-primary",
    start: new Date("2026-03-03"), end: new Date("2026-03-09T20:00:00"),
    details: {
      description: "Celebrate 30 years of Pokémon! Nearly every species that has appeared in GO is available in the wild, eggs, and raids.",
      bonuses: ["2× Catch XP", "Special 30th Anniversary Field Research", "Kanto-themed Collection Challenge"],
      spawns: ["Pikachu (Party Hat)", "Bulbasaur", "Charmander", "Squirtle", "Eevee", "All starters"],
      raids: ["Mewtwo (Tier 5)", "Charizard (Tier 3)", "Blastoise (Tier 3)"],
    }
  },
  {
    date: "Mar 7 – 9", name: "30th Anniversary: All Out", icon: Star,
    tag: "Live", tagColor: "bg-primary/15 text-primary",
    start: new Date("2026-03-07"), end: new Date("2026-03-09T20:00:00"),
    details: {
      description: "The grand finale weekend of the 30th Anniversary — all Mega Raids unlocked, boosted shiny rates, and special Timed Research.",
      bonuses: ["Boosted shiny rates for all starters", "All Mega Raids available", "Free Timed Research with rare rewards"],
      spawns: ["All starter Pokémon (all gens)", "Pikachu (Anniversary)", "Rare wild spawns increased"],
      raids: ["All Mega Evolutions available", "Primal Kyogre & Groudon return"],
    }
  },
  {
    date: "Mar 10 – 16", name: "Nature Week", icon: Calendar,
    tag: "Event", tagColor: "bg-secondary/15 text-secondary",
    start: new Date("2026-03-10"), end: new Date("2026-03-16T20:00:00"),
    details: {
      description: "A celebration of Grass, Bug, and Ground-type Pokémon with boosted spawns in parks and nature areas.",
      bonuses: ["2× Buddy Candy in parks", "New Field Research tasks", "Plant-themed avatar items"],
      spawns: ["Oddish", "Bellsprout", "Cottonee", "Petilil", "Fomantis"],
      raids: ["Virizion (Tier 5)", "Torterra (Tier 3)"],
    }
  },
  {
    date: "Mar 14, 2–5 PM", name: "Scorbunny Community Day", icon: Flame,
    tag: "Community Day", tagColor: "bg-accent/15 text-accent",
    start: new Date("2026-03-14"), end: new Date("2026-03-14T17:00:00"),
    details: {
      description: "Scorbunny takes the spotlight! Evolve Raboot into Cinderace during the event (or up to 5 hours after) to get exclusive moves.",
      bonuses: ["2× Catch Candy", "2× Candy XL (Lv.31+)", "¼ Egg Hatch Distance", "3-hour Incense & Lure duration"],
      spawns: ["Scorbunny (massively boosted)", "Shiny Scorbunny (~1/25 rate)"],
      raids: ["Raboot (Tier 1)", "Cinderace (Tier 4)"],
      exclusiveMoves: ["Blast Burn (Charged)", "Pyro Ball (Charged)"],
    }
  },
  {
    date: "Mar 17 – 23", name: "Bug Out Event (Gen 8 Debuts!)", icon: Bug,
    tag: "Event", tagColor: "bg-secondary/15 text-secondary",
    start: new Date("2026-03-17"), end: new Date("2026-03-23T20:00:00"),
    details: {
      description: "Gen 8 Bug-types debut in Pokémon GO! Blipbug, Dottler & Orbeetle arrive alongside boosted Bug-type spawns.",
      bonuses: ["2× XP for Nice/Great/Excellent throws", "Boosted shiny Paras, Combee & Cutiefly on Lures", "New Bug-type Collection Challenge"],
      spawns: ["Blipbug (NEW)", "Dottler (NEW)", "Snom", "Joltik", "Grubbin", "Wimpod"],
      raids: ["Orbeetle (Tier 3, NEW)", "Vikavolt (Tier 3)", "Genesect (Tier 5)"],
    }
  },
  {
    date: "Mar 21", name: "Research Day", icon: Search,
    tag: "Research", tagColor: "bg-legendary/15 text-legendary",
    start: new Date("2026-03-21"), end: new Date("2026-03-21T20:00:00"),
    details: {
      description: "Complete special Field Research tasks from PokéStops for encounters with rare Pokémon and exclusive rewards.",
      bonuses: ["Exclusive Field Research from all PokéStops", "Boosted shiny chance on Research encounters", "5 bonus daily Research task limit"],
      spawns: ["Research-exclusive encounters (TBA)", "Rare candy bundles from tasks"],
      raids: ["Standard raid pool"],
    }
  },
  {
    date: "Mar 28", name: "Max Battle Day", icon: Swords,
    tag: "Battle", tagColor: "bg-accent/15 text-accent",
    start: new Date("2026-03-28"), end: new Date("2026-03-28T19:00:00"),
    details: {
      description: "A day dedicated to Max Battles! Earn boosted rewards from Max Raid-style encounters at Power Spots.",
      bonuses: ["3× Max Particles earned", "Boosted Max Move rewards", "Bonus Raid Passes from spinning gyms"],
      spawns: ["Dynamax-capable Pokémon near Power Spots"],
      raids: ["Max Raid bosses with boosted rewards", "Gigantamax Pokémon encounters"],
    }
  },
  {
    date: "Mar 31 – Apr 6", name: "Spring into Spring Event", icon: Calendar,
    tag: "Event", tagColor: "bg-secondary/15 text-secondary",
    start: new Date("2026-03-31"), end: new Date("2026-04-06T20:00:00"),
    details: {
      description: "Celebrate the start of spring with flower-crowned Pokémon, egg-themed bonuses, and seasonal spawns.",
      bonuses: ["½ Egg Hatch Distance", "2× Hatch Candy", "Spring-themed avatar items"],
      spawns: ["Flower Crown Eevee", "Flower Crown Chansey", "Cherubi", "Deerling (Spring)"],
      raids: ["Mega Lopunny (Mega Raid)", "Togekiss (Tier 3)"],
    }
  },
  // === APRIL 2026 ===
  {
    date: "Apr 4, 2–5 PM", name: "Sobble Community Day", icon: Calendar,
    tag: "Community Day", tagColor: "bg-accent/15 text-accent",
    start: new Date("2026-04-04"), end: new Date("2026-04-04T17:00:00"),
    details: {
      description: "Sobble takes center stage! Evolve Drizzile into Inteleon during or up to 5 hours after the event to get an exclusive move.",
      bonuses: ["2× Catch Candy", "2× Candy XL (Lv.31+)", "¼ Egg Hatch Distance", "3-hour Incense & Lure duration"],
      spawns: ["Sobble (massively boosted)", "Shiny Sobble (~1/25 rate)"],
      raids: ["Drizzile (Tier 1)", "Inteleon (Tier 4)"],
      exclusiveMoves: ["Hydro Cannon (Charged)"],
    }
  },
  {
    date: "Apr 7 – 13", name: "Fairy Festival", icon: Sparkles,
    tag: "Event", tagColor: "bg-secondary/15 text-secondary",
    start: new Date("2026-04-07"), end: new Date("2026-04-13T20:00:00"),
    details: {
      description: "Fairy-type Pokémon fill the wild! Clefairy, Spritzee, Swirlix and more appear with boosted shiny rates.",
      bonuses: ["2× Catch Stardust for Fairy-types", "New Fairy-themed Field Research", "Fairy avatar accessories"],
      spawns: ["Clefairy", "Spritzee", "Swirlix", "Cottonee", "Fidough (NEW)"],
      raids: ["Xerneas (Tier 5)", "Mega Gardevoir (Mega Raid)"],
    }
  },
  {
    date: "Apr 14 – 20", name: "Earth Day Cleanup Event", icon: Calendar,
    tag: "Event", tagColor: "bg-secondary/15 text-secondary",
    start: new Date("2026-04-14"), end: new Date("2026-04-20T20:00:00"),
    details: {
      description: "Celebrate Earth Day with Ground and Rock-type spawns. Bonus rewards for walking and hatching eggs.",
      bonuses: ["2× Hatch Candy", "½ Egg Hatch Distance", "Earth Day-themed Timed Research"],
      spawns: ["Sandshrew", "Geodude", "Larvitar", "Drilbur", "Nacli (NEW)"],
      raids: ["Groudon (Tier 5)", "Mega Steelix (Mega Raid)"],
    }
  },
  {
    date: "Apr 18", name: "Raid Day: Tapu Fini", icon: Swords,
    tag: "Battle", tagColor: "bg-accent/15 text-accent",
    start: new Date("2026-04-18"), end: new Date("2026-04-18T19:00:00"),
    details: {
      description: "Tapu Fini returns for a special Raid Day with boosted shiny rates and up to 5 free Raid Passes.",
      bonuses: ["5 free Raid Passes from gyms", "Boosted shiny Tapu Fini rate", "2× Raid XP"],
      spawns: ["Tapu Fini raid encounters only"],
      raids: ["Tapu Fini (Tier 5, boosted shiny)"],
    }
  },
  {
    date: "Apr 22 – 28", name: "Rivals Week", icon: Swords,
    tag: "Event", tagColor: "bg-secondary/15 text-secondary",
    start: new Date("2026-04-22"), end: new Date("2026-04-28T20:00:00"),
    details: {
      description: "Rival Pokémon pairs appear together! Zangoose & Seviper, Throh & Sawk, and more spawn worldwide.",
      bonuses: ["2× Catch XP", "Rival-themed Collection Challenge", "Team GO Rocket encounters boosted"],
      spawns: ["Zangoose", "Seviper", "Throh", "Sawk", "Heatmor", "Durant"],
      raids: ["Mega Absol (Mega Raid)", "Registeel (Tier 5)"],
    }
  },
  {
    date: "Apr 25", name: "Research Day: Unown", icon: Search,
    tag: "Research", tagColor: "bg-legendary/15 text-legendary",
    start: new Date("2026-04-25"), end: new Date("2026-04-25T20:00:00"),
    details: {
      description: "Special Research Day featuring Unown encounters from Field Research tasks. New Unown letters available!",
      bonuses: ["Exclusive Unown Field Research", "Boosted shiny Unown chance", "Bonus Research slots"],
      spawns: ["Unown (various letters)", "Sigilyph (rare)"],
      raids: ["Standard raid pool"],
    }
  },
];

const allTags = Array.from(new Set(events.map(e => e.tag)));

const tagColorMap: Record<string, string> = {
  "Live": "bg-primary/15 text-primary border-primary/30",
  "Event": "bg-secondary/15 text-secondary border-secondary/30",
  "Community Day": "bg-accent/15 text-accent border-accent/30",
  "Research": "bg-legendary/15 text-legendary border-legendary/30",
  "Battle": "bg-accent/15 text-accent border-accent/30",
  "Upcoming": "bg-muted text-muted-foreground border-border",
};

const highlights = [
  { title: "Community Day: Scorbunny", desc: "Evolve Raboot → Cinderace with Blast Burn & Pyro Ball. 2× Catch Candy, 2× Candy XL, 1/4 Egg Distance, 3h Incense.", color: "border-accent" },
  { title: "Bug Out: Gen 8 Debuts", desc: "Blipbug, Dottler & Orbeetle from Galar arrive! Boosted shiny Paras, Combee & Cutiefly on Lures.", color: "border-secondary" },
  { title: "30th Anniversary Celebration", desc: "Almost every Pokémon that has appeared in GO shows up! Kanto nostalgia with special Field Research.", color: "border-primary" },
];

const getNextEvent = () => {
  const now = new Date();
  return events.find(e => e.end > now) || events[events.length - 1];
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function getEventsForDay(day: number, month: number, year: number, filteredEvents: GameEvent[]) {
  const date = new Date(year, month, day);
  return filteredEvents.filter(e => {
    const startDay = new Date(e.start.getFullYear(), e.start.getMonth(), e.start.getDate());
    const endDay = new Date(e.end.getFullYear(), e.end.getMonth(), e.end.getDate());
    return date >= startDay && date <= endDay;
  });
}

function getTagDotColor(tag: string) {
  switch (tag) {
    case "Live": return "bg-primary";
    case "Event": return "bg-secondary";
    case "Community Day": return "bg-accent";
    case "Research": return "bg-legendary";
    case "Battle": return "bg-accent";
    case "Upcoming": return "bg-muted-foreground";
    default: return "bg-muted-foreground";
  }
}

// === Notification helpers ===
const REMINDER_KEY = "pgo-event-reminders";

function loadReminders(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(REMINDER_KEY) || "{}");
  } catch { return {}; }
}

function saveReminders(reminders: Record<string, number>) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
}

async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function scheduleNotification(event: GameEvent, reminders: Record<string, number>): Record<string, number> {
  const msUntilStart = event.start.getTime() - Date.now() - 30 * 60 * 1000; // 30 min before
  if (msUntilStart <= 0) {
    // Event already started, notify immediately
    new Notification(`🎮 ${event.name}`, { body: `This event is live now! ${event.date}`, icon: "/favicon.ico" });
    const updated = { ...reminders, [event.name]: -1 };
    saveReminders(updated);
    return updated;
  }
  const timerId = window.setTimeout(() => {
    new Notification(`🎮 ${event.name} starts in 30 minutes!`, { body: event.date, icon: "/favicon.ico" });
  }, msUntilStart);
  const updated = { ...reminders, [event.name]: timerId };
  saveReminders(updated);
  return updated;
}

function cancelReminder(eventName: string, reminders: Record<string, number>): Record<string, number> {
  const timerId = reminders[eventName];
  if (timerId && timerId > 0) window.clearTimeout(timerId);
  const updated = { ...reminders };
  delete updated[eventName];
  saveReminders(updated);
  return updated;
}

// Available months for navigation
const AVAILABLE_MONTHS = [
  { year: 2026, month: 2, label: "March 2026" },
  { year: 2026, month: 3, label: "April 2026" },
];

const EventsSection = () => {
  const nextEvent = getNextEvent();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [calMonthIdx, setCalMonthIdx] = useState(0);
  const [reminders, setReminders] = useState<Record<string, number>>(loadReminders);
  const [notifSupported, setNotifSupported] = useState(true);

  useEffect(() => {
    setNotifSupported("Notification" in window);
  }, []);

  const currentCalMonth = AVAILABLE_MONTHS[calMonthIdx];

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (activeFilters.length > 0) {
      filtered = filtered.filter(e => activeFilters.includes(e.tag));
    }
    return filtered;
  }, [activeFilters]);

  // Events for the current calendar month
  const monthEvents = useMemo(() => {
    return filteredEvents.filter(e => {
      const startMonth = e.start.getMonth();
      const endMonth = e.end.getMonth();
      const startYear = e.start.getFullYear();
      const endYear = e.end.getFullYear();
      return (
        (startYear === currentCalMonth.year && startMonth === currentCalMonth.month) ||
        (endYear === currentCalMonth.year && endMonth === currentCalMonth.month)
      );
    });
  }, [filteredEvents, calMonthIdx]);

  // Events for list view based on selected month
  const listEvents = useMemo(() => {
    if (viewMode === "list") return filteredEvents;
    return monthEvents;
  }, [filteredEvents, monthEvents, viewMode]);

  const toggleFilter = (tag: string) => {
    setActiveFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const calendarDays = getCalendarDays(currentCalMonth.year, currentCalMonth.month);
  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === currentCalMonth.year && today.getMonth() === currentCalMonth.month && today.getDate() === day;

  const selectedDayEvents = selectedCalendarDay
    ? getEventsForDay(selectedCalendarDay, currentCalMonth.month, currentCalMonth.year, filteredEvents)
    : [];

  const handleSetReminder = useCallback(async (event: GameEvent) => {
    if (reminders[event.name]) {
      setReminders(prev => cancelReminder(event.name, prev));
      return;
    }
    const granted = await requestNotificationPermission();
    if (!granted) {
      alert("Please allow notifications in your browser settings to set event reminders.");
      return;
    }
    setReminders(prev => scheduleNotification(event, prev));
  }, [reminders]);

  const switchMonth = (dir: -1 | 1) => {
    const next = calMonthIdx + dir;
    if (next >= 0 && next < AVAILABLE_MONTHS.length) {
      setCalMonthIdx(next);
      setSelectedCalendarDay(null);
    }
  };

  return (
    <section id="events" className="py-20 bg-background">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">Pokémon GO Events</h2>
          <p className="text-muted-foreground font-body">Tap any event to see full details · Set reminders with 🔔</p>
        </motion.div>

        {/* Countdown Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-6 p-6 rounded-2xl bg-card-gradient border border-primary/30 shadow-glow"
        >
          <CountdownTimer targetDate={nextEvent.end} label={`⏳ ${nextEvent.name} ends in`} />
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border w-fit">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all cursor-pointer ${
                viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => { setViewMode("calendar"); setSelectedCalendarDay(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all cursor-pointer ${
                viewMode === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {allTags.map(tag => {
              const isActive = activeFilters.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleFilter(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-body font-medium border transition-all cursor-pointer ${
                    isActive
                      ? tagColorMap[tag] || "bg-muted text-foreground border-border"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {activeFilters.length > 0 && (
              <button
                onClick={() => setActiveFilters([])}
                className="px-2 py-1 text-xs font-body text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {viewMode === "list" ? (
              <div className="space-y-3">
                {filteredEvents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground font-body">No events match selected filters</div>
                )}
                {filteredEvents.map((event, i) => {
                  const globalIndex = events.indexOf(event);
                  const isLive = event.tag === "Live" && event.end > new Date();
                  const isExpanded = expandedIndex === globalIndex;
                  const hasReminder = !!reminders[event.name];
                  return (
                    <motion.div
                      key={globalIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-2xl bg-card-gradient border transition-colors shadow-card overflow-hidden ${
                        isLive ? "border-primary/50" : isExpanded ? "border-primary/40" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <button
                        onClick={() => setExpandedIndex(isExpanded ? null : globalIndex)}
                        className="flex items-center gap-4 p-4 w-full text-left cursor-pointer"
                      >
                        <event.icon className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-semibold text-foreground truncate">{event.name}</p>
                          <p className="text-sm text-muted-foreground font-body">{event.date}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {notifSupported && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSetReminder(event); }}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${hasReminder ? "bg-primary/15 text-primary" : "hover:bg-muted text-muted-foreground"}`}
                              title={hasReminder ? "Cancel reminder" : "Set reminder (30 min before)"}
                            >
                              {hasReminder ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <CountdownTimer targetDate={event.end} label="" inline />
                          <span className={`px-3 py-1 rounded-full text-xs font-body font-medium ${event.tagColor} hidden sm:inline-flex items-center`}>
                            {isLive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse-glow" />}
                            {event.tag}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && <EventDetailPanel event={event} />}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Calendar View */
              <div className="rounded-2xl bg-card-gradient border border-border shadow-card overflow-hidden">
                {/* Month header with navigation */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <button
                    onClick={() => switchMonth(-1)}
                    disabled={calMonthIdx === 0}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <h3 className="font-display text-foreground text-lg">
                    {MONTH_NAMES[currentCalMonth.month]} {currentCalMonth.year}
                  </h3>
                  <button
                    onClick={() => switchMonth(1)}
                    disabled={calMonthIdx === AVAILABLE_MONTHS.length - 1}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS_OF_WEEK.map(d => (
                      <div key={d} className="text-center text-xs font-body font-semibold text-muted-foreground py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                      if (day === null) return <div key={`empty-${idx}`} />;
                      const dayEvents = getEventsForDay(day, currentCalMonth.month, currentCalMonth.year, filteredEvents);
                      const hasEvents = dayEvents.length > 0;
                      const isSelected = selectedCalendarDay === day;
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                          className={`relative flex flex-col items-center p-1.5 md:p-2 rounded-xl text-sm font-body transition-all cursor-pointer min-h-[48px] md:min-h-[56px] ${
                            isSelected
                              ? "bg-primary/15 border border-primary/40 text-foreground"
                              : hasEvents
                              ? "bg-muted/40 hover:bg-muted/70 text-foreground border border-transparent hover:border-primary/20"
                              : "text-muted-foreground border border-transparent hover:bg-muted/30"
                          } ${isToday(day) ? "ring-1 ring-primary/50" : ""}`}
                        >
                          <span className={`text-xs md:text-sm font-medium ${isToday(day) ? "text-primary font-bold" : ""}`}>{day}</span>
                          {hasEvents && (
                            <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                              {dayEvents.slice(0, 3).map((e, j) => (
                                <span key={j} className={`w-1.5 h-1.5 rounded-full ${getTagDotColor(e.tag)}`} />
                              ))}
                              {dayEvents.length > 3 && (
                                <span className="text-[8px] text-muted-foreground leading-none">+{dayEvents.length - 3}</span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected day detail */}
                <AnimatePresence>
                  {selectedCalendarDay !== null && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="p-4">
                        <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          {MONTH_NAMES[currentCalMonth.month]} {selectedCalendarDay}, {currentCalMonth.year}
                        </p>
                        {selectedDayEvents.length === 0 ? (
                          <p className="text-sm text-muted-foreground font-body">No events on this day</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedDayEvents.map((event, i) => {
                              const globalIndex = events.indexOf(event);
                              const isExpanded = expandedIndex === globalIndex;
                              const hasReminder = !!reminders[event.name];
                              return (
                                <div key={i} className="rounded-xl bg-muted/30 border border-border overflow-hidden">
                                  <button
                                    onClick={() => setExpandedIndex(isExpanded ? null : globalIndex)}
                                    className="flex items-center gap-3 p-3 w-full text-left cursor-pointer"
                                  >
                                    <event.icon className="w-4 h-4 text-primary shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-body font-semibold text-foreground text-sm truncate">{event.name}</p>
                                      <p className="text-xs text-muted-foreground font-body">{event.date}</p>
                                    </div>
                                    {notifSupported && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleSetReminder(event); }}
                                        className={`p-1 rounded-lg transition-colors cursor-pointer ${hasReminder ? "bg-primary/15 text-primary" : "hover:bg-muted text-muted-foreground"}`}
                                        title={hasReminder ? "Cancel reminder" : "Set reminder"}
                                      >
                                        {hasReminder ? <BellRing className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                                      </button>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${event.tagColor} shrink-0`}>
                                      {event.tag}
                                    </span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                  </button>
                                  <AnimatePresence>
                                    {isExpanded && <EventDetailPanel event={event} />}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Highlights sidebar */}
          <div className="space-y-4">
            <h3 className="text-lg font-display text-foreground mb-4">🌿 Highlights</h3>
            {highlights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-2xl bg-card border-l-4 ${h.color} shadow-card`}
              >
                <p className="font-body font-semibold text-foreground mb-1">{h.title}</p>
                <p className="text-sm text-muted-foreground font-body">{h.desc}</p>
              </motion.div>
            ))}

            {/* Calendar legend */}
            {viewMode === "calendar" && (
              <div className="p-4 rounded-2xl bg-card border border-border shadow-card">
                <p className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-3">Legend</p>
                <div className="space-y-2">
                  {[
                    { label: "Live", color: "bg-primary" },
                    { label: "Event", color: "bg-secondary" },
                    { label: "Community Day", color: "bg-accent" },
                    { label: "Research", color: "bg-legendary" },
                    { label: "Battle", color: "bg-accent" },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                      <span className="text-xs font-body text-muted-foreground">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notification info */}
            {notifSupported && (
              <div className="p-4 rounded-2xl bg-card border border-border shadow-card">
                <p className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-primary" /> Reminders
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  Tap 🔔 on any event to get a browser notification 30 minutes before it starts. Keep this tab open for reminders to work.
                </p>
                {Object.keys(reminders).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {Object.keys(reminders).map(name => (
                      <div key={name} className="flex items-center justify-between text-xs font-body">
                        <span className="text-foreground truncate">{name}</span>
                        <button
                          onClick={() => setReminders(prev => cancelReminder(name, prev))}
                          className="text-muted-foreground hover:text-destructive cursor-pointer ml-2 shrink-0"
                        >
                          <BellOff className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/** Shared expandable detail panel for an event */
const EventDetailPanel = ({ event }: { event: GameEvent }) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="overflow-hidden"
  >
    <div className="px-4 pb-4 pt-0 space-y-4 border-t border-border">
      <p className="text-sm text-muted-foreground font-body pt-4">{event.details.description}</p>

      <div>
        <p className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Gift className="w-3.5 h-3.5 text-primary" /> Bonuses
        </p>
        <div className="flex flex-wrap gap-1.5">
          {event.details.bonuses.map((b, j) => (
            <span key={j} className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-body text-foreground">{b}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-secondary" /> Featured Spawns
        </p>
        <div className="flex flex-wrap gap-1.5">
          {event.details.spawns.map((s, j) => (
            <span key={j} className="px-2.5 py-1 rounded-lg bg-secondary/10 border border-secondary/20 text-xs font-body text-foreground">{s}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5 text-accent" /> Raid Bosses
        </p>
        <div className="flex flex-wrap gap-1.5">
          {event.details.raids.map((r, j) => (
            <span key={j} className="px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs font-body text-foreground">{r}</span>
          ))}
        </div>
      </div>

      {event.details.exclusiveMoves && (
        <div>
          <p className="text-xs font-body font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-accent" /> Exclusive Moves
          </p>
          <div className="flex flex-wrap gap-1.5">
            {event.details.exclusiveMoves.map((m, j) => (
              <span key={j} className="px-2.5 py-1 rounded-lg bg-accent/15 border border-accent/30 text-xs font-body font-semibold text-accent">{m}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

export default EventsSection;
