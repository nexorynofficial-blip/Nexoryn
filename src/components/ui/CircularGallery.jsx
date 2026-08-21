import { forwardRef, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 3D ring of project cards that rotates with overall page scroll position
 * (plus a slow constant auto-rotate) — a subtle parallax touch as the user
 * scrolls through the whole site, not a scroll-jacked full-page takeover.
 * Manual arrow controls add a separate offset on top of that.
 */
export const CircularGallery = forwardRef(function CircularGallery(
  { items, className = "", radius = 600, autoRotateSpeed = 0.028, ...props },
  ref
) {
  const [rotation, setRotation] = useState(0);
  const [manualOffset, setManualOffset] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isManuallyControlling, setIsManuallyControlling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const manualTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress =
        scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      setRotation(scrollProgress * 360);
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 150);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const autoRotate = () => {
      if (!isScrolling && !isManuallyControlling) {
        setRotation((prev) => prev + autoRotateSpeed);
      }
      animationFrameRef.current = requestAnimationFrame(autoRotate);
    };
    animationFrameRef.current = requestAnimationFrame(autoRotate);
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isScrolling, isManuallyControlling, autoRotateSpeed]);

  useEffect(
    () => () => {
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    },
    []
  );

  const anglePerItem = 360 / items.length;

  const rotateByOneItem = (direction) => {
    setManualOffset((prev) => prev + direction * anglePerItem);
    setIsManuallyControlling(true);
    if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    manualTimeoutRef.current = setTimeout(
      () => setIsManuallyControlling(false),
      1200
    );
  };

  // Combined angle used only for the opacity/facing math below — the actual
  // transforms stay on two separate nested layers (see render) so the CSS
  // transition on manual clicks never fights the frame-by-frame auto-rotate.
  const combinedRotation = rotation + manualOffset;

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Circular Portfolio Gallery"
      className={`relative flex h-full w-full items-center justify-center ${className}`}
      style={{ perspective: "2000px" }}
      {...props}
    >
      {/* Manual-offset layer: CSS-eased, only moves on arrow clicks */}
      <div
        className="relative h-full w-full"
        style={{
          transform: `rotateY(${manualOffset}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Continuous auto/scroll-rotate layer: no transition, stays smooth
            frame-by-frame like before */}
        <div
          className="relative h-full w-full"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            const totalRotation = combinedRotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(
              relativeAngle > 180 ? 360 - relativeAngle : relativeAngle
            );
            const opacity = Math.max(0.3, 1 - normalizedAngle / 180);

            return (
              <div
                key={item.photo.url}
                role="group"
                aria-label={item.common}
                className="absolute h-[380px] w-[320px]"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-160px",
                  marginTop: "-190px",
                  opacity,
                  transition: "opacity 0.3s linear",
                }}
              >
                {/* liquid-glass card face with orange glow border on hover;
                    backface hidden so cards past ±90° don't show mirrored text.
                    Photo sits padded at the top with name / service type /
                    credit stacked below — same pattern as the About page's
                    team cards. */}
                <div
                  style={{ backfaceVisibility: "hidden" }}
                  className="group glass-panel flex h-full w-full flex-col overflow-hidden rounded-2xl p-4 shadow-2xl transition-colors duration-300 hover:border-orange-400/30"
                >
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={item.photo.url}
                      alt={item.photo.text}
                      className="aspect-[4/3] w-full object-cover"
                      style={{ objectPosition: item.photo.pos || "center" }}
                    />
                  </div>
                  <h3 className="mt-4 font-heading text-lg leading-tight text-white">
                    {item.common}
                  </h3>
                  <p className="mt-1 text-sm font-light text-white/50">
                    {item.binomial}
                  </p>
                  <p className="mt-2 text-xs font-light text-white/40">Nexoryn</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual rotation controls */}
      <button
        type="button"
        onClick={() => rotateByOneItem(-1)}
        aria-label="Rotate gallery left"
        className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-accent-to backdrop-blur-md transition duration-300 hover:border-orange-400/40 hover:bg-white/10 md:left-6"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => rotateByOneItem(1)}
        aria-label="Rotate gallery right"
        className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-accent-to backdrop-blur-md transition duration-300 hover:border-orange-400/40 hover:bg-white/10 md:right-6"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
});
