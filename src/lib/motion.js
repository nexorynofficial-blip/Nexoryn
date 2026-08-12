export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
};

export const blurFadeIn = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export const viewportOnce = { once: true, amount: 0.3 };
