import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Star, Bug, Flame, Swords, Search, ChevronDown, MapPin, Gift, Sparkles, Users } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

const events = [
  {
    date: "Mar 3 – 9", name: "Pokémon 30th Anniversary Event", icon: Star,
    tag: "Live", tagColor: "bg-primary/15 text-primary", end: new Date("2026-03-09T20:00:00"),
    details: {
      description: "Celebrate 30 years of Pokémon! Nearly every species that has appeared in GO is available in the wild, eggs, and raids.",
      bonuses: ["2× Catch XP", "Special 30th Anniversary Field Research", "Kanto-themed Collection Challenge"],
      spawns: ["Pikachu (Party Hat)", "Bulbasaur", "Charmander", "Squirtle", "Eevee", "All starters"],
      raids: ["Mewtwo (Tier 5)", "Charizard (Tier 3)", "Blastoise (Tier 3)"],
    }
  },
  {
    date: "Mar 7 – 9", name: "30th Anniversary: All Out", icon: Star,
    tag: "Live", tagColor: "bg-primary/15 text-primary", end: new Date("2026-03-09T20:00:00"),
    details: {
      description: "The grand finale weekend of the 30th Anniversary — all Mega Raids unlocked, boosted shiny rates, and special Timed Research.",
      bonuses: ["Boosted shiny rates for all starters", "All Mega Raids available", "Free Timed Research with rare rewards"],
      spawns: ["All starter Pokémon (all gens)", "Pikachu (Anniversary)", "Rare wild spawns increased"],
      raids: ["All Mega Evolutions available", "Primal Kyogre & Groudon return"],
    }
  },
  {
    date: "Mar 10 – 16", name: "Nature Week", icon: Calendar,
    tag: "Upcoming", tagColor: "bg-secondary/15 text-secondary", end: new Date("2026-03-16T20:00:00"),
    details: {
      description: "A celebration of Grass, Bug, and Ground-type Pokémon with boosted spawns in parks and nature areas.",
      bonuses: ["2× Buddy Candy in parks", "New Field Research tasks", "Plant-themed avatar items"],
      spawns: ["Oddish", "Bellsprout", "Cottonee", "Petilil", "Fomantis"],
      raids: ["Virizion (Tier 5)", "Torterra (Tier 3)"],
    }
  },
  {
    date: "Mar 14, 2–5 PM", name: "Scorbunny Community Day", icon: Flame,
    tag: "Community Day", tagColor: "bg-accent/15 text-accent", end: new Date("2026-03-14T17:00:00"),
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
    tag: "Event", tagColor: "bg-secondary/15 text-secondary", end: new Date("2026-03-23T20:00:00"),
    details: {
      description: "Gen 8 Bug-types debut in Pokémon GO! Blipbug, Dottler & Orbeetle arrive alongside boosted Bug-type spawns.",
      bonuses: ["2× XP for Nice/Great/Excellent throws", "Boosted shiny Paras, Combee & Cutiefly on Lures", "New Bug-type Collection Challenge"],
      spawns: ["Blipbug (NEW)", "Dottler (NEW)", "Snom", "Joltik", "Grubbin", "Wimpod"],
      raids: ["Orbeetle (Tier 3, NEW)", "Vikavolt (Tier 3)", "Genesect (Tier 5)"],
    }
  },
  {
    date: "Mar 21", name: "Research Day", icon: Search,
    tag: "Research", tagColor: "bg-legendary/15 text-legendary", end: new Date("2026-03-21T20:00:00"),
    details: {
      description: "Complete special Field Research tasks from PokéStops for encounters with rare Pokémon and exclusive rewards.",
      bonuses: ["Exclusive Field Research from all PokéStops", "Boosted shiny chance on Research encounters", "5 bonus daily Research task limit"],
      spawns: ["Research-exclusive encounters (TBA)", "Rare candy bundles from tasks"],
      raids: ["Standard raid pool"],
    }
  },
  {
    date: "Mar 28", name: "Max Battle Day", icon: Swords,
    tag: "Battle", tagColor: "bg-accent/15 text-accent", end: new Date("2026-03-28T19:00:00"),
    details: {
      description: "A day dedicated to Max Battles! Earn boosted rewards from Max Raid-style encounters at Power Spots.",
      bonuses: ["3× Max Particles earned", "Boosted Max Move rewards", "Bonus Raid Passes from spinning gyms"],
      spawns: ["Dynamax-capable Pokémon near Power Spots"],
      raids: ["Max Raid bosses with boosted rewards", "Gigantamax Pokémon encounters"],
    }
  },
  {
    date: "Mar 31 – Apr 6", name: "Spring into Spring Event", icon: Calendar,
    tag: "Upcoming", tagColor: "bg-secondary/15 text-secondary", end: new Date("2026-04-06T20:00:00"),
    details: {
      description: "Celebrate the start of spring with flower-crowned Pokémon, egg-themed bonuses, and seasonal spawns.",
      bonuses: ["½ Egg Hatch Distance", "2× Hatch Candy", "Spring-themed avatar items"],
      spawns: ["Flower Crown Eevee", "Flower Crown Chansey", "Cherubi", "Deerling (Spring)"],
      raids: ["Mega Lopunny (Mega Raid)", "Togekiss (Tier 3)"],
    }
  },
];

const highlights = [
  { title: "Community Day: Scorbunny", desc: "Evolve Raboot → Cinderace with Blast Burn & Pyro Ball. 2× Catch Candy, 2× Candy XL, 1/4 Egg Distance, 3h Incense.", color: "border-accent" },
  { title: "Bug Out: Gen 8 Debuts", desc: "Blipbug, Dottler & Orbeetle from Galar arrive! Boosted shiny Paras, Combee & Cutiefly on Lures.", color: "border-secondary" },
  { title: "30th Anniversary Celebration", desc: "Almost every Pokémon that has appeared in GO shows up! Kanto nostalgia with special Field Research.", color: "border-primary" },
];

const getNextEvent = () => {
  const now = new Date();
  return events.find(e => e.end > now) || events[events.length - 1];
};

const EventsSection = () => {
  const nextEvent = getNextEvent();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section id="events" className="py-20 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display text-gradient-gold mb-2">March 2026 Events</h2>
          <p className="text-muted-foreground font-body">Tap any event to see full details</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-8 p-6 rounded-2xl bg-card-gradient border border-primary/30 shadow-glow"
        >
          <CountdownTimer targetDate={nextEvent.end} label={`⏳ ${nextEvent.name} ends in`} />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {events.map((event, i) => {
              const isLive = event.tag === "Live" && event.end > new Date();
              const isExpanded = expandedIndex === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl bg-card-gradient border transition-colors shadow-card overflow-hidden ${
                    isLive ? "border-primary/50" : isExpanded ? "border-primary/40" : "border-border hover:border-primary/40"
                  }`}
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                    className="flex items-center gap-4 p-4 w-full text-left cursor-pointer"
                  >
                    <event.icon className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-foreground truncate">{event.name}</p>
                      <p className="text-sm text-muted-foreground font-body">{event.date}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <CountdownTimer targetDate={event.end} label="" inline />
                      <span className={`px-3 py-1 rounded-full text-xs font-body font-medium ${event.tagColor} hidden sm:inline-flex items-center`}>
                        {isLive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse-glow" />}
                        {event.tag}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 space-y-4 border-t border-border">
                          <p className="text-sm text-muted-foreground font-body pt-4">{event.details.description}</p>

                          {/* Bonuses */}
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

                          {/* Spawns */}
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

                          {/* Raids */}
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

                          {/* Exclusive Moves (if any) */}
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
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

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
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
