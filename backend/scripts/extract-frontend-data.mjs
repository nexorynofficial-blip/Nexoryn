#!/usr/bin/env node
// Pulls the ACTUAL live content out of the frontend's static data files
// (../src/data/projects.js, services.js, reviews.js, and the TEAM array in
// AboutPage.jsx) and writes it to prisma/fixtures/*.json for the seed
// script — so migrating to the database is a real, automated transform of
// today's content, not hand-retyped placeholder data (see docs/TRD.md §8).
//
// Two things in those source files can't survive a plain `require()`/`import`
// in a bare Node script, so this neutralizes them before bundling with
// esbuild:
//   1. Image imports (`import x from "../assets/foo.png"`) — Vite resolves
//      these to a URL at build time; plain Node has no such loader. Resolved
//      here to a virtual module whose default export is just the resolved
//      *relative path string* — enough to know which file to upload to
//      Cloudinary later (see prisma/seed.ts's note on real image upload).
//   2. `lucide-react` icon imports (`import { Workflow } from "lucide-react"`)
//      — the source only ever uses these as `icon: Workflow` (never
//      renders them), so a source-level rewrite turns each imported binding
//      into a plain string equal to its own export name: `icon: Workflow`
//      naturally becomes `icon: "Workflow"` once bundled — including the
//      one local rename in projects.js (`Image as ImageIcon`), which
//      correctly resolves to the string "Image", not "ImageIcon".

import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_SRC = path.resolve(__dirname, "../../src");
const FIXTURES_DIR = path.resolve(__dirname, "../prisma/fixtures");

const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp)$/i;

/** esbuild plugin: image imports → a virtual module exporting the resolved
 * path as a plain string, relative to the frontend's `src/` root. */
const imageStubPlugin = {
  name: "image-import-stub",
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: IMAGE_EXT }, (args) => ({
      path: path.resolve(args.resolveDir, args.path),
      namespace: "image-stub",
    }));
    pluginBuild.onLoad({ filter: /.*/, namespace: "image-stub" }, (args) => {
      const marker = `src${path.sep}`;
      const idx = args.path.lastIndexOf(marker);
      const relative = idx >= 0 ? args.path.slice(idx) : args.path;
      return {
        contents: `export default ${JSON.stringify(relative.replaceAll("\\", "/"))};`,
        loader: "js",
      };
    });
  },
};

/** esbuild plugin: rewrite `import { A, B as C } from "lucide-react"` into
 * `const A = "A", C = "B";` before bundling — every downstream reference to
 * that icon then just holds its own real export name as a plain string. */
const lucideToNameStringsPlugin = {
  name: "lucide-react-to-name-strings",
  setup(pluginBuild) {
    pluginBuild.onLoad({ filter: /\.jsx?$/ }, async (args) => {
      let contents = await readFile(args.path, "utf8");
      contents = contents.replace(
        /import\s*\{([^}]+)\}\s*from\s*["']lucide-react["'];?/,
        (_match, names) => {
          const bindings = names
            .split(",")
            .map((n) => n.trim())
            .filter(Boolean)
            .map((n) => {
              const asMatch = n.match(/^(\w+)\s+as\s+(\w+)$/);
              if (asMatch) return `${asMatch[2]} = ${JSON.stringify(asMatch[1])}`;
              return `${n} = ${JSON.stringify(n)}`;
            });
          return `const ${bindings.join(", ")};`;
        },
      );
      return { contents, loader: args.path.endsWith(".jsx") ? "jsx" : "js" };
    });
  },
};

async function extractOne(fileName, exportName) {
  const entryPath = path.resolve(FRONTEND_SRC, "data", fileName);

  const result = await build({
    entryPoints: [entryPath],
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    plugins: [lucideToNameStringsPlugin, imageStubPlugin],
  });

  const code = result.outputFiles[0].text;
  const module = { exports: {} };
  const context = vm.createContext({ module, exports: module.exports, require, console });
  vm.runInContext(code, context);

  return module.exports[exportName];
}

async function main() {
  try {
    mkdirSync(FIXTURES_DIR, { recursive: true });
  } catch (err) {
    if (err?.code !== "EEXIST") throw err;
  }

  const projects = await extractOne("projects.js", "PROJECTS");
  writeFileSync(path.resolve(FIXTURES_DIR, "projects.json"), JSON.stringify(projects, null, 2));
  console.log(`Extracted ${projects.length} projects -> prisma/fixtures/projects.json`);

  const services = await extractOne("services.js", "SERVICE_CATEGORIES");
  writeFileSync(path.resolve(FIXTURES_DIR, "services.json"), JSON.stringify(services, null, 2));
  console.log(`Extracted ${services.length} service categories -> prisma/fixtures/services.json`);

  const reviews = await extractOne("reviews.js", "REVIEWS");
  writeFileSync(path.resolve(FIXTURES_DIR, "reviews.json"), JSON.stringify(reviews, null, 2));
  console.log(`Extracted ${reviews.length} reviews -> prisma/fixtures/reviews.json`);

  // TEAM lives inline in AboutPage.jsx (a real React page, not a plain data
  // file) — bundling/executing the whole page would drag in framer-motion,
  // react-router, GSAP, etc. for no reason. A targeted regex is safer here:
  // the array's shape is simple and stable (name/role/photo-import-var).
  const aboutSrc = await readFile(path.resolve(FRONTEND_SRC, "pages/AboutPage.jsx"), "utf8");

  const importMap = new Map();
  for (const m of aboutSrc.matchAll(/import\s+(\w+)\s+from\s+["']\.\.\/assets\/([^"']+)["'];/g)) {
    importMap.set(m[1], `src/assets/${m[2]}`);
  }

  const teamBlockMatch = aboutSrc.match(/const TEAM = \[([\s\S]*?)\n\];/);
  const team = [];
  if (teamBlockMatch) {
    for (const m of teamBlockMatch[1].matchAll(
      /name:\s*"([^"]+)",\s*role:\s*"([^"]+)",\s*photo:\s*(\w+),/g,
    )) {
      team.push({ name: m[1], role: m[2], photo: importMap.get(m[3]) ?? null });
    }
  }
  writeFileSync(path.resolve(FIXTURES_DIR, "team.json"), JSON.stringify(team, null, 2));
  console.log(`Extracted ${team.length} team members -> prisma/fixtures/team.json`);

  console.log("\nDone. Review the fixtures, then run: bun run db:seed");
  console.log(
    "Note: `photo`/`gallery`/`screenshots` paths are relative source paths, not\n" +
      "uploaded assets yet — the seed script creates placeholder Asset rows\n" +
      "pointing at these paths; re-upload the real files through the admin\n" +
      "panel (or a follow-up script) once Cloudinary credentials are set.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
