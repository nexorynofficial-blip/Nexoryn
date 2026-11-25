import { Fragment, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import SplitText from "../components/ui/SplitText";
import Reveal from "../components/ui/Reveal";
import { SectionsBackground } from "../components/SectionsBackground";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import { getPostBySlug, formatPostDate, slugifyHeading } from "../data/blogPosts";
import { BLOG_IMAGES } from "../data/blogImages";
import { buildBlogJsonLd } from "../lib/blogSchema";

const LINK_CLASS =
  "font-medium text-accent-to underline underline-offset-2 transition-colors duration-300 hover:text-accent-from";

// Inline markup used in the post data: **bold** and [label](/internal-path).
const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function Inline({ text }) {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return /^https?:/.test(link[2]) ? (
        <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
          {link[1]}
        </a>
      ) : (
        <Link key={i} to={link[2]} className={LINK_CLASS}>
          {link[1]}
        </Link>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function Block({ block }) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          id={slugifyHeading(block.text)}
          className="mt-14 scroll-mt-28 font-heading text-2xl leading-tight tracking-tight text-white first:mt-0 md:text-3xl"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          id={slugifyHeading(block.text)}
          className="mt-10 scroll-mt-28 font-heading text-xl leading-tight tracking-tight text-white md:text-2xl"
        >
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p className="mt-5 text-base font-light leading-[1.8] text-body-dim md:text-lg">
          <Inline text={block.text} />
        </p>
      );
    case "ul":
    case "ol": {
      const Tag = block.type;
      return (
        <Tag
          className={`mt-5 space-y-3 pl-6 text-base font-light leading-relaxed text-body-dim marker:text-accent-from md:text-lg ${
            block.type === "ol" ? "list-decimal" : "list-disc"
          }`}
        >
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              <Inline text={item} />
            </li>
          ))}
        </Tag>
      );
    }
    case "table":
      return (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm md:text-base">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04]">
                {block.head.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-accent-from">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b border-white/[0.06] last:border-0">
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={`px-4 py-3 align-top font-light ${c === 0 ? "font-medium text-white" : "text-body-dim"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "img":
      return (
        <figure className="mt-8">
          <img
            src={BLOG_IMAGES[block.imageKey]}
            alt={block.alt}
            width={block.width}
            height={block.height}
            data-file={block.file}
            loading="lazy"
            decoding="async"
            className={`h-auto w-full rounded-2xl border border-white/10 ${block.narrow ? "mx-auto max-w-md" : ""}`}
          />
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm font-light text-white/50">{block.caption}</figcaption>
          )}
        </figure>
      );
    case "cta":
      return (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-accent-from/25 bg-accent-from/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-medium text-white md:text-lg">{block.text}</p>
          <Link
            to={block.to}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-accent-from to-accent-to px-6 py-3 text-xs font-bold uppercase tracking-wide text-black"
          >
            {block.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      );
    case "faq":
      return (
        <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/30">
          {block.items.map((item) => (
            <div key={item.q} className="p-5 md:p-6">
              <h3 className="text-base font-semibold text-white md:text-lg">{item.q}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-body-dim md:text-base">
                <Inline text={item.a} />
              </p>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function Byline({ post }) {
  return (
    <div className="mt-14 border-t border-white/10 pt-8 text-sm font-light leading-relaxed text-body-dim md:text-[15px]">
      <p>{post.byline}</p>
      <p className="mt-3 text-white">
        <span className="font-semibold">{post.author.name}</span>
        <span className="text-white/50">, {post.author.title}, Nexoryn · </span>
        <a
          href={post.author.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-to underline underline-offset-2 transition-colors duration-300 hover:text-accent-from"
        >
          LinkedIn
        </a>
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/50">
        Last updated: <time dateTime={post.dateModified}>{formatPostDate(post.dateModified)}</time>
      </p>
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  useEffect(() => {
    document.title = post ? post.seoTitle : "Article not found - Nexoryn";
    if (!post) return undefined;

    // The static page (built by scripts/seo-pages.mjs) already carries this
    // description and schema; these keep them right when the visitor arrives
    // by navigating inside the app instead.
    const meta = document.querySelector('meta[name="description"]');
    const previous = meta?.getAttribute("content");
    meta?.setAttribute("content", post.metaDescription);

    let script = document.getElementById("blog-jsonld");
    const created = !script;
    if (created) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "blog-jsonld";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(buildBlogJsonLd(post));

    return () => {
      if (previous != null) meta?.setAttribute("content", previous);
      if (created) script.remove();
    };
  }, [post]);

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="font-heading text-3xl text-white">Article not found</h1>
        <Link to="/blog" className="text-sm font-semibold uppercase tracking-wider text-accent-from">
          Back to all articles
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <article className="relative z-20 w-full px-4 pb-24 pt-32 md:px-10 lg:pt-40">
          <div className="mx-auto max-w-3xl">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/60 transition-colors duration-300 hover:text-accent-from"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All articles
            </Link>

            <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              <span className="text-accent-from">{post.category}</span>
              <time dateTime={post.datePublished}>{formatPostDate(post.datePublished)}</time>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {post.readMinutes} min read
              </span>
            </p>

            <SplitText
              as="h1"
              animateOnMount
              delay={0.08}
              className="mt-4 font-heading text-3xl leading-tight tracking-tight text-white sm:text-4xl md:text-5xl"
            >
              {post.title}
            </SplitText>

            <Reveal y={24} delay={0.2} animateOnMount className="mt-10">
              <img
                src={BLOG_IMAGES[post.image]}
                alt={post.imageAlt}
                width={1600}
                height={837}
                decoding="async"
                className="h-auto w-full rounded-2xl border border-white/10"
              />
            </Reveal>

            <p className="mt-8 text-lg font-medium leading-[1.75] text-white md:text-xl">{post.intro}</p>

            <div className="mt-10">
              {post.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>

            <Byline post={post} />
          </div>
        </article>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-b from-transparent to-black md:h-40"
        />
      </div>

      <CTASection compact />
      <Footer />
    </>
  );
}
