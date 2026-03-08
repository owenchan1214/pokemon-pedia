import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  label: string;
  inline?: boolean;
}

const CountdownTimer = ({ targetDate, label, inline = false }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (inline) {
    if (timeLeft.total <= 0) {
      return <span className="text-xs font-body font-semibold text-primary">🎉 Now!</span>;
    }
    return (
      <span className="text-xs font-mono text-muted-foreground tabular-nums">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
      </span>
    );
  }

  if (timeLeft.total <= 0) {
    return (
      <div className="text-center">
        <p className="text-xs text-muted-foreground font-body mb-1">{label}</p>
        <p className="text-sm font-body font-semibold text-primary">🎉 Live Now!</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground font-body mb-2">{label}</p>
      <div className="flex gap-2 justify-center">
        <TimeUnit value={timeLeft.days} unit="D" />
        <TimeUnit value={timeLeft.hours} unit="H" />
        <TimeUnit value={timeLeft.minutes} unit="M" />
        <TimeUnit value={timeLeft.seconds} unit="S" />
      </div>
    </div>
  );
};

const TimeUnit = ({ value, unit }: { value: number; unit: string }) => (
  <div className="flex flex-col items-center min-w-[40px] px-2 py-1.5 rounded-xl bg-muted/60 border border-border">
    <span className="text-lg font-display text-foreground leading-none">{String(value).padStart(2, "0")}</span>
    <span className="text-[10px] text-muted-foreground font-body mt-0.5">{unit}</span>
  </div>
);

function getTimeLeft(target: Date) {
  const now = new Date().getTime();
  const total = target.getTime() - now;
  return {
    total,
    days: Math.max(0, Math.floor(total / (1000 * 60 * 60 * 24))),
    hours: Math.max(0, Math.floor((total / (1000 * 60 * 60)) % 24)),
    minutes: Math.max(0, Math.floor((total / (1000 * 60)) % 60)),
    seconds: Math.max(0, Math.floor((total / 1000) % 60)),
  };
}

export default CountdownTimer;
