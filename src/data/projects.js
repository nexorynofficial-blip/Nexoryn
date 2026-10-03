import chatbotThumb from "../assets/project-ai-chatbot-thumb.webp";
import coldEmailThumb from "../assets/project-cold-email-thumb.webp";
import repurposingThumb from "../assets/project-content-repurposing-thumb.webp";
import aurumThumb from "../assets/project-aurum-thumb.webp";
import analyticsHubThumb from "../assets/project-analytics-hub-thumb.webp";
import execIntelligenceThumb from "../assets/project-exec-intelligence-thumb.webp";
import candidateScreeningThumb from "../assets/project-candidate-screening-thumb.webp";
import invoiceProcessingThumb from "../assets/project-invoice-processing-thumb.webp";
import restaurantStandeeThumb from "../assets/project-restaurant-standee-thumb.webp";
import wellnessFlyerThumb from "../assets/project-wellness-flyer-thumb.webp";
import sportsBillboardThumb from "../assets/project-sports-billboard-thumb.webp";
import candyPackagingThumb from "../assets/project-candy-packaging-thumb.webp";
import coffeeBrandThumb from "../assets/project-coffee-brand-thumb.webp";
import activismPosterThumb from "../assets/project-activism-poster-thumb.webp";
import luxuryFashionStandeeThumb from "../assets/project-luxury-fashion-standee-thumb.webp";
import citizenlinkThumb from "../assets/project-citizenlink-thumb.webp";

/**
 * The project list for cards and grids: title, short description, tags, service,
 * photo, slug. The long case-study content lives in projectCaseStudies.js and
 * is only loaded by the case-study page (see projectsFull.js), so it isn't
 * shipped to every visitor of the home page.
 */
export const PROJECTS = [
  {
    slug: "ai-customer-support-chatbot",
    title: "AI Customer Support Chatbot",
    industry: "E-Commerce",
    service: "Automation",
    description:
      "An AI chatbot that classifies and resolves Shopify support requests instantly, escalating refunds and complaints to a human over Slack.",
    tags: ["Automation", "n8n", "Ollama"],
    photo: chatbotThumb,
  },
  {
    slug: "personalized-cold-email-outreach",
    title: "Personalized Cold Email Outreach",
    industry: "SaaS & Tech",
    service: "Automation",
    description:
      "An AI-powered automation that generates personalized cold email openers, sends them at scale, and tracks engagement, all while managing duplicates and follow-ups intelligently.",
    tags: ["Automation", "n8n", "Llama"],
    photo: coldEmailThumb,
  },
  {
    slug: "intelligent-content-repurposing-approval-workflow",
    title: "Intelligent Content Repurposing With Approval Workflow",
    industry: "SaaS & Tech",
    service: "Automation",
    description:
      "An AI-powered automation that transforms long-form content into multi-platform social media posts with AI-generated visuals, routes everything through Slack for human approval, and publishes to Buffer.",
    tags: ["Automation", "n8n", "Llama", "Slack", "Buffer"],
    photo: repurposingThumb,
  },
  {
    slug: "aurum-luxury-ecommerce-platform",
    title: "Aurum Luxury E-Commerce Platform",
    industry: "E-Commerce",
    service: "Web Development",
    description:
      "An ultra-sophisticated e-commerce platform for luxury goods, combining light-theme minimalism, restrained glass morphism, and a signature Gold Thread scroll indicator with a full-stack backend for inventory, checkout, and order management.",
    tags: ["Web Design", "Full-Stack", "Luxury E-Commerce"],
    photo: aurumThumb,
  },
  {
    slug: "analytics-hub-saas-dashboard-platform",
    title: "Analytics Hub: SaaS Analytics Dashboard Platform",
    industry: "SaaS & Tech",
    service: "Web Development",
    description:
      "A professional-grade analytics platform that transforms raw business data into actionable intelligence through intuitive, real-time dashboards, built for teams juggling too many disconnected analytics tools.",
    tags: ["SaaS Product", "Full-Stack", "Data Visualization", "Real-Time Analytics"],
    photo: analyticsHubThumb,
  },
  {
    slug: "citizenlink-real-estate-platform",
    title: "CitizenLink: Premium Real Estate Platform",
    industry: "Real Estate",
    service: "Web Development",
    description:
      "A premium real estate discovery platform combining a luxury emerald-and-gold design system with powerful property search, interactive maps, and side-by-side comparison, backed by a full-stack architecture built for agents, listings, and leads.",
    tags: ["Web Design", "Full-Stack", "Real Estate Platform"],
    photo: citizenlinkThumb,
  },
  {
    slug: "nexoryn-executive-intelligence-platform",
    title: "Nexoryn Executive Intelligence Platform",
    industry: "SaaS & Tech",
    service: "Automation",
    description:
      "An AI-powered automation that consolidates internal sales data with live market, weather, and tech signals into a single daily executive dashboard, auto-generating insights and emailing a fully designed HTML report, hands-free.",
    tags: ["Automation", "n8n", "Groq / Llama"],
    photo: execIntelligenceThumb,
  },
  {
    slug: "ai-candidate-screening-pipeline",
    title: "AI Candidate Screening Pipeline",
    industry: "SaaS & Tech",
    service: "Automation",
    description:
      "An AI-powered recruiting automation that extracts resumes from new applications, structures candidate profiles with Llama 3.3 70B, scores them against live job requirements, logs every decision to a hiring pipeline, and routes outreach, Calendly links for shortlists, polished declines for rejects, Slack alerts for the team.",
    tags: ["Automation", "n8n", "Groq / Llama"],
    photo: candidateScreeningThumb,
  },
  {
    slug: "ai-invoice-processing-pipeline",
    title: "AI Invoice Processing Pipeline",
    industry: "Fintech",
    service: "Automation",
    description:
      "An AI-powered automation that watches Gmail for incoming invoices and receipts, extracts structured financial data with GPT-OSS 120B via Groq, validates totals and duplicates against business rules, logs clean records to Google Sheets, and alerts the team on Slack when something needs review.",
    tags: ["Automation", "n8n", "Groq / GPT-OSS"],
    photo: invoiceProcessingThumb,
  },
  {
    slug: "restaurant-standee-design-system",
    title: "Restaurant Standee Design System",
    industry: "Hospitality",
    service: "Brand & Graphic Design",
    description:
      "A sophisticated automated design system that generates premium, on-brand restaurant standees for multiple locations, combining elegant typography, product photography, and operational information into cohesive point-of-sale marketing assets.",
    tags: ["Design", "Print Design", "Restaurant Branding"],
    photo: restaurantStandeeThumb,
  },
  {
    slug: "wellness-product-marketing-flyer-system",
    title: "Wellness Product Marketing Flyer System",
    industry: "Healthcare",
    service: "Brand & Graphic Design",
    description:
      "An intelligent design automation system that generates premium product marketing flyers for wellness and supplement brands, combining product photography, benefit callouts, ingredient information, and brand aesthetics into cohesive point-of-sale and digital marketing materials.",
    tags: ["Design", "Marketing Collateral", "Wellness Branding"],
    photo: wellnessFlyerThumb,
  },
  {
    slug: "sports-recruitment-billboard-design-system",
    title: "Sports Recruitment Billboard Design System",
    industry: "Sports & Recruitment",
    service: "Brand & Graphic Design",
    description:
      "An automated design system that generates dynamic recruitment billboards and transit advertising for sports organizations, combining athlete photography, motivational messaging, call-to-action buttons, and high-impact visual composition into attention-grabbing outdoor marketing assets.",
    tags: ["Design", "Outdoor Advertising", "Sports Marketing"],
    photo: sportsBillboardThumb,
  },
  {
    slug: "novelty-candy-product-packaging-design-system",
    title: "Novelty Candy Product Packaging Design System",
    industry: "Retail",
    service: "Brand & Graphic Design",
    description:
      "An automated packaging design system that generates vibrant, eye-catching novelty candy and confectionery product packaging, combining bold color palettes, playful character design, ingredient callouts, and flavor-specific branding into shelf-stopping retail marketing assets.",
    tags: ["Design", "Packaging Design", "Confectionery Branding"],
    photo: candyPackagingThumb,
  },
  {
    slug: "coffee-shop-brand-identity-logo-system",
    title: "Coffee Shop Brand Identity & Logo Application System",
    industry: "Hospitality",
    service: "Brand & Graphic Design",
    description:
      "An intelligent design system that generates cohesive coffee shop brand identities with versatile logo applications, combining custom logo design, color palette development, typography selection, and branded collateral templates into unified visual systems for cafe operations.",
    tags: ["Design", "Branding", "Coffee Shop"],
    photo: coffeeBrandThumb,
  },
  {
    slug: "social-activism-poster-generation-system",
    title: "Social Activism Poster Generation System",
    industry: "Nonprofit & Advocacy",
    service: "Brand & Graphic Design",
    description:
      "An intelligent design system that generates powerful social justice and activism posters, combining compelling messaging, data visualization, bold typography, and iconic imagery into shareable, impactful visual campaigns that drive awareness and community organizing around social and economic justice issues.",
    tags: ["Design", "Activism", "Social Justice"],
    photo: activismPosterThumb,
  },
  {
    slug: "luxury-fashion-standee-design-system",
    title: "Luxury Fashion Standee Design System",
    industry: "Retail",
    service: "Brand & Graphic Design",
    description:
      "A sophisticated design automation system that generates premium retail standees for high-end fashion brands, combining editorial photography, refined typography, ornamental design elements, and promotional messaging into gallery-quality advertising assets that drive brand prestige and retail engagement.",
    tags: ["Design", "Luxury Fashion", "Retail"],
    photo: luxuryFashionStandeeThumb,
  },
];
