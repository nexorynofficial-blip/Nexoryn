// The Framer Motion feature pack (animations, gestures, in-view, layout). It is
// loaded on demand by <LazyMotion> in App.jsx so that none of it sits in the
// JavaScript the page needs before it can first paint. Components use the light
// `m` element instead of `motion`; they get their features when this arrives.
import { domMax } from "framer-motion";

export default domMax;
