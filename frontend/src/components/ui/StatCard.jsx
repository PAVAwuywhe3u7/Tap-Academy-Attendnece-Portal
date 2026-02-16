import { useEffect, useMemo, useState } from 'react';

const AnimatedNumber = ({ value }) => {
  const target = useMemo(() => Number(value) || 0, [value]);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 700;
    const startTime = performance.now();

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplay(Number((target * progress).toFixed(1)));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target]);

  return <>{display % 1 === 0 ? display.toFixed(0) : display.toFixed(1)}</>;
};

const StatCard = ({ title, value, hint, icon }) => (
  <article className="glass-card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent-400/20 blur-2xl transition-opacity duration-300 group-hover:opacity-90" />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">{title}</p>
        <h3 className="mt-3 font-display text-3xl font-semibold text-white">
          <AnimatedNumber value={value} />
        </h3>
        {hint && <p className="mt-2 text-sm text-slate-300/70">{hint}</p>}
      </div>
      {icon && <span className="rounded-xl bg-white/10 p-3 text-xl text-accent-400">{icon}</span>}
    </div>
  </article>
);

export default StatCard;