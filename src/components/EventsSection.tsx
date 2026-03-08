import { motion } from "framer-motion";
import { Calendar, Star, Bug, Flame } from "lucide-react";

const events = [
  { date: "Mar 3 – 9", name: "30th Anniversary Event", icon: Star, tag: "Special", tagColor: "bg-primary/20 text-primary" },
  { date: "Mar 7 – 9", name: "30th Anniversary: All Out", icon: Star, tag: "Special", tagColor: "bg-primary/20 text-primary" },
  { date: "Mar 10 – 16", name: "Special Event (TBA)", icon: Calendar, tag: "Upcoming", tagColor: "bg-secondary/20 text-secondary" },
  { date: "Mar 14", name: "Scorbunny Community Day", icon: Flame, tag: "Community Day", tagColor: "bg-accent/20 text-accent" },
  { date: "Mar 17 – 23", name: "Bug Out Event", icon: Bug, tag: "Event", tagColor: "bg-secondary/20 text-secondary" },
  { date: "Mar 21", name: "Research Day", icon: Calendar, tag: "Research", tagColor: "bg-legendary/20 text-legendary" },
  { date: "Mar 28", name: "Max Battle Day", icon: Star, tag: "Battle", tagColor: "bg-accent/20 text-accent" },
  { date: "Mar 31 – Apr 6", name: "Special Event", icon: Calendar, tag: "Upcoming", tagColor: "bg-secondary/20 text-secondary" },
];

const highlights = [
  { title: "Community Day: Scorbunny", desc: "Evolve to Cinderace with Blast Burn & Pyro Ball. 2× Catch Candy, 1/4 Egg Distance.", color: "border-accent" },
  { title: "Bug Out: Gen 8 Debuts", desc: "Blipbug, Dottler & Orbeetle from Galar arrive! Boosted shiny odds on Lure spawns.", color: "border-secondary" },
  { title: "Season Bonuses", desc: "Increased XP/Stardust for streaks, +1 Candy for trades, guaranteed Candy XL (31+).", color: "border-primary" },
];

const EventsSection = () => {
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Timeline */}
          <div className="lg:col-span-2 space-y-3">
            {events.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-card-gradient border border-border hover:border-primary/30 transition-colors shadow-card"
              >
                <event.icon className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-foreground truncate">{event.name}</p>
                  <p className="text-sm text-muted-foreground font-body">{event.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-body font-medium ${event.tagColor} shrink-0`}>
                  {event.tag}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Highlights */}
          <div className="space-y-4">
            <h3 className="text-lg font-display text-foreground mb-4">🔥 Highlights</h3>
            {highlights.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-lg bg-card border-l-4 ${h.color} shadow-card`}
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
