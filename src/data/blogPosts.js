/**
 * Blog / article posts, newest first. The list page, the post page and the
 * build-time SEO script (scripts/seo-pages.mjs) all read from here; add a new
 * object at the top of the array to publish another one. No asset imports in
 * this file, so plain Node can load it: images are named by key and resolved
 * through blogImages.js.
 *
 * `blocks` is the article body (after the intro). Block types:
 *   { type: "p",     text }                                paragraph
 *   { type: "h2" | "h3", text }                            heading (feeds the table of contents)
 *   { type: "ul" | "ol", items: [text, ...] }              list
 *   { type: "table", head: [..], rows: [[..]] }            table
 *   { type: "img",   imageKey, file, alt, caption }        figure
 *   { type: "cta",   text, label, to }                     call-out with a button
 *   { type: "faq",   items: [{ q, a }] }                   question / answer list
 * Any text string may contain inline links written as [label](/path) and
 * **bold**.
 */

// Link targets. The article was written against these pillar pages:
//   /services/web-applications, /services/ecommerce-development,
//   /services/cms-headless-development, /services/workflow-automation,
//   /services/ai-agents, /services/performance-seo,
//   /services/voice-ai-agents, /pricing
// None of those exist on the live site yet (Services is a single page with
// tabs, and there is no pricing page), so each link falls back to the closest
// live page. When a pillar page ships, change its entry here and every link in
// the article follows.
export const LINKS = {
  webApplications: "/services", // wanted: /services/web-applications
  ecommerce: "/services", // wanted: /services/ecommerce-development
  headlessCms: "/services", // wanted: /services/cms-headless-development
  pricing: "/contact", // wanted: /pricing
  audit: "/contact",
  workflowAutomation: "/services", // wanted: /services/workflow-automation
  aiAgents: "/services", // wanted: /services/ai-agents
  portfolio: "/portfolio",
  performanceSeo: "/services", // wanted: /services/performance-seo
  voiceAgents: "/services", // wanted: /services/voice-ai-agents
  websiteDevelopment: "/blog/website-development-services-whats-included-2026-pricing", // wanted: /services/website-development
  integrations: "/services", // wanted: /services/api-integrations
};

const L = LINKS;

export const BLOG_POSTS = [
  {
    slug: "ai-automation-company-what-they-do-cost-how-to-vet-one",
    title: "AI Automation Company: What They Do, Cost & How to Vet One",
    seoTitle: "AI Automation Company: Cost & How to Vet One | Nexoryn",
    metaDescription:
      "What an AI automation company does, what projects cost ($1,000–$110,000), and how to check a vendor's system is live in production, not a demo.",
    category: "AI Automation",
    datePublished: "2026-11-26",
    dateModified: "2026-11-26",
    readMinutes: 7,
    excerpt:
      "What an AI automation company really does, what projects cost, how long they take, and the questions that separate a system running in production from a recorded demo.",
    image: "ai-thumbnail",
    imageAlt: "AI automation company: what they do, cost, and how to vet one — Nexoryn",
    ogImage: "/blog/images/ai-automation-company-thumbnail.png",
    author: {
      name: "Waseem",
      title: "Co-Founder",
      url: "https://www.linkedin.com/in/waseem-farooq-758a74251/",
    },
    byline:
      "Written by the Nexoryn team that scopes and builds these projects — not a content writer summarizing other agencies' pages.",
    intro:
      "Most companies searching for an AI automation company run into the same problem: half the vendors they talk to are selling a chatbot demo dressed up as \"full automation.\" An AI automation company designs, builds, and maintains AI-driven systems that handle work your team currently does by hand — not just licenses you a tool and walks away. This guide covers what these companies actually do, what projects really cost, and how to tell a vendor whose system is live in production from one who's still showing you a recording.",
    blocks: [
      { type: "h2", text: "What does an AI automation company actually do?" },
      {
        type: "p",
        text: "An AI automation company designs, builds, and maintains AI-driven systems that handle judgment-based work on your behalf — reading documents, routing requests, answering customer questions, and deciding what happens next — rather than just selling you a tool and leaving you to configure and run it yourself. That's the core distinction between a true automation company and a software vendor.",
      },
      { type: "p", text: "The distinction matters because a lot of \"AI automation\" marketing blurs the two. A real automation company:" },
      {
        type: "ul",
        items: [
          "Maps your actual workflow before building anything.",
          "Builds or configures the AI system to fit that workflow, not a generic template.",
          "Connects it to your existing tools (CRM, ERP, email, chat).",
          "Stays on to monitor and fix it after launch.",
        ],
      },
      {
        type: "img",
        imageKey: "ai-manual-to-automated",
        width: 1600,
        height: 900,
        file: "ai-automation-manual-to-automated",
        alt: "How an AI automation company turns a manual workflow into an automated one.",
        caption: "From a manual process to an automated one.",
      },

      { type: "h3", text: "AI automation vs. RPA — what's the difference?" },
      {
        type: "p",
        text: "Robotic process automation follows fixed rules: click here, copy this, paste there. AI automation handles judgment calls RPA can't — reading an unstructured email and deciding what it means, for example.",
      },
      {
        type: "table",
        head: ["", "Robotic process automation (RPA)", "AI automation"],
        rows: [
          ["Handles", "Fixed, rule-based steps", "Judgment-based, variable work"],
          ["Breaks when", "The input format changes", "Rarely — it adapts within limits"],
        ],
      },

      { type: "h2", text: "What services does an AI automation company offer?" },
      {
        type: "p",
        text: "Most AI automation companies cover a handful of overlapping service lines. Knowing the names helps you ask for the right thing.",
      },
      {
        type: "table",
        head: ["Service", "What it replaces", "Typical use case"],
        rows: [
          ["Workflow automation", "Manual data entry and routing between systems", "Moving a lead from your website to your CRM automatically"],
          ["Voice AI agents", "A human answering routine phone calls", "After-hours booking or support calls"],
          ["LLM workflows & AI agents", "A person reading and summarizing documents or tickets", "Triaging support tickets, summarizing contracts"],
          ["Data/document automation", "Manual data extraction from PDFs or forms", "Processing invoices or applications"],
          ["Chatbot/customer-facing automation", "A support rep answering common questions", "Website chat that resolves simple requests before escalating"],
        ],
      },
      {
        type: "p",
        text: `See how we approach [workflow automation](${L.workflowAutomation}), [LLM workflows and AI agents](${L.aiAgents}), and [voice AI agents](${L.voiceAgents}) on our services page.`,
      },
      {
        type: "p",
        text: "A vendor who can only build one of these is a specialist, not a full-service automation company. Neither is wrong — just confirm which one you're hiring before you sign.",
      },

      { type: "h2", text: "How much does an AI automation company cost?" },
      {
        type: "table",
        head: ["Project type", "Typical range", "What's usually included"],
        rows: [
          ["Single-workflow automation", "$1,000–$10,000", "One process mapped, built, and connected to one or two tools"],
          ["Multi-system integration", "$10,000–$35,000", "Several workflows, multiple tool connections, exception handling"],
          ["Custom AI agent build", "$35,000–$110,000", "A bespoke agent handling judgment-based tasks across systems"],
        ],
      },
      {
        type: "p",
        text: "Published pricing varies this much for a real reason: a platform-licensing fee and a custom build are priced on completely different models. Licensing a tool is a subscription. A custom build is a project — you're paying for the discovery, the integration work, and the ongoing monitoring, not just the software.",
      },
      {
        type: "p",
        text: "Ask which model a quote is based on before you compare two numbers side by side — a $2,000 licensing quote and a $90,000 custom-build quote aren't competing for the same job.",
      },
      {
        type: "img",
        imageKey: "ai-pricing-table",
        width: 1122,
        height: 1402,
        file: "ai-automation-pricing-table",
        alt: "AI automation pricing by project type, from single-workflow automation to custom AI agent builds.",
        caption: "Typical AI automation costs by project type.",
        narrow: true,
      },
      {
        type: "p",
        text: `Want the [full automation and web development pricing breakdown](${L.pricing}) for your project? Talk to us and we'll scope it with you.`,
      },

      { type: "h2", text: "How long does AI automation implementation take?" },
      {
        type: "table",
        head: ["Project type", "Typical timeline"],
        rows: [
          ["Single-workflow automation", "1–3 weeks"],
          ["Multi-system integration", "4–7 weeks"],
          ["Custom AI agent build", "1–3 months"],
        ],
      },
      {
        type: "p",
        text: "Three things stretch a timeline past the estimate. Legacy systems with no clean way to connect are one. Approval chains that need sign-off at every step are another. Messy data that needs cleanup before an AI system can trust it is the third. Ask a vendor which of these applies to your setup. A good one will flag it during discovery, not after the project starts slipping.",
      },

      { type: "h2", text: "How to tell if a vendor's automation is actually running in production" },
      {
        type: "p",
        text: "This is the question most buyers forget to ask, and it's the one that separates a real vendor from a demo artist. Run through this before you sign anything:",
      },
      {
        type: "ol",
        items: [
          "Ask to see the system running live, not a recorded demo.",
          "Ask what happens when it hits a case it can't handle — a good system escalates to a person; a weak one just fails silently.",
          "Ask who monitors it after launch, and how often.",
          "Ask for one reference you can actually contact, not a quote on a slide.",
          "Ask how long their oldest live deployment has been running without a rebuild.",
          "Ask what data the system needs access to, and who controls that access.",
        ],
      },
      {
        type: "img",
        imageKey: "ai-verification-checklist",
        width: 1086,
        height: 1448,
        file: "ai-automation-vendor-verification-checklist",
        alt: "Checklist for verifying an AI automation vendor's system is live, not a demo.",
        caption: "Use this checklist before you sign with any AI automation vendor.",
        narrow: true,
      },
      {
        type: "p",
        text: `Not sure what to ask yet? Send us a quote you already have and we'll walk through it with you. [Request a free audit](${L.audit}).`,
      },

      { type: "h2", text: "Red flags when hiring an AI automation company" },
      { type: "p", text: "Watch for these before you commit:" },
      {
        type: "ul",
        items: [
          "**Vague \"AI-powered\" claims with no specifics** — if they can't name the model or method, they may not know either.",
          "**No named, checkable case study** — a result you can't verify isn't a result.",
          "**Stale or unverifiable reviews** — check the dates, not just the star rating.",
          "**Pricing that's never broken down** — a single lump number with no line items is a red flag, not a simplicity.",
          "**No clear answer on who owns the code and data after delivery** — get this in writing before you start.",
        ],
      },

      { type: "h2", text: "Why the best AI automation company also builds your website" },
      {
        type: "p",
        text: "Most AI automation vendors treat your website as someone else's problem. They'll connect a chatbot or a lead-routing workflow to whatever site you already have. They won't check whether that site was actually built to carry it. Six months later, the automation vendor and the web vendor are both pointing at each other when something breaks.",
      },
      {
        type: "table",
        head: ["", "Typical AI vendor", "Typical web agency", "Nexoryn"],
        rows: [
          ["Builds the automation", "Yes", "No", "Yes"],
          ["Builds the website", "No", "Yes", "Yes"],
          ["Plans both together from the start", "Rarely", "Rarely", "Yes"],
          [
            "Who you call when the integration breaks",
            "Them, probably pointing at your web vendor",
            "Them, probably pointing at your AI vendor",
            "One team",
          ],
        ],
      },
      {
        type: "p",
        text: `Read more about our [website development services](${L.websiteDevelopment}) and our [API and third-party integrations](${L.integrations}).`,
      },
      {
        type: "cta",
        text: "See how we've shipped a site and its automation as one project, not two.",
        label: "See our work",
        to: L.portfolio,
      },

      { type: "h2", text: "Our process and pricing model" },
      {
        type: "p",
        text: "A clear process tells you more about a vendor than their website copy does. Here's the typical flow for a real engagement:",
      },
      {
        type: "ol",
        items: [
          "**Discovery:** understanding what you actually need automated, and why.",
          "**Process audit:** mapping the current manual workflow in detail.",
          "**Build:** developing and configuring the automation.",
          "**Integrate with your site:** connecting it to the systems your customers actually touch.",
          "**Launch and monitor:** going live, then watching for exceptions and fixing them.",
        ],
      },
      {
        type: "img",
        imageKey: "ai-process-five-steps",
        width: 1600,
        height: 900,
        file: "ai-automation-process-five-steps",
        alt: "Nexoryn's AI automation process from discovery to post-launch monitoring.",
        caption: "Our five-step AI automation process.",
      },
      {
        type: "p",
        text: `Pricing is set after discovery and the process audit, not quoted blind before anyone has mapped what you actually need built. That's also when the timeline above gets fixed to your specific setup, so the number and the date you sign off on don't move once the build starts. For what comes next, see our [ongoing performance and SEO work](${L.performanceSeo}).`,
      },

      { type: "h2", text: "FAQ" },
      {
        type: "faq",
        items: [
          {
            q: "How much does an AI automation company cost?",
            a: "It depends heavily on the pricing model. A single-workflow automation runs $1,000–$10,000; a custom AI agent build runs $35,000–$110,000. Ask which model — licensing or custom build — a quote is based on before comparing numbers.",
          },
          {
            q: "How long does AI automation implementation take?",
            a: "Simple single-workflow projects typically take 1–3 weeks. Multi-system integrations run 4–7 weeks, and custom agent builds take 1–3 months, especially with legacy systems or messy data involved.",
          },
          {
            q: "What's the difference between RPA and AI automation?",
            a: "RPA follows fixed, rule-based steps and breaks when the input changes. AI automation handles judgment-based work and adapts within limits — it's built for the cases RPA can't touch.",
          },
          {
            q: "What are red flags of a bad AI automation vendor?",
            a: "Vague \"AI-powered\" claims with no specifics, no checkable case study, unverifiable reviews, and pricing that's never broken into line items. See the full list above before signing anything.",
          },
          {
            q: "How do I know if a vendor's automation is actually running in production?",
            a: "Ask to see it live, not in a recorded demo, and ask what happens when it hits a case it can't handle. A vendor who dodges either question probably doesn't have a production system yet.",
          },
          {
            q: "Can an AI automation company also build or update our website?",
            a: "Yes — and it's worth asking for upfront. A site and its automation planned together avoid the handoff gap that shows up when two separate vendors built them months apart.",
          },
          {
            q: "Do I need an AI automation company, or can my team build this ourselves?",
            a: "If you already have in-house engineering bandwidth, maybe. Most mid-sized companies don't, which is why they bring in a vendor rather than building and maintaining it themselves.",
          },
        ],
      },

      {
        type: "p",
        text: "AI automation companies vary widely in what they actually deliver, so the question isn't just \"what do they offer\" — it's whether what they've built is real, running, and maintained. Use the verification checklist above before you sign anything, and ask for a line-item quote, not a single number. If you want a team that plans your automation and your website as one project instead of two separate headaches, send us your details and we'll walk through it with you.",
      },
      {
        type: "cta",
        text: "Prefer a quicker chat? Use the contact form, or message us on WhatsApp.",
        label: "Get a project-based quote",
        to: "/contact",
      },
    ],
  },
  {
    slug: "website-development-services-whats-included-2026-pricing",
    title: "Website Development Services: What's Included and What It Costs",
    seoTitle: "Website Development Services: 2026 Pricing Guide | Nexoryn",
    metaDescription:
      "Compare website development services, real pricing, and what's included — see how Nexoryn builds sites wired to automation from day one.",
    category: "Web Development",
    datePublished: "2026-11-25",
    dateModified: "2026-11-25",
    readMinutes: 8,
    excerpt:
      "What website development services actually include, what drives the price, what to check before you sign, and why the build should connect to your automation from day one.",
    image: "thumbnail",
    imageAlt: "Website development services: what's included and 2026 pricing — Nexoryn",
    ogImage: "/blog/images/website-development-services-thumbnail.png",
    author: {
      name: "Waseem",
      title: "Co-Founder",
      url: "https://www.linkedin.com/in/waseem-farooq-758a74251/",
    },
    byline:
      "Written by the Nexoryn team that scopes and builds these projects — not a content writer summarizing other agencies' pages.",
    intro:
      "Website development services cover the full design and technical build of a website — the front-end interface, the back-end systems, the content management setup, and the hosting and testing that keep it running. For mid-sized companies, these projects typically cost between $1,500 and $75,000 or more, depending on scope.",
    blocks: [
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
        imageKey: "five-components",
        width: 1600,
        height: 900,
        file: "website-development-services-five-components",
        alt: "The five components of a website development service: front-end, back-end, CMS, hosting, and QA.",
        caption: "What's included in a full website development service.",
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
        text: `See how we approach [custom web applications](${L.webApplications}), [e-commerce development](${L.ecommerce}), and [headless CMS builds](${L.headlessCms}) on our services page.`,
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
        imageKey: "pricing-table",
        width: 1122,
        height: 1402,
        file: "website-development-services-pricing-table",
        alt: "Website development pricing by project type, from simple business sites to custom web applications.",
        caption: "Typical website development costs by project size.",
        narrow: true,
      },
      {
        type: "p",
        text: `Want the [full automation and web development pricing breakdown](${L.pricing}) for your project? Talk to us and we'll scope it with you.`,
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
        imageKey: "vetting-checklist",
        width: 1086,
        height: 1448,
        file: "website-development-agency-vetting-checklist",
        alt: "Checklist for vetting a website development agency before you sign.",
        caption: "Use this checklist before you sign with any agency.",
        narrow: true,
      },
      {
        type: "p",
        text: `Run any vendor through this list before you sign anything. Have us walk through your project against it, and we'll answer every item directly. Send a [free audit request](${L.audit}).`,
      },

      { type: "h3", text: "Questions to ask before you sign" },
      { type: "p", text: "Bring these into any vendor call or RFP:" },
      {
        type: "ul",
        items: [
          "What's included in the quoted price, and what's billed separately?",
          "Who owns the final code, content, and login credentials?",
          "What does post-launch support cost, and what does it cover?",
          "How do you handle a scope change once the build has started?",
          "Can you show a site you've built that's still live and maintained today?",
          "If my site needs to connect to a CRM, chatbot, or workflow tool, who builds and owns that integration?",
          "What happens if the vendor who built my automation isn't the same team maintaining my site a year from now?",
          "Do you test the site and its connected systems together, or only the site on its own?",
        ],
      },
      {
        type: "p",
        text: "Questions 6–8 are the ones a generic web-dev agency can't answer well — they're the gap this whole page is built around.",
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
        text: `A site built alongside its automation layer avoids that gap. The forms, the chat widget, and the backend workflow routing a lead to the right person are planned as one system, not stitched together after the fact. Learn more about our [workflow automation](${L.workflowAutomation}) and [AI agents for your business](${L.aiAgents}).`,
      },
      {
        type: "cta",
        text: "See how a site and its automation can launch as one project, not two.",
        label: "See our work",
        to: L.portfolio,
      },
      {
        type: "table",
        head: ["", "Typical web agency", "In-house hire", "Nexoryn"],
        rows: [
          ["Builds the website", "Yes", "Yes", "Yes"],
          [
            "Plans the automation layer (CRM, chat, workflows) into the build",
            "Rarely — usually a separate vendor afterward",
            "Depends on one person's bandwidth",
            "Yes, from discovery onward",
          ],
          [
            "Who owns the handoff between site and automation",
            "Nobody — falls between two vendors",
            "You",
            "One team, one scope",
          ],
          [
            "Ongoing support after launch",
            "Often a separate contract",
            "Depends on headcount",
            "Defined in the original scope",
          ],
        ],
      },
      {
        type: "p",
        text: "**The gap that costs you later isn't the website — it's who owns what happens after someone fills out the form.**",
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
        imageKey: "process-five-steps",
        width: 1600,
        height: 900,
        file: "website-development-process-five-steps",
        alt: "Nexoryn's website development process from discovery to post-launch support.",
        caption: "Our five-step website development process.",
      },
      {
        type: "p",
        text: `Pricing is set after discovery and scope, not quoted blind before anyone understands what you need. That's also when timelines and payment milestones get fixed, so the number you sign off on doesn't move once the build starts. For what comes next, see our [post-launch SEO and performance work](${L.performanceSeo}).`,
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
            a: "It depends on project type. A business or marketing site typically takes 1–3 weeks, a web application 3–6 weeks, and an e-commerce build 2–4 weeks.",
          },
          {
            q: "Do I need ongoing support after launch?",
            a: "Yes, at minimum for security updates and bug fixes. If your site connects to automation or integrations, make sure the support plan covers those connections too, not just the CMS.",
          },
          {
            q: "Should I hire a freelancer or an agency?",
            a: "Freelancers often cost less up front and can move quickly on a small, well-defined project. Agencies usually bring more accountability and bandwidth, which matters more as the project gets larger, more technical, or needs ongoing support. Neither is the right answer for everyone, so run whichever you're considering through the vetting checklist above and compare the answers.",
          },
          {
            q: "Can my website connect to my CRM, booking tools, or AI chat agents?",
            a: `Yes, this is standard for a modern business site, including [AI chat and voice agents](${L.voiceAgents}). It works best when it's planned into the build from the start, not added later.`,
          },
          {
            q: "What should I ask a website development company before signing?",
            a: "Cover ownership of code and logins, what's included in the price, how scope changes are handled, and post-launch support terms.",
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

/** "2026-11-25" -> "November 25, 2026" (fixed locale/zone so build and browser agree). */
export const formatPostDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};

export const slugifyHeading = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
