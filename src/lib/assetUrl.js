// Turns whatever an image field holds into a URL the browser can load.
//
// There are three shapes in play:
//
//   1. Static data (src/data/*.js) imports the file, so the value is already
//      a resolved, content-hashed URL emitted by Vite. Pass it through.
//   2. The API returns whatever string is in the Asset row's `url`. For the
//      rows created by the seed that is a *source-relative path* like
//      "src/assets/project-aurum-thumb.png" — not loadable on its own, but
//      it does name a file that IS in this bundle. The glob below maps those
//      paths back to their hashed build URLs.
//   3. Anything uploaded later through the admin panel is a real absolute
//      URL (Cloudinary, or any origin). Pass it through too.
//
// Doing it this way means the site can read content from the API today,
// against the images already committed here, without every asset first
// having to be re-uploaded to a CDN.

// Eager so the map is a plain object at runtime with no dynamic import; the
// files are in the bundle either way since the static data imports them.
const modules = import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp,svg,avif}", {
  eager: true,
  query: "?url",
  import: "default",
});

// Keys arrive as "../assets/foo/bar.png"; index them by the tail so both
// "src/assets/foo/bar.png" and "assets/foo/bar.png" resolve.
const byPath = new Map();
for (const [key, url] of Object.entries(modules)) {
  const clean = key.replace(/^\.\.\//, ""); // "assets/foo/bar.png"
  byPath.set(clean, url);
  byPath.set(`src/${clean}`, url);
  byPath.set(`/${clean}`, url);
  const file = clean.split("/").pop();
  // Last-resort key so a moved file still resolves by basename.
  if (!byPath.has(file)) byPath.set(file, url);
}

/**
 * @param {string|undefined|null} value An imported asset URL, an API path, or
 *   an absolute URL.
 * @returns {string} A loadable URL, or "" when nothing can be resolved.
 */
export function assetUrl(value) {
  if (!value) return "";
  if (typeof value !== "string") return value;

  // Already loadable: absolute URL, protocol-relative, or a data/blob URI.
  if (/^(https?:)?\/\//i.test(value) || /^(data|blob):/i.test(value)) return value;

  // A Vite-emitted URL (starts with the site base and has a content hash).
  if (byPath.has(value)) return byPath.get(value);

  const normalized = value.replace(/^\.?\//, "");
  if (byPath.has(normalized)) return byPath.get(normalized);

  const file = value.split("/").pop();
  if (byPath.has(file)) return byPath.get(file);

  // Unknown but root-relative — let the server try to serve it.
  if (value.startsWith("/")) return value;

  return "";
}

export default assetUrl;
