// Minimal stand-in for the "framer" package that Framer-exported code
// components import for their editor property panel. Outside the Framer
// canvas none of that is used at runtime — RenderTarget.current() only needs
// to resolve to something other than RenderTarget.canvas, addPropertyControls
// is a no-op, and ControlType's values are never actually read (they're just
// registered with the panel), so a Proxy that echoes back any key is enough.
export const ControlType = new Proxy({}, { get: (_target, prop) => prop });

export const RenderTarget = {
  current: () => "export",
  canvas: "canvas",
  export: "export",
  preview: "preview",
  thumbnail: "thumbnail",
};

export function addPropertyControls() {}
