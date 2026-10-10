/**
 * The Nexoryn mark with a sweep of light across it every few seconds. The
 * sheen is masked to the logo's own shape, so it only ever lands on the logo,
 * never the background. The logo itself is unchanged. The sweep is CSS
 * (logo-sheen in index.css) and is turned off for reduced motion.
 */
export function LogoShowcase({ src, alt = "Nexoryn logo" }) {
  const mask = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative aspect-square w-[70%]">
        <img
          src={src}
          alt={alt}
          width={1200}
          height={1200}
          className="absolute inset-0 h-full w-full drop-shadow-[0_20px_50px_rgba(255,122,26,0.35)]"
        />
        <div aria-hidden="true" className="logo-sheen absolute inset-0" style={mask} />
      </div>
    </div>
  );
}

export default LogoShowcase;
