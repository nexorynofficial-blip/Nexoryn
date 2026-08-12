/**
 * Single registration point for GSAP and its plugins. Every module imports
 * gsap/ScrollTrigger/useGSAP from here rather than from the packages directly,
 * so `registerPlugin` is guaranteed to have run exactly once before any tween
 * or trigger is created.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
