interface PresentationOverlayProps {
  active: boolean;
}

/** 周辺をわずかに抑え、中央へ視線を集める（やりすぎない） */
export function PresentationOverlay({ active }: PresentationOverlayProps) {
  if (!active) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 bg-navy/[0.04] transition-opacity"
      aria-hidden="true"
    />
  );
}
