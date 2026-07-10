import { useEffect, useState, type ReactNode } from "react";

interface StaggerRevealProps {
  children: ReactNode[];
  stepMs?: number;
  className?: string;
}

export function StaggerReveal({
  children,
  stepMs = 200,
  className,
}: StaggerRevealProps) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    if (children.length === 0) return;
    const timers: number[] = [];
    children.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => setVisible(i + 1), stepMs * (i + 1)),
      );
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [children.length, stepMs]);

  return (
    <div className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          className={i < visible ? "fade-in" : "invisible opacity-0"}
          aria-hidden={i >= visible}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
