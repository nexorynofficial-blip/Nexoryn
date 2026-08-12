/**
 * Scrim and seam overlays for content sections. The ColorBends shader itself
 * lives in SiteBackground (fixed, site-wide); this layer only darkens and
 * blends section edges so text stays readable over the bright orange bands.
 */
export function SectionsBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/50"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[380px] md:h-[520px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 14%, rgba(0,0,0,0.78) 32%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.22) 78%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.05]" />
    </div>
  );
}
