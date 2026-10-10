import { useRef } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";

/**
 * A title over a "screen" that starts tilted back and stands upright as the
 * section scrolls into view (after Aceternity's container-scroll animation).
 */
export function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const isMobile = !useMediaQuery("(min-width: 769px)");

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.7, 0.9] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[38rem] items-center justify-center p-2 md:h-[72rem] md:p-12"
    >
      <div className="relative w-full py-10 md:py-24" style={{ perspective: "1000px" }}>
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
          className="mx-auto -mt-12 h-[30rem] w-full max-w-7xl rounded-[30px] border-4 border-[#3a3a3a] bg-[#1a1a1a] p-2 md:h-[48rem] md:p-4"
        >
          <div className="h-full w-full overflow-hidden rounded-2xl bg-[#141414]">{children}</div>
        </m.div>
      </div>
    </div>
  );
}

export default ContainerScroll;
