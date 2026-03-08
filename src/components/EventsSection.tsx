import { motion } from "framer-motion";
import { Calendar, Star, Bug, Flame, Swords, Search } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

const events = [
  { date: "Mar 3 – 9", name: "Pokémon 30th Anniversary Event", icon: Star, tag: "Live", tagColor: "bg-primary/15 text-primary", end: new Date("2026-03-09T20:00:00") },
  { date: "Mar 7 – 9", name: "30th Anniversary: All Out", icon: Star, tag: "Live", tagColor: "bg-primary/15 text-primary", end: new Date("2026-03-09T20:00:00") },
  { date: "Mar 10 – 16", name: "Special Event (TBA)", icon: Calendar, tag: "Upcoming", tagColor: "bg-secondary/15 text-secondary", end: new Date("2026-03-16T20:00:00") },
  { date: "Mar 14, 2–5 PM", name: "Scorbunny Community Day", icon: Flame, tag: "Community Day", tagColor: "bg-accent/15 text-accent", end: new Date("2026-03-14T17:00:00") },
  { date: "Mar 17 – 23", name: "Bug Out Event (Gen 8 Debuts!)", icon: Bug, tag: "Event", tagColor: "bg-secondary/15 text-secondary", end: new Date("2026-03-23T20:00:00") },
  { date: "Mar 21", name: "Research Day", icon: Search, tag: "Research", tagColor: "bg-legendary/15 text-legendary", end: new Date("2026-03-21T20:00:00") },
  { date: "Mar 28", name: "Max Battle Day", icon: Swords, tag: "Battle", tagColor: "bg-accent/15 text-accent", end: new Date("2026-03-28T19:00:00") },
  { date: "Mar 31 – Apr 6", name: "Special Event (TBA)", icon: Calendar, tag: "Upcoming", tagColor: "bg-secondary/15 text-secondary", end: new Date("2026-04-06T20:00:00") },
];

const highlights = [
  { title: "Community Day: Scorbunny", desc: "Evolve Raboot → Cinderace with Blast Burn & Pyro Ball. 2× Catch Candy, 2× Candy XL, 1/4 Egg Distance, 3h Incense.", color: "border-accent" },
  { title: "Bug Out: Gen 8 Debuts", desc: "Blipbug, Dottler & Orbeetle from Galar arrive! Boosted shiny Paras, Combee & Cutiefly on Lures.", color: "border-secondary" },
  { title: "30th Anniversary Celebration", desc: "Almost every Pokémon that has appeared in GO shows up! Kanto nostalgia with special Field Research.", color: "border-primary" },
];

// Find the next upcoming event
const getNextEvent = () => {
  const now = new Date();
  return events.find(e => e.end > now) || events[events.length - 1];
};

const EventsSection = () => {
  const nextEvent = getNextEvent();

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
          <p className="text-muted-foreground font-body">All confirmed and upcoming events this month</p>
        </motion.div>

        {/* Countdown Hero */}
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
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl bg-card-gradient border transition-colors shadow-card ${
                    isLive ? "border-primary/50" : "border-border hover:border-primary/40"
                  }`}
                >
                  <event.icon className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground truncate">{event.name}</p>
                    <p className="text-sm text-muted-foreground font-body">{event.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-body font-medium ${event.tagColor} shrink-0`}>
                    {isLive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse-glow" />}
                    {event.tag}
                  </span>
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
