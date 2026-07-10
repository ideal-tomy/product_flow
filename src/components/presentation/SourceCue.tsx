import { useEffect, useState } from "react";

interface SourceCueProps {
  active: boolean;
  durationMs?: number;
  onDone?: () => void;
}

/** 根拠オープン時の一瞬の視線誘導（線は残さない） */
export function SourceCue({ active, durationMs = 500, onDone }: SourceCueProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    setShow(true);
    const t = window.setTimeout(() => {
      setShow(false);
      onDone?.();
    }, durationMs);
    return () => window.clearTimeout(t);
  }, [active, durationMs, onDone]);

  if (!show) return null;

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-0.5 bg-navy/55 lg:block"
      style={{
        boxShadow: "0 0 14px 3px rgba(11, 31, 58, 0.28)",
      }}
      aria-hidden="true"
    />
  );
}
