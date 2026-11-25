// Shared by the article page (client side) and scripts/seo-pages.mjs (the
// static HTML each article is built with), so both emit identical JSON-LD.
// Plain JS with no imports, so Node can load it.

export const SITE_URL = "https://www.nexoryn.tech";

/** Turns the post markup ([label](/path) and **bold**) into plain text. */
export const stripInline = (text) =>
  text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");

export const postUrl = (post) => `${SITE_URL}/blog/${post.slug}`;
export const postOgImage = (post) => `${SITE_URL}${post.ogImage}`;

export function buildBlogJsonLd(post) {
  const url = postUrl(post);
  const faq = post.blocks.find((b) => b.type === "faq");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.metaDescription,
        image: postOgImage(post),
        author: {
          "@type": "Person",
          name: post.author.name,
          jobTitle: post.author.title,
          url: post.author.url,
          worksFor: { "@type": "Organization", name: "Nexoryn" },
        },
        publisher: {
          "@type": "Organization",
          name: "Nexoryn",
          url: SITE_URL,
          logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
        },
        datePublished: post.datePublished,
        dateModified: post.dateModified,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
      ...(faq
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faq.items.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: stripInline(item.a) },
              })),
            },
          ]
        : []),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };
}
