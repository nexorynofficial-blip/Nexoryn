import TacticalGlobe3D from "./vendor/TacticalGlobe3D.js";

// Placeholder client locations spread across a few plausible regions until
// real project data is available — North America, Europe, South Asia, and
// the Middle East.
const MARKERS = [
  { label: "New York", description: "North America", latitude: 40.7128, longitude: -74.006, color: "#ff9a3d" },
  { label: "London", description: "Europe", latitude: 51.5074, longitude: -0.1278, color: "#ff9a3d" },
  { label: "Mumbai", description: "South Asia", latitude: 19.076, longitude: 72.8777, color: "#ff9a3d" },
  { label: "Dubai", description: "Middle East", latitude: 25.2048, longitude: 55.2708, color: "#ff9a3d" },
];

// This vendored component (see vendor/TacticalGlobe3D.js) reads every one of
// these prop groups directly with no internal fallback, so unlike a normal
// Framer canvas render — which injects the property-panel defaults — we have
// to supply the full tree ourselves. Colors are tuned to the site's
// black/orange palette instead of the component's default blue/grey.
export function AboutGlobe() {
  return (
    <TacticalGlobe3D
      markers={MARKERS}
      countries={[]}
      mapStyle={{
        oceanColor: "#0d0704",
        landFill: "#2a1a0e",
        landStroke: "#5a3a1e",
        strokeWidth: 0.5,
        hoverColor: "#ff7a1a",
        disabledColor: "#1a1108",
      }}
      tooltip={{
        show: true,
        background: "rgba(21, 12, 5, 0.92)",
        textColor: "#ffffff",
        borderColor: "rgba(255, 178, 71, 0.35)",
      }}
      grid={{ show: true, color: "#7a5230", opacity: 0.2 }}
      layout={{ cornerRadius: 0, padding: 8, showBorder: false, borderColor: "rgba(255,255,255,0.1)" }}
      interaction={{
        autoRotate: true,
        autoRotateSpeed: 6,
        rotateX: 0,
        rotateY: -15,
        rotateZ: -20,
        enableDrag: true,
        dragSensitivity: 0.4,
        glowColor: "#ff7a1a",
        // 0 = no atmosphere halo ring around the sphere, so the globe sits
        // directly on the page background with no glow of its own.
        glowIntensity: 0,
        showStars: true,
        showLabels: true,
      }}
    />
  );
}
