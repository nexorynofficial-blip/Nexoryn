import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock } from "lucide-react";
import SplitText from "../components/ui/SplitText";
import Reveal from "../components/ui/Reveal";
import { SectionsBackground } from "../components/SectionsBackground";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import { BLOG_POSTS, formatPostDate } from "../data/blogPosts";
import { BLOG_IMAGES } from "../data/blogImages";

function PostCard({ post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[linear-gradient(160deg,rgba(107,37,8,0.4)_0%,rgba(20,8,3,0.88)_35%,#050505_70%)] p-3 transition duration-500 hover:-translate-y-1.5 hover:border-accent-from/40 hover:shadow-[0_24px_60px_-18px_rgba(255,122,26,0.35)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0d0d]">
        <img
          src={BLOG_IMAGES[post.image]}
          alt={post.imageAlt}
          width={800}
          height={450}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
          <time dateTime={post.datePublished}>{formatPostDate(post.datePublished)}</time>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {post.readMinutes} min read
          </span>
        </p>
        <h2 className="mt-3 font-heading text-lg font-extrabold leading-tight text-white md:text-xl">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-body-dim">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-xs font-bold uppercase tracking-[0.12em] text-accent-from">
          Read Article
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  useEffect(() => {
    document.title = "Blog - Nexoryn";
  }, []);

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-20 w-full px-4 pb-24 pt-32 md:px-10 lg:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            <SplitText
              as="h1"
              animateOnMount
              delay={0.08}
              className="font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl"
            >
              Insights & <span className="text-accent-from">Articles</span>
            </SplitText>
            <Reveal
              as="p"
              y={24}
              delay={0.2}
              animateOnMount
              className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-body-dim"
            >
              Practical guides on websites, automation and AI, written for
              businesses that want to build it right.
            </Reveal>
          </div>

          <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>

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
