// Does this browser have real graphics hardware behind WebGL?
//
// The site's animated background is a full-screen fragment shader. On a device
// with a GPU that is cheap. On one without (a virtual machine, a remote
// desktop, a headless test browser, some very old or blocklisted GPUs) the
// browser falls back to drawing every pixel of it on the CPU, 60 times a
// second, which starves the page of the time it needs to respond: pages that
// otherwise load fine freeze for seconds. For those devices we show a still
// picture of the same background instead.
//
// Two independent signals, either of which means "software":
//  - `failIfMajorPerformanceCaveat` makes getContext() return null instead of
//    handing back a software-rendered context.
//  - the renderer name reported by the driver (SwiftShader, llvmpipe, ...).

const SOFTWARE_RENDERERS = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i;

let cached;

/**
 * @returns {{ hardware: boolean, reason: string }}
 */
export function getGpuTier() {
  if (cached) return cached;
  cached = detect();
  return cached;
}

function detect() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    if (!gl) return { hardware: false, reason: "WebGL unavailable or software-only" };

    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();

    if (SOFTWARE_RENDERERS.test(renderer)) return { hardware: false, reason: renderer };
    return { hardware: true, reason: renderer || "hardware" };
  } catch {
    return { hardware: false, reason: "WebGL check failed" };
  }
}
