const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

// Plain glass-panel card. This used to track the cursor across the whole
// document and paint a radial-gradient spotlight glow near the card on
// proximity; that effect has been removed, leaving just the glass-panel
// treatment with a border-brighten on hover in its place.
export function GlowCard({
  children,
  className = "",
  size = "md",
  width,
  height,
  customSize = false,
}) {
  const inlineStyles = {};
  if (width !== undefined)
    inlineStyles.width = typeof width === "number" ? `${width}px` : width;
  if (height !== undefined)
    inlineStyles.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      style={inlineStyles}
      className={`${customSize ? "" : `${sizeMap[size]} aspect-[3/4]`} glass-panel relative grid grid-rows-[1fr_auto] gap-4 rounded-3xl p-4 shadow-[0_1rem_2rem_-1rem_black] transition-colors duration-300 hover:border-orange-400/30 ${className}`}
    >
      {children}
    </div>
  );
}
