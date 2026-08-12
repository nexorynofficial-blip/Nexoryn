import { useRef } from "react";
import {
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion";

const SPRING = { stiffness: 260, damping: 22, mass: 0.6 };

// Cursor-driven 3D tilt + dynamic shadow, originally built for the Hero's
// InfoCard. Extracted so any card can reuse the exact same spring/damping/
// max-tilt feel instead of a separately-tuned effect.
export function useTilt3D() {
  const ref = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), SPRING);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), SPRING);
  const scale = useSpring(1, SPRING);

  // Shadow shifts opposite the tilt to sell the depth
  const shadowX = useTransform(rotateY, (v) => -v * 1.4);
  const shadowY = useTransform(rotateX, (v) => v * 1.4 + 10);
  const boxShadow = useMotionTemplate`${shadowX}px ${shadowY}px 32px rgba(0,0,0,0.4)`;

  const onMouseMove = (e) => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    scale.set(1.02);
  };

  const onMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
  };

  return {
    ref,
    style: { rotateX, rotateY, scale, boxShadow, transformStyle: "preserve-3d" },
    onMouseMove,
    onMouseLeave,
  };
}
