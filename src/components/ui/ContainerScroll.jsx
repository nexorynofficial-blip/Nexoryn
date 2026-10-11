import { useRef } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";

/**
 * A title over a "screen" that starts tilted back and stands upright as the
 * section scrolls into view (after Aceternity's container-scroll animation).
 */
export function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null);
  const isMobile = !useMediaQuery("(min-width: 768px)");

  // Desktop: the tall (72rem) container scrubs the tilt across its own height.
  const { scrollYProgress: desktopProgress } = useScroll({ target: containerRef });
  // Phones: the container is only about a screen tall, so the desktop range
  // barely moves. Stand the screen up as it scrolls in instead, upright by
  // the time it reaches the middle of the screen.
  const { scrollYProgress: mobileProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });
  const progress = isMobile ? mobileProgress : desktopProgress;

  const rotate = useTransform(progress, [0, 1], isMobile ? [12, 0] : [20, 0]);
  const scale = useTransform(progress, [0, 1], isMobile ? [0.94, 1] : [1.05, 1]);
  const translate = useTransform(progress, [0, 1], isMobile ? [0, 0] : [0, -100]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center px-4 py-16 md:h-[72rem] md:p-12"
    >
      <div className="relative w-full md:py-24" style={{ perspective: "1000px" }}>
        <m.div style={{ translateY: translate }} className="mx-auto max-w-5xl text-center">
          {titleComponent}
        </m.div>
        <m.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow:
              "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
          }}
          className="mx-auto h-[38rem] w-full max-w-7xl rounded-[26px] border-[3px] border-[#3a3a3a] bg-[#1a1a1a] p-1.5 md:-mt-12 md:h-[48rem] md:rounded-[30px] md:border-4 md:p-4"
        >
          <div className="h-full w-full overflow-hidden rounded-[20px] bg-[#141414] md:rounded-2xl">{children}</div>
        </m.div>
      </div>
    </div>
  );
}

export default ContainerScroll;
