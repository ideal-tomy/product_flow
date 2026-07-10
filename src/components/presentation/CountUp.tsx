import { useEffect, useState } from "react";

interface CountUpProps {
  to: number;
  durationMs?: number;
  className?: string;
  formatter?: (n: number) => string;
}

export function CountUp({
  to,
  durationMs = 700,
  className,
  formatter = (n) => String(Math.round(n)),
}: CountUpProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) * (1 - t);
      setValue(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, durationMs]);

  return <span className={className}>{formatter(value)}</span>;
}
