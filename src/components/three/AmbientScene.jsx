import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import { prefersReducedMotion } from "../../lib/easing";

const ACCENT_FROM = new THREE.Color("#ff7a1a");
const ACCENT_TO = new THREE.Color("#ffb300");
const GLOW = new THREE.Color("#c85a12");

const PARTICLE_COUNT = 1400;

/**
 * Builds the point cloud: a hollow spherical shell, so the core reads as an
 * object suspended in a field rather than a solid ball of dots.
 */
function buildParticles() {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const scales = new Float32Array(PARTICLE_COUNT);
  const color = new THREE.Color();

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    // Direction from a normalised gaussian-ish vector gives an even spread over
    // the sphere; picking angles uniformly instead clumps points at the poles.
    const v = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    );
    if (v.lengthSq() === 0) v.set(0, 1, 0);
    v.normalize().multiplyScalar(3.1 + Math.pow(Math.random(), 0.6) * 5.2);

    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y * 0.75; // flattened slightly — reads as a drift field, not a globe
    positions[i * 3 + 2] = v.z;

    color.copy(ACCENT_FROM).lerp(ACCENT_TO, Math.random());
    if (Math.random() > 0.82) color.lerp(GLOW, 0.6);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    scales[i] = 0.5 + Math.random() * 1.6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  return geometry;
}

/** Soft round sprite, generated on a canvas so there's no texture to download. */
function buildDotTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Ambient WebGL layer sitting behind the mid-page sections: a wireframe
 * "automation core" turning inside a drifting particle field, with rotation
 * and dolly driven by scroll and a little parallax from the pointer.
 *
 * Rendering is driven by GSAP's ticker — the same loop that already drives
 * Lenis — so the page runs one RAF loop total instead of three.
 */
export default function AmbientScene({ triggerRef }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduced = prefersReducedMotion();

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      // No WebGL (older machines, some VMs, context limit hit). The section
      // still has its aurora + SVG constellation, so silently skip.
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 9.5);

    const group = new THREE.Group();
    scene.add(group);

    // ── The core: two counter-rotating wireframe shells ──────────────────
    const outerGeo = new THREE.IcosahedronGeometry(2.35, 1);
    const outerWire = new THREE.WireframeGeometry(outerGeo);
    const outerMat = new THREE.LineBasicMaterial({
      color: ACCENT_FROM,
      transparent: true,
      // Tuned against the aurora blobs behind it — anything under ~0.5 and the
      // wireframe disappears into the orange wash entirely.
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const outer = new THREE.LineSegments(outerWire, outerMat);
    group.add(outer);

    const innerGeo = new THREE.IcosahedronGeometry(1.4, 0);
    const innerWire = new THREE.WireframeGeometry(innerGeo);
    const innerMat = new THREE.LineBasicMaterial({
      color: ACCENT_TO,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const inner = new THREE.LineSegments(innerWire, innerMat);
    group.add(inner);

    // ── The field ────────────────────────────────────────────────────────
    const particleGeo = buildParticles();
    const dotTexture = buildDotTexture();
    const particleMat = new THREE.PointsMaterial({
      size: 0.09,
      sizeAttenuation: true,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      // Additive over a black backdrop is what makes the dots read as light
      // rather than as paint; depthWrite off stops them punching holes in
      // each other where sprites overlap.
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      // Capped at 1.5: the scene is additively blended with depth writes off,
      // so it is entirely fill-rate bound — every extra device pixel costs the
      // full overdraw of the particle field, and past 1.5 that buys no visible
      // sharpness on a field of soft round sprites.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    // ── Drivers: scroll progress and pointer ─────────────────────────────
    const state = { scroll: 0, pointerX: 0, pointerY: 0, visible: true };

    // The trigger has to be the tall section, not the canvas: the canvas rides
    // a sticky rail and is permanently in view, so measuring against itself
    // would peg progress and never toggle visibility off.
    const trigger = ScrollTrigger.create({
      trigger: triggerRef?.current ?? mount,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        state.scroll = self.progress;
      },
      onToggle: (self) => {
        // Stop drawing entirely when the section is off-screen — the canvas is
        // sticky, so without this it would keep rendering for the whole page.
        state.visible = self.isActive;
      },
    });

    const onPointerMove = (e) => {
      state.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      state.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let camX = 0;
    let camY = 0;

    // GSAP's ticker hands us elapsed seconds directly, so there's no need for
    // a THREE.Clock (deprecated in favour of THREE.Timer) or a second clock
    // running alongside the one already driving Lenis.
    const render = (elapsed) => {
      if (!state.visible) return;
      const t = reduced ? 0 : elapsed;

      // Scroll turns the core; the idle drift keeps it alive when the user
      // stops scrolling, which is what stops it feeling like a slideshow.
      group.rotation.y = t * 0.05 + state.scroll * Math.PI * 1.1;
      group.rotation.x = Math.sin(t * 0.14) * 0.1 + state.scroll * 0.35;
      inner.rotation.y = -t * 0.16;
      inner.rotation.z = t * 0.09;
      particles.rotation.y = -t * 0.02;

      // Dolly in a little across the section — subtle depth change that makes
      // scrolling feel like moving through the scene rather than past it.
      // Kept small: at full size the core reads as a foreground object and
      // starts competing with the copy sitting on top of it.
      group.scale.setScalar(0.5 + state.scroll * 0.22);

      if (!reduced) {
        // Lerped rather than set directly: tying the camera straight to the
        // pointer feels mechanical, the lag gives it weight.
        camX += (state.pointerX * 0.85 - camX) * 0.035;
        camY += (-state.pointerY * 0.55 - camY) * 0.035;
        camera.position.x = camX;
        camera.position.y = camY;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    gsap.ticker.add(render);

    return () => {
      gsap.ticker.remove(render);
      trigger.kill();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);

      // Every GPU resource has to be released by hand — React unmounting the
      // canvas does not free the underlying buffers.
      outerWire.dispose();
      outerGeo.dispose();
      outerMat.dispose();
      innerWire.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      dotTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [triggerRef]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none h-full w-full"
    />
  );
}
