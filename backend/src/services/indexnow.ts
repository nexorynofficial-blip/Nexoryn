// IndexNow: tells Bing (and other participating engines) that a URL was added,
// changed or removed, so it is crawled in hours instead of whenever Bing next
// gets round to it. The key is public by design: it is also served as a text
// file at the site root (public/<key>.txt), which is how the engine verifies
// the request really comes from the site's owner.
const SITE_HOST = "www.nexoryn.tech";
const KEY = process.env.INDEXNOW_KEY ?? "d99ad2e374883d534bb99c7167640a44";

export async function pingIndexNow(paths: string[]): Promise<void> {
  if (process.env.NODE_ENV !== "production" || paths.length === 0) return;
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key: KEY,
        keyLocation: `https://${SITE_HOST}/${KEY}.txt`,
        urlList: paths.map((p) => `https://${SITE_HOST}${p}`),
      }),
      // Serverless: the request must finish before the response is sent, so
      // keep it short and never let a slow engine hold up (or fail) an admin save.
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    /* best effort: a missed ping only means Bing finds the page by sitemap */
  }
}
