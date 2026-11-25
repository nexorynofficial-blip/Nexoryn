import websiteDevBanner from "../assets/blog/website-development-services-banner.webp";
import fiveComponents from "../assets/blog/website-development-five-components.webp";
import pricingOverview from "../assets/blog/website-development-pricing.webp";
import vettingChecklist from "../assets/blog/website-agency-vetting-checklist.webp";
import processFlow from "../assets/blog/website-development-process.webp";

/**
 * Blog / article posts, newest first. The list page and the post page both read
 * from here; add a new object at the top of the array to publish another one.
 *
 * `blocks` is the article body. Supported block types:
 *   { type: "p",     text }                      paragraph
 *   { type: "h2",    text }                      section heading
 *   { type: "ul" | "ol", items: [text, ...] }    list
 *   { type: "table", head: [..], rows: [[..]] }  table
 *   { type: "img",   src, alt }                  figure
 *   { type: "cta",   text, label, to }           call-out with a button
 *   { type: "faq",   items: [{ q, a }] }         question / answer list
 * Any text string may contain inline links written as [label](/path).
 */
export const BLOG_POSTS = [
  {
    slug: "website-development-services-whats-included-2026-pricing",
    title: "Website Development Services: What's Included + 2026 Pricing",
    category: "Web Development",
    date: "2026-11-25",
    readMinutes: 8,
    excerpt:
      "What website development services actually include, what drives the price, what to check before you sign, and why the build should connect to your automation from day one.",
    image: websiteDevBanner,
    imageAlt: "Website Development Services: What's Included and 2026 Pricing",
    blocks: [
      {
        type: "p",
        text: "Most website development services pages tell you what an agency does. Few tell you what it costs or how the build connects to the systems that actually run your business afterward. Website development services cover the full design and technical build of a site (the front-end, the back-end, and the infrastructure behind it), and projects for mid-sized companies typically run $1,500 to $75,000+ depending on scope. This guide breaks down what's included, what drives the price, what to check before you sign, and why the build should connect to your automation from day one.",
      },

      { type: "h2", text: "What \"website development services\" actually includes" },
      {
        type: "p",
        text: "Website development services cover the full technical build of a site: the front-end people see, the back-end that runs it, the content system behind it, hosting, and testing before launch.",
      },
      {
        type: "p",
        text: "That's five distinct pieces, and a vendor quoting only one or two of them is quoting an incomplete project:",
      },
      {
        type: "ul",
        items: [
          "**Front-end:** the pages, layout, and interactions a visitor sees and clicks through.",
          "**Back-end:** the server logic, databases, and APIs that make forms, logins, and dynamic content actually work.",
          "**CMS:** the system your team uses to update pages, blog posts, or product listings without a developer.",
          "**Hosting and infrastructure:** where the site lives, how fast it loads, and how it handles traffic spikes.",
          "**QA and testing:** checking the site across browsers, devices, and edge cases before it goes live.",
        ],
      },
      { type: "p", text: "Skip any one of these and you end up patching problems after launch instead of before it." },
      {
        type: "img",
        src: fiveComponents,
        alt: "The five components of a website development service: front-end, back-end, CMS, hosting, and QA.",
      },

      { type: "h2", text: "Website design vs. website development (the difference)" },
      {
        type: "p",
        text: "Design is how the site looks and feels. Development is the engineering that makes it work. You need both, and splitting them between two uncoordinated vendors is a common source of delays.",
      },
      {
        type: "table",
        head: ["", "Focuses on", "Typical deliverable"],
        rows: [
          ["Website design", "Layout, visuals, user experience", "Mockups, style guide"],
          ["Website development", "Code, databases, integrations", "A working, deployed site"],
        ],
      },

      { type: "h2", text: "Types of website development services (by project)" },
      {
        type: "p",
        text: "Not every \"website\" is the same build. The scope, timeline, and price shift a lot depending on what you're actually asking for.",
      },
      {
        type: "table",
        head: ["Service type", "Typical use case", "Typical timeline"],
        rows: [
          ["Business/marketing site", "Lead generation, company presence", "1–3 weeks"],
          ["Web application", "Customer portals, internal tools", "3–6 weeks"],
          ["E-commerce build", "Online stores, product catalogs", "2–4 weeks"],
          ["CMS or headless build", "Content-heavy sites, multi-channel publishing", "1–3 weeks"],
          ["API/third-party integration", "Connecting a site to existing business tools", "Varies by system (minor compression only)"],
        ],
      },
      {
        type: "p",
        text: "See how we approach [custom web applications](/services), [e-commerce development](/services), and [headless CMS builds](/services) on our services page.",
      },
      {
        type: "p",
        text: "A marketing site and a web application are not the same project, even if both get called \"a website\" by the person requesting them. Confirm which one you actually need before you request quotes. It changes the timeline and the price by a wide margin.",
      },

      { type: "h2", text: "How much do website development services cost?" },
      {
        type: "table",
        head: ["Project type", "Typical range", "What's usually included"],
        rows: [
          ["Simple business site (5–10 pages)", "$1,500–$5,000", "Design, CMS setup, basic SEO"],
          ["Mid-size business site", "$5,000–$15,000", "Custom design, integrations, content migration"],
          ["Custom web application", "$15,000–$50,000+", "Custom features, database design, ongoing dev"],
        ],
      },
      {
        type: "p",
        text: "The published ranges across agency sites vary this much because the real cost driver isn't the vendor's rate. It's scope. A five-page brochure site and a site with a customer login, a booking system, and three third-party integrations aren't priced the same way, even if both get called \"a business website.\"",
      },
      {
        type: "p",
        text: "The number that matters more than the headline price is what's excluded. Ask for a line-item breakdown, not a single total, before you compare quotes.",
      },
      {
        type: "img",
        src: pricingOverview,
        alt: "Website development pricing by project type, from simple business sites to custom web applications.",
        narrow: true,
      },
      {
        type: "p",
        text: "Want the full automation and web development pricing breakdown for your project? [Talk to us](/contact) and we'll scope it with you.",
      },

      { type: "h2", text: "What to look for in a website development agency" },
      {
        type: "p",
        text: "A portfolio full of polished screenshots doesn't tell you much about how a vendor actually works. These signals do:",
      },
      {
        type: "ul",
        items: [
          "Have they built sites in your industry, or a comparable one?",
          "Do they walk you through a clear process: discovery, design, build, QA, launch?",
          "What happens after launch? Is support included, or billed separately?",
          "How do they handle scope changes mid-project?",
          "Do they show you a real, working staging site before launch, not just mockups?",
          "Who owns the code and the CMS login after the project ends?",
          "Can they explain their tech stack in plain language, without dodging the question?",
          "Do they have a documented QA process, or do they say \"we test everything\" with no specifics?",
        ],
      },
      {
        type: "img",
        src: vettingChecklist,
        alt: "Checklist for vetting a website development agency before you sign.",
        narrow: true,
      },
      {
        type: "p",
        text: "Run any vendor through this list before you sign anything. Have us walk through your project against it, and we'll answer every item directly. [Request a free audit](/contact).",
      },

      { type: "h2", text: "Questions to ask before you sign" },
      { type: "p", text: "Bring these into any vendor call or RFP:" },
      {
        type: "ul",
        items: [
          "What's included in the quoted price, and what's billed separately?",
          "Who owns the final code, content, and login credentials?",
          "What does post-launch support cost, and what does it cover?",
          "How do you handle a scope change once the build has started?",
          "Can you show a site you've built that's still live and maintained today?",
        ],
      },

      { type: "h2", text: "Why the best sites are built to work with your automation" },
      {
        type: "p",
        text: "Most agencies hand off a finished site and consider the project done. The systems that actually run the business afterward (lead routing, CRM updates, chatbots, booking flows) get bolted on separately, often by a second vendor who didn't build the site.",
      },
      {
        type: "p",
        text: "Picture a company that launches a new site. Six months later, they hire a different team to add a chatbot and connect it to their CRM. The two systems weren't designed together. The handoff is clunky: leads sit in the wrong place, follow-ups get missed, and fixing it afterward costs more than building it right the first time would have.",
      },
      {
        type: "p",
        text: "A site built alongside its automation layer avoids that gap. The forms, the chat widget, and the backend workflow routing a lead to the right person are planned as one system, not stitched together after the fact. Learn more about our [workflow automation](/services) and [AI agents for your business](/services).",
      },
      {
        type: "cta",
        text: "See how a site and its automation can launch as one project, not two.",
        label: "See our work",
        to: "/portfolio",
      },

      { type: "h2", text: "Our process (and what it costs)" },
      {
        type: "p",
        text: "A clear process is the best predictor of whether a project stays on budget. Here's the typical flow:",
      },
      {
        type: "ol",
        items: [
          "**Discovery:** defining goals, audience, and must-have features.",
          "**Scope and quote:** a line-item breakdown, not a single number.",
          "**Design and build:** front-end and back-end development in parallel.",
          "**Integrate automation:** connecting the site to CRM, chat, or workflow tools from the start, not after.",
          "**Launch and support:** QA, go-live, and a defined post-launch support plan.",
        ],
      },
      {
        type: "img",
        src: processFlow,
        alt: "Nexoryn's website development process from discovery to post-launch support.",
      },
      {
        type: "p",
        text: "Pricing is set after discovery and scope, not quoted blind before anyone understands what you need. That's also when timelines and payment milestones get fixed, so the number you sign off on doesn't move once the build starts. For ongoing [performance and SEO optimization](/services) after launch, see our services.",
      },

      { type: "h2", text: "FAQ" },
      {
        type: "faq",
        items: [
          {
            q: "How much do website development services cost?",
            a: "It depends on scope more than anything else. Simple business sites run $1,500–$5,000; custom web applications with integrations run $15,000–$50,000+. Get a line-item quote, not a single number, so you know exactly what you're paying for.",
          },
          {
            q: "What's the difference between web design and web development?",
            a: "Design covers how the site looks and feels. Development is the engineering (code, databases, integrations) that makes it work. Most projects need both handled by one coordinated team.",
          },
          {
            q: "How long does a website development project take?",
            a: "It depends on project type. A business or marketing site typically takes 1–3 weeks, a web application 3–6 weeks, and an e-commerce build 2–4 weeks. See the full breakdown above.",
          },
          {
            q: "Do I need ongoing support after launch?",
            a: "Yes, at minimum for security updates and bug fixes. If your site connects to automation or integrations, make sure the support plan covers those connections too, not just the CMS.",
          },
          {
            q: "Should I hire a freelancer or an agency?",
            a: "Freelancers often cost less; agencies usually offer more accountability and bandwidth for larger projects. Use the vetting checklist above regardless of which you choose.",
          },
          {
            q: "Can my website connect to my CRM, booking tools, or AI chat agents?",
            a: "Yes, this is standard for a modern business site, including [AI chat and voice agents](/services). It works best when it's planned into the build from the start, not added later.",
          },
          {
            q: "What should I ask a website development company before signing?",
            a: "Cover ownership of code and logins, what's included in the price, how scope changes are handled, and post-launch support terms. See the full question list above before any vendor call.",
          },
        ],
      },

      {
        type: "p",
        text: "Website development services done right cover the full build (front-end, back-end, CMS, hosting, and QA), priced against your actual scope, not a generic rate card. The agencies worth hiring explain their process clearly and plan your automation into the build from day one. Send us your project details and we'll walk through scope and pricing with you directly.",
      },
      {
        type: "cta",
        text: "Ready to scope your project?",
        label: "Get a project-based quote",
        to: "/contact",
      },
    ],
  },
];

export const getPostBySlug = (slug) => BLOG_POSTS.find((p) => p.slug === slug);

export const formatPostDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
