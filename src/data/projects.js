import {
  Workflow,
  Brain,
  ShoppingBag,
  Hash,
  Mail,
  Sheet,
  MessageSquare,
  Tag,
  Route,
  CheckCircle2,
  Database,
  Download,
  Search,
  Sparkles,
  Send,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  ClipboardCheck,
  Rocket,
  Code2,
  Atom,
  Cloud,
  CreditCard,
  FileCode,
  GitBranch,
  Globe,
  HardDrive,
  KeyRound,
  Layers,
  LayoutGrid,
  Lock,
  Network,
  Package,
  Paintbrush,
  Server,
  ShieldCheck,
  Type,
  Wand2,
  Zap,
  Eye,
  Truck,
  BarChart3,
  Wifi,
  ListChecks,
  ListTodo,
  Radio,
  Link2,
  Shield,
  Gauge,
  Boxes,
  Clock,
  Shapes,
  Share2,
  FileCheck,
  Bitcoin,
  CloudSun,
  Newspaper,
  ArrowLeftRight,
  Calendar,
  Calculator,
  FolderOpen,
  Scale,
  Map,
  Heart,
} from "lucide-react";
import chatbotThumb from "../assets/project-ai-chatbot-thumb.png";
import workflowOverview from "../assets/case-study-screenshots/workflow-overview.png";
import chatRefundRequest from "../assets/case-study-screenshots/chat-refund-request.png";
import slackRefundApproval from "../assets/case-study-screenshots/slack-refund-approval.png";
import gmailRefundDraft from "../assets/case-study-screenshots/gmail-refund-draft.png";
import slackApprovalRouting from "../assets/case-study-screenshots/slack-approval-routing.png";
import coldEmailThumb from "../assets/project-cold-email-thumb.png";
import coldEmailWorkflow from "../assets/case-study-screenshots/cold-email-n8n-workflow.png";
import coldEmailLeadSheet from "../assets/case-study-screenshots/cold-email-lead-sheet.png";
import coldEmailAirtable from "../assets/case-study-screenshots/cold-email-airtable-crm.png";
import coldEmailGmailSent from "../assets/case-study-screenshots/cold-email-gmail-sent.png";
import repurposingThumb from "../assets/project-content-repurposing-thumb.png";
import repurposingForm from "../assets/case-study-screenshots/repurposing-form.png";
import repurposingSlackApproval from "../assets/case-study-screenshots/repurposing-slack-approval.png";
import repurposingBufferWorkflow from "../assets/case-study-screenshots/repurposing-buffer-workflow.png";
import repurposingBufferQueue from "../assets/case-study-screenshots/repurposing-buffer-queue.png";
import aurumThumb from "../assets/project-aurum-thumb.png";
import analyticsHubThumb from "../assets/project-analytics-hub-thumb.png";
import execIntelligenceThumb from "../assets/project-exec-intelligence-thumb.jpeg";
import execIntelligenceKpiDashboard from "../assets/case-study-screenshots/exec-intelligence-kpi-dashboard.jpeg";
import execIntelligenceAiAnalysis from "../assets/case-study-screenshots/exec-intelligence-ai-analysis.jpeg";
import candidateScreeningThumb from "../assets/project-candidate-screening-thumb.jpeg";
import candidateScreeningShortlistEmail from "../assets/case-study-screenshots/candidate-screening-shortlist-email.jpeg";
import candidateScreeningDeclineEmail from "../assets/case-study-screenshots/candidate-screening-decline-email.jpeg";
import invoiceProcessingThumb from "../assets/project-invoice-processing-thumb.jpeg";
import invoiceProcessingSlackAlerts from "../assets/case-study-screenshots/invoice-processing-slack-alerts.jpeg";
import restaurantStandeeThumb from "../assets/project-restaurant-standee-thumb.png";
import wellnessFlyerThumb from "../assets/project-wellness-flyer-thumb.png";
import sportsBillboardThumb from "../assets/project-sports-billboard-thumb.png";
import candyPackagingThumb from "../assets/project-candy-packaging-thumb.png";
import coffeeBrandThumb from "../assets/project-coffee-brand-thumb.png";
import activismPosterThumb from "../assets/project-activism-poster-thumb.png";
import luxuryFashionStandeeThumb from "../assets/project-luxury-fashion-standee-thumb.png";
import citizenlinkThumb from "../assets/project-citizenlink-thumb.jpeg";

/**
 * A single real project. Everything the Portfolio grid card needs (title,
 * short description, tags, service → icon, photo, slug) lives at the top
 * level; everything the case-study page needs lives under `caseStudy`, kept
 * nested rather than in a separate file since there's only one project to
 * show and the two are never read independently of each other.
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

    caseStudy: {
      category: "AI Automation",
      techIcons: [
        { name: "n8n", icon: Workflow },
        { name: "Ollama", icon: Brain },
        { name: "Shopify", icon: ShoppingBag },
        { name: "Slack", icon: Hash },
      ],
      summary:
        "An AI-powered support agent built for Shopify stores. It classifies every incoming customer message, resolves routine requests like order status or FAQs instantly, and escalates refunds or complaints to a human through Slack, with every conversation logged for full visibility.",

      overview: {
        problem: [
          "Customers wait hours for basic order status replies",
          "Support team manually handles refund and complaint requests",
          "No shared record of past conversations across channels",
        ],
        solution: [
          "AI chatbot instantly classifies and resolves common requests",
          "Refunds and complaints route to a human via Slack for approval",
          "Every conversation is logged for full audit visibility",
        ],
        workflow: [
          { icon: MessageSquare, label: "Chat" },
          { icon: Tag, label: "Classify" },
          { icon: Route, label: "Route" },
          { icon: CheckCircle2, label: "Resolve" },
        ],
        breakdown: [
          {
            title: "1. Chat Intake & Session Normalization",
            description:
              "Captures customer messages via chat trigger and standardizes them into a consistent internal format for processing.",
          },
          {
            title: "2. Multi-Turn Session Memory",
            description:
              "Detects mid-conversation follow-ups and preserves context instead of treating every message as a fresh query.",
          },
          {
            title: "3. AI Intent Classification",
            description:
              "Classifies each message into order status, refund request, FAQ, or complaint, with sentiment detection and validation fallbacks.",
          },
          {
            title: "4. Intent-Based Routing",
            description:
              "Routes each conversation down the correct path, live Shopify lookups for orders, refund eligibility checks, FAQ answers, or complaint escalation.",
          },
          {
            title: "5. Human-in-the-Loop Resolution",
            description:
              "Sensitive cases are sent to Slack for one-click human approval, which automatically triggers a drafted resolution email.",
          },
          {
            title: "6. Customization & Scalability",
            description:
              "Built to swap LLM providers, expand to new channels, or upgrade the CRM/data layer without reworking core logic.",
          },
        ],
      },

      results: {
        // 6 of the 8 candidate highlights — "Full audit trail" is dropped
        // since the Overview's Solution list already says "every
        // conversation is logged for full audit visibility", and "One-click
        // resolution" is dropped since the technical breakdown already
        // covers the Slack-button-to-drafted-email step in more detail.
        keyFeatures: [
          {
            title: "Multi-intent AI classification",
            description:
              "Automatically distinguishes order status, refunds, FAQs, and complaints.",
          },
          {
            title: "Live Shopify integration",
            description:
              "Real order data, not guesses, used to answer customer questions.",
          },
          {
            title: "Hallucination guarding",
            description:
              "Prompts explicitly forbid inventing tracking numbers, dates, or policy details.",
          },
          {
            title: "Multi-turn conversation memory",
            description:
              'Remembers context (e.g. "waiting for order number") across messages.',
          },
          {
            title: "Human-in-the-loop escalation",
            description:
              "Refunds and complaints go to a real person via Slack instead of being auto-approved.",
          },
          {
            title: "Graceful failure handling",
            description:
              '"Order not found" and malformed-AI-output cases are handled explicitly rather than breaking the flow.',
          },
        ],
        before:
          "Manual triage of every customer message, slow response times, inconsistent replies.",
        after:
          "AI resolves routine requests instantly, only judgment calls reach a human, consistent and logged responses.",
        proof:
          "This system demonstrates that AI can safely handle the majority of support volume while keeping humans in control of sensitive decisions, reducing response time without sacrificing judgment or accuracy.",
      },

      techStack: {
        "AI Layer": [
          { name: "n8n", role: "Workflow orchestration engine", icon: Workflow },
          {
            name: "Ollama (Llama 3.2 3B)",
            role: "Local LLM for classification & replies",
            icon: Brain,
          },
        ],
        "Data Layer": [
          {
            name: "Shopify Admin API",
            role: "Live order data lookup",
            icon: ShoppingBag,
          },
          {
            name: "Google Sheets",
            role: "Conversation logging & session memory",
            icon: Sheet,
          },
        ],
        "Communication Layer": [
          { name: "Slack API", role: "Human-in-the-loop approval", icon: Hash },
          { name: "Gmail API", role: "Automated resolution emails", icon: Mail },
        ],
      },

      // Original pixel dimensions kept alongside each image so the
      // Screenshots tab's bento grid can size each tile to its real aspect
      // ratio instead of cropping everything to a uniform box.
      screenshots: [
        {
          src: workflowOverview,
          alt: "Full n8n automation workflow",
          width: 1531,
          height: 589,
        },
        {
          src: chatRefundRequest,
          alt: "Customer chat requesting a refund",
          width: 517,
          height: 548,
        },
        {
          src: slackRefundApproval,
          alt: "Slack refund approval request",
          width: 574,
          height: 348,
        },
        {
          src: gmailRefundDraft,
          alt: "Drafted refund-rejection email",
          width: 600,
          height: 615,
        },
        {
          src: slackApprovalRouting,
          alt: "Slack approval routing workflow",
          width: 1290,
          height: 550,
        },
      ],

      scalability: [
        {
          title: "LLM Provider Flexibility",
          description:
            "Currently runs on local Ollama (Llama 3.2 3B) for cost-free inference; the Ollama Chat Model nodes can be swapped for OpenAI GPT-4o, Anthropic Claude, or Gemini for higher-accuracy classification and more nuanced replies in production.",
        },
        {
          title: "Channel Expansion",
          description:
            "Built on n8n's Chat Trigger (web), but the same normalized-input structure means it can be extended to WhatsApp, Instagram DM, Messenger, or SMS by adding a new trigger + normalization step, without rebuilding the intent/routing logic.",
        },
        {
          title: "Auto-Send vs Draft",
          description:
            "Resolution emails are currently created as Gmail drafts for agent review before sending; this can be switched to auto-send for a fully hands-off flow, or routed through Outlook/SendGrid instead of Gmail.",
        },
        {
          title: "Approval Channel Flexibility",
          description:
            "Human approval currently happens via Slack buttons, but the same webhook pattern could be adapted to Microsoft Teams, Discord, or a custom internal dashboard.",
        },
        {
          title: "CRM/Data Store Flexibility",
          description:
            "Session state and conversation logs currently use Google Sheets; for higher volume this could be moved to Airtable, PostgreSQL/MySQL, or a proper CRM (HubSpot/Zendesk) for better querying and reporting.",
        },
        {
          title: "Refund Rule Engine",
          description:
            'Refund eligibility is currently a simple "days since delivery" check; this logic can be expanded into a full rules engine (order value thresholds, product category exceptions, repeat-customer flags) without changing the surrounding workflow.',
        },
        {
          title: "Sentiment-Based Prioritization",
          description:
            "Since sentiment is already being captured, a future enhancement could auto-prioritize negative-sentiment complaints to the top of the Slack channel or trigger faster SLAs.",
        },
        {
          title: "Analytics Dashboard",
          description:
            "The Google Sheets conversation log is structured cleanly enough to be plugged straight into Looker Studio, Power BI, or a custom dashboard for support analytics (volume by intent, sentiment trends, resolution time).",
        },
      ],
    },
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

    caseStudy: {
      category: "AI Automation",
      techIcons: [
        { name: "n8n", icon: Workflow },
        { name: "Llama", icon: Brain },
        { name: "Airtable", icon: Database },
        { name: "Gmail", icon: Mail },
      ],
      summary:
        "An AI-powered cold outreach agent for sales teams. It generates hyper-personalized email openers for every prospect, sends them at scale through Gmail, logs every contact in Airtable to avoid duplicates, and automatically follows up with anyone who hasn't responded.",

      overview: {
        problem: [
          "Manually writing personalized cold emails for hundreds of prospects is time-consuming and inconsistent",
          "Sales teams waste hours researching each prospect to craft relevant opening lines",
          "No centralized tracking of who's been contacted, replied, or ignored",
          "Follow-ups are ad-hoc and often missed",
        ],
        solution: [
          "AI generates hyper-personalized opening lines based on prospect name, company, and job title",
          "Emails are sent automatically with consistent formatting and branding",
          "Every contact is logged in Airtable for full visibility and compliance",
          "Automatic follow-up emails sent to non-responders after set periods",
        ],
        workflow: [
          { icon: Download, label: "Fetch" },
          { icon: Search, label: "Detect" },
          { icon: Sparkles, label: "Generate" },
          { icon: Send, label: "Send" },
          { icon: CheckCircle2, label: "Track" },
          { icon: RefreshCw, label: "Follow Up" },
        ],
        breakdown: [
          {
            title: "1. Lead Intake & Deduplication",
            description:
              "Pulls prospect records from Google Sheets containing name, company, title, and email. Checks Airtable database to ensure the prospect hasn't been contacted previously, preventing wasted outreach and unintended duplicate emails.",
          },
          {
            title: "2. Batch Processing & Loop Logic",
            description:
              'Processes leads in batches rather than one-at-a-time, dramatically improving efficiency. The "Loop Over Items" node handles each prospect sequentially while maintaining data integrity throughout the workflow.',
          },
          {
            title: "3. AI-Powered Personalization",
            description:
              "Llama 3.2 (3B) model generates unique, contextual opening lines by analyzing the prospect's name, job title, and company. Uses sentiment analysis to ensure tone is conversational, not salesy.",
          },
          {
            title: "4. Intent-Based Email Composition",
            description:
              "Combines the AI-generated opener with a standardized closing and signature. Creates the subject line dynamically, then formats both for Gmail delivery with proper encoding and headers.",
          },
          {
            title: "5. Gmail Integration & Sending",
            description:
              "Sends the personalized email directly through Gmail OAuth2. Tracks delivery status and timestamps. All sent emails logged with full headers for compliance and audit trails.",
          },
          {
            title: "6. Airtable Logging & CRM Sync",
            description:
              'Creates a permanent record in the "Leads" table with contact details, outreach status ("Contacted," "Replied," "No Response"), timestamp, and AI-generated copy for future reference and A/B testing.',
          },
        ],
      },

      results: {
        keyFeatures: [
          {
            title: "AI-powered personalization",
            description:
              "Automatically generates unique, context-aware opening lines for each prospect based on their role, company, and seniority level, eliminating generic cold email templates.",
          },
          {
            title: "Duplicate detection",
            description:
              "Before sending, searches Airtable for existing contacts to prevent redundant outreach and wasted sends to prospects already in the pipeline.",
          },
          {
            title: "Batch processing at scale",
            description:
              "Handles hundreds of leads in a single workflow run. The loop logic ensures each prospect is processed completely before moving to the next.",
          },
          {
            title: "Multi-turn email sequences",
            description:
              "Remembers contact history in Airtable and sends follow-up emails only to prospects with no previous interaction, respecting email frequency preferences.",
          },
          {
            title: "Gmail integration",
            description:
              "Sends emails directly from your branded Gmail account with full OAuth2 authentication, maintaining sender reputation and authentication (SPF/DKIM).",
          },
          {
            title: "Centralized lead tracking",
            description:
              "Every outreach action (send, follow-up, status) is logged in Airtable with timestamps, creating an auditable record for sales operations and compliance.",
          },
        ],
        before:
          "Manual research and email writing for each prospect, inconsistent messaging, no centralized tracking, forgotten follow-ups, zero data on what messaging actually works.",
        after:
          "AI generates personalized emails instantly, all outreach logged and tracked, automatic follow-ups based on response status, clear metrics on open rates and reply patterns, consistent brand voice at scale.",
        proof:
          "This system demonstrates that AI can handle high-volume, repetitive outreach tasks while maintaining personalization, freeing sales teams to focus on relationship-building and closing deals rather than manual email writing.",
      },

      techStack: {
        "AI Layer": [
          {
            name: "Llama 3.2 (3B)",
            role: "Local LLM for personalized opener generation",
            icon: Brain,
          },
          { name: "n8n", role: "Workflow orchestration engine", icon: Workflow },
        ],
        "Data Layer": [
          {
            name: "Google Sheets",
            role: "Lead list source and prospect database",
            icon: Sheet,
          },
          {
            name: "Airtable",
            role: "Outreach tracking & CRM layer",
            icon: Database,
          },
        ],
        "Communication Layer": [
          { name: "Gmail API", role: "Email delivery and sending", icon: Mail },
          {
            name: "Google Sheets API",
            role: "Real-time lead syncing",
            icon: Sheet,
          },
        ],
      },

      // Original pixel dimensions kept alongside each image so the
      // Screenshots tab's bento grid can size each tile to its real aspect
      // ratio instead of cropping everything to a uniform box.
      screenshots: [
        {
          src: coldEmailWorkflow,
          alt: "Full n8n cold outreach workflow",
          width: 1555,
          height: 612,
        },
        {
          src: coldEmailLeadSheet,
          alt: "Google Sheets lead list source",
          width: 831,
          height: 328,
        },
        {
          src: coldEmailAirtable,
          alt: "Airtable outreach tracking CRM",
          width: 1472,
          height: 443,
        },
        {
          src: coldEmailGmailSent,
          alt: "Personalized cold email sent via Gmail",
          width: 1919,
          height: 616,
        },
      ],

      scalability: [
        {
          title: "LLM Provider Flexibility",
          description:
            "Currently runs on local Llama (3.2 3B) for cost-free inference; can swap to OpenAI GPT-4o, Anthropic Claude, or Gemini for higher-quality personalization and tone refinement.",
        },
        {
          title: "Lead Source Flexibility",
          description:
            "Currently pulls from Google Sheets, but can extend to pull from HubSpot, Pipedrive, LinkedIn Sales Navigator, or custom CRMs via API without reworking core logic.",
        },
        {
          title: "Email Template Customization",
          description:
            "Signature, closing lines, and subject line templates can be versioned in Airtable for A/B testing different messaging strategies.",
        },
        {
          title: "Outreach Channel Expansion",
          description:
            "Built on normalized input structure, so the same personalization and tracking logic can extend to LinkedIn Messaging, Twitter DMs, or SMS by adding a new sending node.",
        },
        {
          title: "Approval Workflow Optional",
          description:
            "Can insert a Slack approval step before sending to review AI-generated copies before delivery, then auto-send after approval.",
        },
        {
          title: "Follow-Up Rule Engine",
          description:
            "Currently sends one follow-up after a set period. Can expand to multi-touch sequences (3–5 email drip campaign) with sentiment-based prioritization.",
        },
        {
          title: "Analytics Dashboard",
          description:
            "The Airtable log is structured for direct export to Looker Studio, Power BI, or custom dashboards to track open rates, reply rates, and conversion by prospect segment.",
        },
        {
          title: "Frequency Capping",
          description:
            "Can add logic to respect max-emails-per-day caps and rate-limit across domains to maintain sender reputation.",
        },
      ],
    },
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

    caseStudy: {
      category: "AI Automation",
      techIcons: [
        { name: "n8n", icon: Workflow },
        { name: "Llama", icon: Brain },
        { name: "Slack", icon: Hash },
        { name: "Buffer", icon: Rocket },
      ],
      summary:
        "An AI-powered content repurposing agent for content teams. It transforms long-form content into platform-optimized posts for LinkedIn, Threads, and Instagram with matching AI-generated visuals, routes everything through Slack for one-click human approval, and publishes across all platforms simultaneously via Buffer.",

      overview: {
        problem: [
          "Content creators struggle to adapt single pieces of content into multiple platform-specific formats efficiently",
          "Generating platform-specific copy (LinkedIn, Twitter, Instagram) requires different tones, lengths, and messaging strategies",
          "Creating matching visuals for social posts is time-consuming and often outsourced to designers",
          "Without a centralized approval workflow, inconsistent or off-brand content gets published",
          "No audit trail of content decisions, making compliance and performance tracking difficult",
        ],
        solution: [
          "AI instantly transforms long-form content into three distinct platform-optimized social posts",
          "Automated AI-generated graphics ensure visual consistency across all platforms without designer overhead",
          "Slack-based approval workflow keeps stakeholders in the loop before publishing",
          "Once approved, Buffer schedules posts across LinkedIn, Threads, and Instagram simultaneously",
          "Every decision is logged in Slack for full compliance and content performance tracking",
        ],
        workflow: [
          { icon: FileText, label: "Submit" },
          { icon: Sparkles, label: "Generate" },
          { icon: ImageIcon, label: "Visual" },
          { icon: ClipboardCheck, label: "Review" },
          { icon: CheckCircle2, label: "Approve" },
          { icon: Rocket, label: "Publish" },
        ],
        breakdown: [
          {
            title: "1. Flexible Content Input Interface",
            description:
              "Accepts content via an n8n web form in two formats, direct paste or file upload (PDF, DOCX, TXT), and detects which method was used to route accordingly.",
          },
          {
            title: "2. Intelligent Input Normalization",
            description:
              "A JavaScript code node analyzes the submission, detects whether a file was uploaded or text was pasted, and normalizes the input structure for consistent downstream processing.",
          },
          {
            title: "3. Conditional File Extraction",
            description:
              "An If node routes file submissions to text extraction from PDF/DOCX/TXT, or passes pasted content directly through, both paths merge into a standardized Final Content node.",
          },
          {
            title: "4. AI-Powered Multi-Format Content Generation",
            description:
              "Llama 3.2 (3B) generates a LinkedIn post (professional, 150-300 words), a Twitter/Threads post (max 150 characters), and an Instagram caption (conversational, hashtags), prompted to return JSON only for reliable parsing.",
          },
          {
            title: "5. Sophisticated AI Output Parsing",
            description:
              "A custom JavaScript parser strips markdown code fences, extracts content via regex, converts escaped characters back to readable text, and falls back to default messages if extraction fails.",
          },
          {
            title: "6. Automated AI-Generated Visual Asset",
            description:
              "Pollinations AI generates a 1024x1024 minimalist professional graphic using the first 100 characters of the LinkedIn post as the prompt, stored for Slack preview.",
          },
          {
            title: "7. Slack-Based Approval Workflow",
            description:
              "n8n builds a rich Slack message with section blocks per platform, the AI-generated image, and Approve/Reject action buttons, making approval a one-click decision.",
          },
          {
            title: "8. Action Capture & Routing",
            description:
              "Slack sends a webhook callback on button click; n8n parses the action type and routes to Buffer scheduling on approval or a revise-and-resubmit notification on rejection.",
          },
          {
            title: "9. Multi-Platform Buffer Scheduling",
            description:
              "Three parallel Buffer nodes schedule the LinkedIn, Threads, and Instagram posts with the AI-generated graphic, each optimized for its platform and audience.",
          },
          {
            title: "10. Confirmation & Audit Logging",
            description:
              "Slack receives a scheduling confirmation, and timestamp plus user information are logged with the full message history preserved for compliance.",
          },
        ],
      },

      results: {
        keyFeatures: [
          {
            title: "Dual input methods",
            description:
              "Users can paste content directly or upload PDF, DOCX, or TXT files, no need for multiple submission methods or technical setup.",
          },
          {
            title: "Automated format adaptation",
            description:
              "Generates LinkedIn (professional), Threads (concise), and Instagram (casual, hashtags) versions automatically, each optimized for its platform.",
          },
          {
            title: "AI-generated visual assets",
            description:
              "Eliminates the need for manual graphic design by automatically creating on-brand, professional social media graphics.",
          },
          {
            title: "Slack-native approval workflow",
            description:
              "Rich, interactive Slack messages with embedded content preview and one-click approve/reject buttons, approval happens where teams already communicate.",
          },
          {
            title: "Multi-platform scheduling",
            description:
              "Upon approval, Buffer automatically schedules posts to LinkedIn, Threads, and Instagram simultaneously with consistent messaging.",
          },
          {
            title: "Resilient AI output parsing",
            description:
              "Custom JavaScript parsing handles imperfect AI responses, including escaped characters and markdown fences, ensuring reliability across model outputs.",
          },
        ],
        before:
          "Manual rewriting of content for each platform takes hours, inconsistent messaging and tone across channels, graphic creation outsourced or manually designed, no centralized approval mechanism, posts scheduled manually, zero audit trail of content decisions.",
        after:
          "All three social formats generated in minutes via AI, consistent messaging guaranteed by AI and human approval, professional graphics auto-generated for every post, mandatory Slack approval before publishing, all platforms published simultaneously via Buffer, complete audit trail of all decisions.",
        proof:
          "This system demonstrates that AI can handle content transformation, format adaptation, and visual generation while maintaining quality through human-in-the-loop approval, freeing content teams to focus on strategy and creative direction rather than repetitive formatting and scheduling tasks.",
      },

      techStack: {
        "AI & Content Layer": [
          {
            name: "Llama 3.2 (3B)",
            role: "Local LLM for multi-format content generation",
            icon: Brain,
          },
          {
            name: "Pollinations AI",
            role: "Automated AI image generation for social graphics",
            icon: ImageIcon,
          },
        ],
        "Orchestration & Workflow": [
          { name: "n8n", role: "Workflow automation engine", icon: Workflow },
          {
            name: "Slack",
            role: "Approval workflow, notifications, and audit logging",
            icon: Hash,
          },
        ],
        "Publishing & Scheduling": [
          {
            name: "Buffer",
            role: "Multi-platform scheduling (LinkedIn, Threads, Instagram)",
            icon: Rocket,
          },
        ],
        "Content Intake": [
          {
            name: "n8n Form Trigger",
            role: "Web form for content paste and file upload",
            icon: FileText,
          },
          {
            name: "File Extraction",
            role: "Automatic text extraction from PDFs, DOCX, TXT",
            icon: ClipboardCheck,
          },
        ],
      },

      // Original pixel dimensions kept alongside each image so the
      // Screenshots tab's bento grid can size each tile to its real aspect
      // ratio instead of cropping everything to a uniform box.
      screenshots: [
        {
          src: repurposingThumb,
          alt: "Full n8n content repurposing workflow",
          width: 1720,
          height: 695,
        },
        {
          src: repurposingForm,
          alt: "Content submission web form",
          width: 482,
          height: 556,
        },
        {
          src: repurposingSlackApproval,
          alt: "Slack approval message with AI-generated content and image",
          width: 513,
          height: 667,
        },
        {
          src: repurposingBufferWorkflow,
          alt: "Buffer multi-platform scheduling workflow",
          width: 1234,
          height: 565,
        },
        {
          src: repurposingBufferQueue,
          alt: "Buffer queue showing scheduled posts",
          width: 1919,
          height: 991,
        },
      ],

      scalability: [
        {
          title: "Content Source Flexibility",
          description:
            "Currently accepts manual paste and file upload; can extend to integrate with WordPress, Medium, Substack, Notion, or RSS feeds to auto-trigger repurposing.",
        },
        {
          title: "Platform Expansion",
          description:
            "Currently targets LinkedIn, Threads, and Instagram via Buffer. Easily add TikTok, YouTube Shorts, Bluesky, Mastodon, or custom CMS integrations by adding new Buffer or native API nodes.",
        },
        {
          title: "Multi-Language Support",
          description:
            "Modify AI prompts to generate content in different languages, enabling global distribution of the same source content.",
        },
        {
          title: "Custom AI Prompts by Content Type",
          description:
            "Create template prompts for different content types (blog post, whitepaper, case study, announcement, product launch) selectable at submission time.",
        },
        {
          title: "Advanced Approval Chains",
          description:
            "Add multiple sequential approval steps (brand manager → compliance → legal) using Slack's workflow builder or additional approval channels in n8n.",
        },
        {
          title: "A/B Testing Variants",
          description:
            "Generate multiple AI versions and surface them in Slack, allowing approvers to choose the best variant before publishing.",
        },
        {
          title: "Engagement Analytics Feedback Loop",
          description:
            "Integrate Buffer's post-publish analytics (likes, comments, shares) back into n8n to identify top-performing formats and optimize future content.",
        },
        {
          title: "Content Performance Dashboard",
          description:
            "Automatically log all approved content and AI variations into Airtable or Google Sheets for historical analysis and competitive benchmarking.",
        },
      ],
    },
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

    caseStudy: {
      category: "Full-Stack E-Commerce",
      techIcons: [
        { name: "Next.js", icon: Code2 },
        { name: "React", icon: Atom },
        { name: "Stripe", icon: CreditCard },
        { name: "PostgreSQL", icon: Database },
      ],
      summary:
        "A premium luxury e-commerce platform that transforms high-end shopping into a curated, exclusive online atelier experience. Aurum combines light-theme minimalism, restrained glass morphism, and complex full-stack functionality, inventory, multi-step checkout, and an admin suite, to make the website itself part of the product's prestige.",

      overview: {
        problem: [
          "Luxury brands struggle to convey exclusivity and prestige in standardized e-commerce templates",
          "Most luxury websites rely on dark themes and trendy effects that feel dated within months",
          "Complex checkout flows frustrate high-net-worth individuals accustomed to seamless experiences",
          "Inventory management and order tracking systems feel corporate, not personal",
          "Generic product grids fail to showcase craftsmanship and curated collections",
        ],
        solution: [
          "Light-theme minimalist design (Apple/Figma aesthetic) signals premium positioning",
          "Signature 'Gold Thread' scroll indicator creates a memorable, unique brand experience",
          "Multi-step checkout optimized for high-AOV transactions ($2,500+ average order value)",
          "Editorial product grid (asymmetric layout) reinforces 'curated collection' over 'catalog'",
          "Advanced inventory management with real-time stock tracking and low-stock alerts",
          "Full-featured admin dashboard for collection curation and order fulfillment",
        ],
        workflow: [
          { icon: Search, label: "Discover" },
          { icon: Eye, label: "Explore" },
          { icon: ShoppingBag, label: "Select" },
          { icon: CreditCard, label: "Purchase" },
          { icon: Truck, label: "Track" },
          { icon: LayoutGrid, label: "Manage" },
        ],
        breakdown: [
          {
            title: "1. Light-Theme Design System & Color Psychology",
            description:
              "Built on sophisticated minimalism with an off-white primary background and soft gray-blue secondary. A purple accent signals luxury and prestige, warm orange adds energy, and rose gold offers a feminine alternative for jewelry collections, registering as 'premium' in a way most dark-mode luxury sites don't.",
          },
          {
            title: "2. Signature Visual Element: The Gold Thread",
            description:
              "A thin brass/purple line runs vertically down the left edge as a scroll progress indicator, 'knotting' (widening) at key content anchors, hero, collections, testimonials, footer. The single most differentiating element on the site; it appears nowhere else on the web.",
          },
          {
            title: "3. Glass Morphism Throughout: Restrained & Intentional",
            description:
              "Every interactive card, modal, and overlay uses a frosted glass effect with subtle borders and soft shadows, applied selectively rather than over-applied. On hover, cards brighten and borders glow, feels expensive, not gimmicky.",
          },
          {
            title: "4. Editorial Grid Layout: Magazine Aesthetic",
            description:
              "Products display in an asymmetric 3-column grid on desktop, alternating large featured tiles with smaller supporting products, like a luxury magazine spread rather than a standardized marketplace grid. Tablet drops to 2 columns, mobile to a single column.",
          },
          {
            title: "5. Typography Hierarchy & Brand Voice",
            description:
              "Fraunces (serif, high-contrast) for product names and headlines feels handcrafted and distinctive. Inter (clean grotesk) handles body text and UI. IBM Plex Mono renders prices and SKUs with a precision-ledger aesthetic that signals transparency.",
          },
          {
            title: "6. Responsive Architecture For All Devices",
            description:
              "Desktop keeps the full 3-column asymmetric grid with persistent sidebar filters; tablet collapses filters into a drawer; mobile drops to a single column with sticky add-to-cart. Images are lazy-loaded, served in WebP with responsive srcset, targeting a Lighthouse score of 90+.",
          },
          {
            title: "7. Cart State Management & Persistence",
            description:
              "The shopping cart is built with Zustand and survives page refresh via localStorage + IndexedDB. Real-time stock validation prevents overselling, and a gift message field in the cart drawer adds a luxury-specific touch.",
          },
          {
            title: "8. Multi-Step Checkout With Premium UX",
            description:
              "A three-step flow, shipping address + method, PCI-compliant Stripe payment, order confirmation, uses the Gold Thread design language for its progress indicator, with address validation, real-time shipping cost calculation, and guest checkout support.",
          },
        ],
      },

      results: {
        keyFeatures: [
          {
            title: "Sophisticated product discovery",
            description:
              "Advanced filtering by material, price, color, and stone type, with fuzzy search and editorially curated collections rather than generic product photography.",
          },
          {
            title: "Editorial collection curation",
            description:
              "Asymmetric magazine-style grid with drag-and-drop reordering, featured/hero products, and editorial descriptions per collection.",
          },
          {
            title: "Luxury account experience",
            description:
              "Real-time order status tracking, saved addresses with nickname labels, saved payment methods, and account settings for gift-messaging defaults.",
          },
          {
            title: "Wishlist for favorites & gift planning",
            description:
              "Guest wishlist stored in localStorage and migrated to account on signup, with shareable links and email price-drop alerts.",
          },
          {
            title: "Full-featured admin dashboard",
            description:
              "Product, order, and collection management with bulk CSV upload, packing slips, shipping labels, and a revenue/conversion analytics view.",
          },
          {
            title: "Real-time inventory management",
            description:
              "Stock levels update instantly across all product pages, with 'Notify Me' alerts, low-stock warnings, and per-variant inventory tracking.",
          },
          {
            title: "Personalized product recommendations",
            description:
              "Related products by collection and price point, 'customers also viewed' sections, and cross-sell opportunities in the cart.",
          },
          {
            title: "Responsive design across all devices",
            description:
              "Mobile-first with touch targets ≥44px, drawer filters on mobile vs sidebar on desktop, and a Lighthouse 90+ performance target.",
          },
        ],
        before:
          "Generic e-commerce template, dark theme like everyone else, standard product grid, slow checkout, no inventory visibility. Website feels like a catalog, not an experience, with no way to communicate product story or craftsmanship, high cart abandonment, and no personalization.",
        after:
          "Premium, memorable brand experience that visitors recognize instantly. Editorial grid showcases products like magazine spreads, checkout is frictionless for high-AOV transactions, real-time inventory prevents overselling, and the admin suite enables easy collection curation. Conversion rate increased 35%, cart abandonment decreased 28%, average order value $2,500+.",
        proof:
          "This platform demonstrates that thoughtful design and full-stack capability can transform e-commerce from transactional to experiential. Aurum proves a website can be part of the product itself, not just a sales channel, combining premium aesthetics, intuitive UX, and robust backend infrastructure into an ecosystem where luxury brands can scale without sacrificing prestige.",
      },

      techStack: {
        "Frontend Layer": [
          {
            name: "Next.js 14",
            role: "Server-side rendering, static generation, API routes",
            icon: Code2,
          },
          {
            name: "React 18",
            role: "Component-based architecture, hooks for state",
            icon: Atom,
          },
          {
            name: "Tailwind CSS",
            role: "Utility-first styling, glass morphism utilities",
            icon: Paintbrush,
          },
          {
            name: "Zustand",
            role: "Lightweight state management for cart & wishlist",
            icon: Package,
          },
        ],
        "Design & Animation Layer": [
          {
            name: "Framer Motion",
            role: "Smooth transitions, scroll reveals, Gold Thread animation",
            icon: Wand2,
          },
          {
            name: "CSS Modules",
            role: "Scoped component styling",
            icon: FileCode,
          },
          {
            name: "Custom Fonts",
            role: "Fraunces, Inter, IBM Plex Mono",
            icon: Type,
          },
        ],
        "Backend Layer": [
          {
            name: "Node.js 20",
            role: "Runtime environment, non-blocking I/O",
            icon: Server,
          },
          {
            name: "Express.js",
            role: "API server, auth & validation middleware",
            icon: Network,
          },
          {
            name: "Prisma ORM",
            role: "Type-safe queries, automatic migrations",
            icon: Layers,
          },
        ],
        "Data & Persistence Layer": [
          {
            name: "PostgreSQL 15",
            role: "Relational database for orders & inventory",
            icon: Database,
          },
          {
            name: "Redis",
            role: "Session storage, cart caching, rate limiting",
            icon: Zap,
          },
          {
            name: "AWS S3",
            role: "Scalable product image storage",
            icon: Cloud,
          },
          {
            name: "CloudFront CDN",
            role: "Global image delivery & caching",
            icon: Globe,
          },
        ],
        "Payment & Email Layer": [
          {
            name: "Stripe",
            role: "Payment processing, PCI compliance, webhooks",
            icon: CreditCard,
          },
          {
            name: "SendGrid",
            role: "Transactional emails & shipping updates",
            icon: Mail,
          },
        ],
        "Authentication & Security": [
          {
            name: "JWT",
            role: "Stateless, scalable authentication",
            icon: KeyRound,
          },
          {
            name: "Bcrypt",
            role: "Industry-standard password hashing",
            icon: Lock,
          },
          {
            name: "HTTPS/SSL",
            role: "End-to-end encryption",
            icon: ShieldCheck,
          },
        ],
        "Deployment & Infrastructure": [
          {
            name: "Vercel",
            role: "Frontend hosting, global edge network",
            icon: Rocket,
          },
          {
            name: "Railway / AWS EC2",
            role: "Backend hosting, database & Redis provisioning",
            icon: HardDrive,
          },
          {
            name: "GitHub Actions",
            role: "CI/CD pipeline, automated testing",
            icon: GitBranch,
          },
        ],
      },

      // Deployed on Vercel — shows the live browser-frame embed instead of
      // the "coming soon" placeholder. See LivePreviewTab in CaseStudyPage.
      livePreview: "https://aurum-frontend-theta.vercel.app/",

      scalability: [
        {
          title: "Design System Flexibility",
          description:
            "Six alternative luxury color palettes documented (Rose Atelier, Emerald Vault, Sapphire Dreams, Midnight Velvet, Champagne Luxe, Noir Prestige), each WCAG 2.1 AA compliant. Themes switch without touching component code, all colors are CSS variables.",
        },
        {
          title: "Product Catalog Expansion",
          description:
            "Architecture supports unlimited collections with custom sorting, filtering, and editorial descriptions. Variant system handles size, material, color, and engraving; bulk CSV upload supports 1000+ products at once.",
        },
        {
          title: "Payment Method Extensibility",
          description:
            "Currently Stripe only, can add PayPal, Apple Pay, or Google Pay without reworking checkout logic. Subscription/recurring payments are ready for memberships or subscription boxes.",
        },
        {
          title: "Inventory & Multi-Warehouse Support",
          description:
            "Currently single-warehouse; can expand to multi-location inventory tracking (flagship store, warehouse, partner locations) with stock sync via API or CSV.",
        },
        {
          title: "Email Notification Customization",
          description:
            "Templates can move into Airtable/CMS for non-technical editing, and extend to SMS (Twilio) or push notifications with automated sequences for abandoned carts and price drops.",
        },
        {
          title: "Customer Segmentation & Personalization",
          description:
            "Ready to integrate an AI-powered personalization engine, a VIP customer tier system, and behavioral email triggers based on browsing and wishlist activity.",
        },
        {
          title: "Admin Dashboard Expansion",
          description:
            "Can integrate Google Analytics 4 for advanced insights, plus cohort analysis, churn prediction, lifetime value forecasting, and seasonal inventory forecasting.",
        },
        {
          title: "International Expansion Ready",
          description:
            "Database schema supports multiple currencies and tax jurisdictions, live exchange rate conversion, international carrier shipping, and multi-language support via i18n.",
        },
        {
          title: "Social & Marketplace Integration",
          description:
            "Can integrate Instagram Shopping, TikTok Shop, or Amazon Luxury Stores, with inventory synced across channels and orders consolidated in the Aurum dashboard.",
        },
        {
          title: "Loyalty & Rewards Program",
          description:
            "Ready to add a points-based loyalty system with member tiers (Bronze, Silver, Gold, Platinum), purchase-earned points, and referral program integration.",
        },
        {
          title: "Content Management System",
          description:
            "Can integrate Contentful or Sanity for editorial content, blog, lookbooks, artist profiles, with SEO-friendly posts and curated category-page content.",
        },
        {
          title: "Performance & Caching Optimization",
          description:
            "Images serve via CloudFront CDN with aggressive caching, database queries carry 15+ indexes, Redis caches frequently accessed data, and ISR updates the homepage and collection pages without a full rebuild.",
        },
      ],
    },
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

    caseStudy: {
      category: "Full-Stack SaaS Analytics",
      techIcons: [
        { name: "Next.js", icon: Code2 },
        { name: "NestJS", icon: Boxes },
        { name: "PostgreSQL", icon: Database },
        { name: "Socket.io", icon: Wifi },
      ],
      summary:
        "A sophisticated SaaS analytics dashboard for data-driven marketing, product, finance, and operations teams. Analytics Hub combines light-theme minimalism, glass morphism design, and complex full-stack functionality, real-time data ingestion, customizable dashboards, and intelligent alerting, to make powerful analytics feel effortless, scaling from startup to enterprise.",

      overview: {
        problem: [
          "Marketing and product teams juggle 10+ analytics tools, each requiring separate logins and learning curves",
          "Dashboards feel corporate and impersonal, generic templates, dated dark UIs dominate the market",
          "Real-time data access is rare; most platforms batch data updates hourly or daily, limiting responsiveness",
          "No unified view across data sources (Google Analytics, Stripe, HubSpot, Mixpanel scattered across tabs)",
          "Sharing insights with non-technical stakeholders requires manual effort (screenshots, exports, presentations)",
          "Setting up alerts requires deep technical knowledge; alert fatigue from poorly calibrated thresholds",
          "Data exports are slow and manual; no scheduled reporting automation for weekly/monthly reviews",
          "Most analytics platforms lack proper team collaboration features and granular permission controls",
        ],
        solution: [
          "Light-theme glass morphism design (Figma/Apple aesthetic) signals modern, trustworthy analytics",
          "Real-time data updates via WebSockets, changes appear on dashboards in under 3 seconds, not hours",
          "Multi-tenant workspace architecture enables seamless team collaboration with role-based permissions",
          "Pre-built integrations (Stripe, Google Analytics, HubSpot, Segment, Mixpanel, Salesforce) eliminate friction",
          "Drag-and-drop dashboard builder, no coding required, intuitive for marketing and product managers",
          "Smart alert engine with threshold-based triggers and multi-channel notifications (email/Slack/in-app)",
          "One-click CSV/PDF exports and scheduled report delivery automate manual reporting work",
          "Advanced permission system (owner/admin/member/viewer) with complete workspace isolation",
          "Responsive design works seamlessly across desktop, tablet, and mobile, analyze from anywhere",
        ],
        workflow: [
          { icon: KeyRound, label: "Auth" },
          { icon: Link2, label: "Connect" },
          { icon: Search, label: "Discover" },
          { icon: LayoutGrid, label: "Build" },
          { icon: Gauge, label: "Monitor" },
          { icon: Share2, label: "Share" },
          { icon: BarChart3, label: "Analyze" },
          { icon: Boxes, label: "Manage" },
        ],
        breakdown: [
          {
            title: "1. Light-Theme Design System & Color Psychology",
            description:
              "Built on sophisticated minimalism with an off-white primary background and soft gray-blue secondary. Purple signals innovation, sky blue adds confidence and trust, warm orange emphasizes data-driven action, validated for WCAG 2.1 AA accessibility across every component.",
          },
          {
            title: "2. Signature Visual Element: Animated Data Metric Cards",
            description:
              "Metric cards feature subtle animated data transitions, when values update via WebSocket, numbers smoothly increment or decrement with a gentle scale animation and color pulse, creating a 'live, breathing data' feel without gimmickry.",
          },
          {
            title: "3. Glass Morphism Throughout: Sophisticated & Intentional",
            description:
              "Every dashboard card, modal, filter panel, and notification uses a frosted glass effect with subtle borders and soft shadows, applied strategically for visual hierarchy rather than over-applied. Cards brighten and glow subtly on hover.",
          },
          {
            title: "4. Responsive Dashboard Grid: Flexible & Modular",
            description:
              "The dashboard uses a 12-column CSS grid. Widgets are responsive across breakpoints, drag-and-drop reordering works on every device, and mini charts collapse into summary cards on mobile, reinforcing that each dashboard feels personal to its user.",
          },
          {
            title: "5. Typography Hierarchy & Data Visualization",
            description:
              "Inter handles all body text and UI for modern, legible screen reading, while IBM Plex Mono renders metric values, percentages, and timestamps with a precision-ledger aesthetic that conveys data authenticity.",
          },
          {
            title: "6. Real-Time Data Layer via WebSockets",
            description:
              "Dashboards subscribe to a workspace-scoped WebSocket channel; Socket.io broadcasts updates to all connected clients instantly, rendered via Framer Motion. A polling fallback every 30 seconds keeps data fresh under poor network conditions.",
          },
          {
            title: "7. Drag-and-Drop Dashboard Builder",
            description:
              "Built with React Grid Layout, users add widgets, pick a chart type, choose a metric, apply filters, and drag to resize or reorder, with a real-time preview as they build. Non-technical users assemble complex dashboards in minutes.",
          },
          {
            title: "8. Multi-Tenant Workspace Architecture",
            description:
              "Every database table carries a workspace_id foreign key; queries are auto-scoped by workspace via middleware, and JWT tokens include a workspace_id claim. Cross-tenant data access is impossible at the database level.",
          },
        ],
      },

      results: {
        keyFeatures: [
          {
            title: "Real-time data integrations",
            description:
              "Pre-built connectors for Stripe, Google Analytics, HubSpot, Segment, Mixpanel, and Salesforce, with encrypted OAuth credentials and idempotent syncs that retry with exponential backoff on failure.",
          },
          {
            title: "Intelligent dashboard templates",
            description:
              "Pre-built templates for SaaS Metrics, Marketing, E-Commerce, and Product use cases, fully customizable, duplicable, and renamable.",
          },
          {
            title: "Metric library & custom metrics",
            description:
              "A searchable library of 500+ pre-calculated metrics plus a custom metric builder for simple formulas, cached in Redis and recalculated on dependency updates.",
          },
          {
            title: "Advanced filtering & drill-down",
            description:
              "Faceted filtering by date, value, and dimension, with shareable URL-persisted filters and click-to-drill-down segment breakdowns.",
          },
          {
            title: "Intelligent alert engine",
            description:
              "Threshold-based alerts trigger within 5 minutes of a breach, notify via email, in-app, or Slack, and deduplicate to prevent alert spam.",
          },
          {
            title: "Data export & scheduled reports",
            description:
              "One-click CSV/XLSX/PDF export via async background jobs, plus scheduled reports auto-emailed on a daily, weekly, or monthly cadence.",
          },
          {
            title: "Team collaboration & permissions",
            description:
              "Full RBAC (owner/admin/member/viewer) with granular dashboard-level sharing, public read-only links, and a complete audit log of every action.",
          },
          {
            title: "Mobile-responsive analytics",
            description:
              "Touch-friendly charts with tap-to-drill-down and swipe date ranges, plus PWA support for home-screen installs and offline caching.",
          },
          {
            title: "Workspace analytics dashboard",
            description:
              "Workspace owners see their own adoption metrics, user count, dashboard count, alert count, and API usage, to help justify a plan upgrade.",
          },
        ],
        before:
          "Multiple disparate tools (GA, Stripe, HubSpot, Mixpanel), each requiring separate login. Reports generated manually in spreadsheets (4+ hours weekly), data delays with no real-time visibility, friction-heavy sharing via screenshots and exported PDFs, generic alerts, no unified view, no collaboration, no automation.",
        after:
          "Single unified analytics platform accessible anywhere, with real-time updates and no batch report waiting. A drag-and-drop builder lets anyone create custom views in minutes, built-in collaboration and smart alerts keep teams aligned, and automated scheduled reports and instant exports replace manual work entirely.",
        proof:
          "This platform demonstrates that SaaS analytics can be powerful yet accessible, professional-grade features (real-time data, integrations, alerts, exports, audit logs) coexisting with thoughtful UX. Multi-tenant architecture and a scalable time-series data layer create a product that scales from 1 to 10,000+ concurrent users without performance degradation.",
      },

      techStack: {
        "Frontend Layer": [
          {
            name: "Next.js 14",
            role: "SSR landing pages, API routes, App Router organization",
            icon: Code2,
          },
          {
            name: "React 18",
            role: "Component architecture, hooks, memoized rendering",
            icon: Atom,
          },
          {
            name: "Tailwind CSS",
            role: "Utility-first styling, glass morphism utilities",
            icon: Paintbrush,
          },
          {
            name: "Zustand",
            role: "State for dashboards, filters, alerts, preferences",
            icon: Package,
          },
          {
            name: "Recharts",
            role: "SVG charting, 50+ types, performant to 10k points",
            icon: BarChart3,
          },
          {
            name: "Framer Motion",
            role: "Number transitions, hover states, loading states",
            icon: Wand2,
          },
          {
            name: "React Hook Form + Zod",
            role: "Uncontrolled forms with typed runtime validation",
            icon: ListChecks,
          },
          {
            name: "Socket.io-client",
            role: "WebSocket client with auto-reconnect backoff",
            icon: Wifi,
          },
        ],
        "Design & Animation Layer": [
          {
            name: "CSS Modules",
            role: "Scoped component styling",
            icon: FileCode,
          },
          {
            name: "Custom Fonts",
            role: "Inter (body), IBM Plex Mono (data values)",
            icon: Type,
          },
          {
            name: "Lucide React",
            role: "Tree-shakeable SVG icon set (1000+ icons)",
            icon: Shapes,
          },
        ],
        "Backend Layer": [
          {
            name: "Node.js 20",
            role: "Non-blocking runtime for high concurrency",
            icon: Server,
          },
          {
            name: "NestJS",
            role: "Modular TypeScript framework, DI, REST + WebSocket",
            icon: Boxes,
          },
          {
            name: "Prisma ORM",
            role: "Type-safe queries, migrations, schema management",
            icon: Layers,
          },
        ],
        "Data & Persistence Layer": [
          {
            name: "PostgreSQL 15",
            role: "Users, workspaces, dashboards, roles, audit logs",
            icon: Database,
          },
          {
            name: "TimescaleDB",
            role: "Time-series metrics, auto-partitioning, compression",
            icon: Clock,
          },
          {
            name: "Redis 7",
            role: "Session cache, job queue, pub/sub, rate limiting",
            icon: Zap,
          },
          {
            name: "AWS S3",
            role: "Exports, avatars, workspace logos",
            icon: Cloud,
          },
          {
            name: "CloudFront CDN",
            role: "Global static asset distribution & caching",
            icon: Globe,
          },
        ],
        "Real-Time & Message Queue": [
          {
            name: "Socket.io",
            role: "WebSocket layer, horizontally scalable via Redis",
            icon: Radio,
          },
          {
            name: "BullMQ",
            role: "Async job queue for syncs, exports, alerts, reports",
            icon: ListTodo,
          },
          {
            name: "Redis Pub/Sub",
            role: "Decouples metric ingestion from dashboard updates",
            icon: Network,
          },
        ],
        "Integration & Payment": [
          {
            name: "Stripe API",
            role: "Subscription billing (free/pro/enterprise)",
            icon: CreditCard,
          },
          {
            name: "OAuth 2.0",
            role: "Third-party auth for GA, HubSpot, Segment, Salesforce",
            icon: Link2,
          },
          {
            name: "SendGrid / Resend",
            role: "Transactional emails, reports, and alerts",
            icon: Mail,
          },
        ],
        "Authentication & Security": [
          {
            name: "NextAuth.js",
            role: "Email/password, Google OAuth, session handling",
            icon: KeyRound,
          },
          {
            name: "Bcrypt / Argon2",
            role: "Industry-standard salted password hashing",
            icon: Lock,
          },
          {
            name: "JWT (RS256)",
            role: "Asymmetric signing, httpOnly refresh cookies",
            icon: ShieldCheck,
          },
          {
            name: "AWS Secrets Manager",
            role: "Encrypted credential & API key storage",
            icon: Shield,
          },
          {
            name: "Rate Limiting",
            role: "Redis-backed login and API throttling",
            icon: Gauge,
          },
        ],
        "Deployment & Infrastructure": [
          {
            name: "Vercel",
            role: "Frontend hosting, edge functions, preview deploys",
            icon: Rocket,
          },
          {
            name: "AWS ECS Fargate",
            role: "Containerized backend, auto-scaling by CPU/memory",
            icon: HardDrive,
          },
          {
            name: "Docker",
            role: "Multi-stage backend containerization",
            icon: Boxes,
          },
          {
            name: "Terraform",
            role: "Infrastructure as code for DB, Redis, S3, IAM",
            icon: Layers,
          },
          {
            name: "GitHub Actions",
            role: "CI/CD: lint, typecheck, test, build, deploy",
            icon: GitBranch,
          },
          {
            name: "Prisma Migrate",
            role: "Schema change management with rollback",
            icon: FileCheck,
          },
        ],
      },

      // Deployed on Vercel — shows the live browser-frame embed instead of
      // the "coming soon" placeholder. See LivePreviewTab in CaseStudyPage.
      livePreview: "https://saas-analytics-dashboard-frontend.vercel.app/",

      scalability: [
        {
          title: "Light-Theme Design Versatility",
          description:
            "Color palette lives as CSS custom properties, swap for alternative palettes (Midnight Pro, Emerald Analytics, Rose Gold) without touching component code, including a dark-mode override.",
        },
        {
          title: "Integration Ecosystem Expansion",
          description:
            "Currently 6 integrations behind an adapter pattern, adding a source means implementing the IntegrationAdapter interface and registering it, scalable to 20+ integrations plus self-serve webhooks.",
        },
        {
          title: "Dashboard Template Marketplace",
          description:
            "Pre-built templates today; architecture is ready for a future marketplace where teams share or sell premium templates on a revenue split.",
        },
        {
          title: "Advanced Analytics & Cohort Analysis",
          description:
            "Can extend basic filtering into retention cohorts, behavioral cohorts, a segment builder, and lookalike audiences, may call for ClickHouse for complex queries.",
        },
        {
          title: "Alerting Channels Expansion",
          description:
            "Email, in-app, and Slack today, can add SMS (Twilio), generic webhooks, PagerDuty, Opsgenie, or Microsoft Teams.",
        },
        {
          title: "Scheduled Reports Enhancements",
          description:
            "Email delivery today, can extend to Slack posts, Google Drive saves, S3 uploads, custom webhooks, and branded PDF templates.",
        },
        {
          title: "White-Label Product",
          description:
            "Architecture already supports white-labeling for Enterprise, custom domain, logo, and color scheme live in workspace config, ready for agency resale.",
        },
        {
          title: "Custom Metrics & Formula Engine",
          description:
            "Basic metric creation today, can build an advanced formula builder with aggregations and time functions using a safe expression parser like Mathjs.",
        },
        {
          title: "Predictive Analytics & Forecasting",
          description:
            "Post-MVP: ML-powered time-series forecasts and anomaly detection via a Python backend (scikit-learn, statsmodels) or AWS SageMaker.",
        },
        {
          title: "Automated Insights",
          description:
            "AI-generated summaries ('Revenue up 23% WoW') integrated into daily digests, surfacing trends without the user having to go looking for them.",
        },
        {
          title: "Collaborative Dashboards & Real-Time Editing",
          description:
            "Read-only sharing today, can build real-time collaborative editing with multiple simultaneous users and conflict resolution via OT/CRDT.",
        },
        {
          title: "Mobile Native Apps",
          description:
            "iOS/Android via React Native or native Swift/Kotlin for offline access, push notifications, and biometric auth.",
        },
        {
          title: "International Expansion",
          description:
            "Database schema already supports multiple currencies and timezones, adding i18n (Spanish, French, German, Japanese) and locale-based pricing is a frontend layer on top.",
        },
        {
          title: "Enterprise SSO & SAML",
          description:
            "Basic auth via NextAuth today, can add SAML 2.0 (WorkOS/Auth0), workspace directory sync, and Azure AD for Enterprise customers.",
        },
        {
          title: "Granular Audit Logging & Compliance",
          description:
            "Basic audit logs today, can enhance with before/after change tracking, SOC 2/HIPAA/GDPR compliance reports, data lineage, and export to Splunk/DataDog.",
        },
        {
          title: "Data Warehouse Integration",
          description:
            "Can connect to Snowflake, BigQuery, or Redshift for custom SQL, letting power users write queries and visualize results directly on dashboards.",
        },
      ],
    },
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

    caseStudy: {
      category: "Full-Stack Real Estate Platform",
      techIcons: [
        { name: "Next.js", icon: Code2 },
        { name: "TypeScript", icon: FileCode },
        { name: "PostgreSQL", icon: Database },
        { name: "React Leaflet", icon: Map },
      ],
      summary:
        "A SaaS-grade property listing portal for buyers, renters, investors, sellers, landlords, and real estate professionals. CitizenLink combines a luxurious emerald-and-gold identity with powerful property discovery, advanced filtering, interactive maps, side-by-side comparison, saved listings, mortgage estimation, and contextual lead capture, on a scalable full-stack architecture built to grow from a polished frontend into a full real estate marketplace.",

      overview: {
        problem: [
          "Traditional property portals feel crowded and transactional, making it hard to focus on any single listing",
          "Large inventories make it difficult for buyers and renters to quickly find relevant properties",
          "Generic listing cards give little information for users making high-value property decisions",
          "Comparing multiple properties means jumping between pages and remembering specs by hand",
          "Property enquiries are disconnected from the listing itself, and mobile filters and maps are often clunky",
        ],
        solution: [
          "Premium minimal design system built around deep emerald, teal, and warm gold accents",
          "Powerful search combining location, property type, purpose, and pricing, with advanced filters for buyers, renters, and investors",
          "Interactive property cards with save, compare, and contextual quick actions",
          "Detailed property pages combining galleries, amenities, floor plans, maps, nearby places, and a mortgage calculator",
          "Side-by-side comparison for up to four properties, plus persistent saved listings via client-side state",
          "URL-based search state makes searches shareable and bookmarkable, on a data layer built to evolve from mock data into a production API without rewriting the UI",
        ],
        workflow: [
          { icon: Search, label: "Discover" },
          { icon: Eye, label: "Explore" },
          { icon: ClipboardCheck, label: "Evaluate" },
          { icon: Heart, label: "Shortlist" },
          { icon: ArrowLeftRight, label: "Compare" },
          { icon: Send, label: "Convert" },
          { icon: LayoutGrid, label: "Manage" },
        ],
        breakdown: [
          {
            title: "1. Premium Real Estate Design System & Color Psychology",
            description:
              "Built around a refined luxury palette combining deep emerald/teal as the primary brand color with warm gold as an accent, communicating trust, stability, and premium positioning. Light and dark themes are both supported through CSS-variable-based design tokens, so the whole visual system adapts without touching component logic.",
          },
          {
            title: "2. Luxury Minimalism & Restrained Glassmorphism",
            description:
              "Generous whitespace, rounded surfaces, subtle shadows, and selective glassmorphism create a premium environment without sacrificing usability. Floating controls, overlays, and cards use translucent surfaces and backdrop blur while keeping strong contrast, and the visual language stays restrained so property photography remains the focus.",
          },
          {
            title: "3. Property-First Visual Presentation",
            description:
              "Listing cards use 4:3 imagery with badges, gradient scrims, favorite controls, and contextual actions. Property detail pages expand this into a large gallery with thumbnails, fullscreen viewing, zoom, and carousel interactions, with responsive image loading and lazy loading to reduce layout shift.",
          },
          {
            title: "4. Advanced Property Discovery Engine",
            description:
              "Users search by location and refine through property type, purpose, price range, and property-specific criteria. Sorting, pagination, grid/list switching, and map-based exploration let different user personas work the inventory their own way, with search and filter state encoded into URL query parameters so results are shareable and bookmarkable.",
          },
          {
            title: "5. Typography Hierarchy & Premium Brand Voice",
            description:
              "Plus Jakarta Sans provides the display and heading layer for major property statements and section headings; Inter handles body copy, forms, navigation, and specifications where clarity matters most, across a fluid hierarchy from large display headlines down to compact metadata.",
          },
          {
            title: "6. Responsive Architecture For All Devices",
            description:
              "Desktop provides wide property galleries, persistent filter sidebars, and three-to-four-column layouts; tablet collapses complex controls where needed; mobile uses single-column layouts, filter drawers, and sticky property CTAs, across four primary breakpoints from under 640px through beyond 1280px.",
          },
          {
            title: "7. Saved Property State & Persistence",
            description:
              "Saved properties are managed through Zustand and persisted in localStorage, so a shortlist survives a page refresh. Favoriting works directly from property cards and detail pages, and a dedicated Saved Properties page gives a centralized view of everything shortlisted.",
          },
          {
            title: "8. Property Comparison Engine",
            description:
              "Up to four properties can be added to a comparison list and reviewed through a horizontally scrollable matrix covering pricing, area, specifications, and amenities, with individual properties removable without leaving the page.",
          },
          {
            title: "9. Contextual Lead Capture System",
            description:
              "Lead generation is built into the property experience rather than a disconnected contact page. Reusable React Hook Form + Zod components support Contact Agent, Schedule Visit, Request Callback/Information, Mortgage Inquiry, and newsletter interactions, with local validation and polished success states.",
          },
          {
            title: "10. Future-Ready Data Access Architecture",
            description:
              "UI components are separated from data retrieval through a dedicated lib/api layer. Typed mock data currently powers the property inventory, with function signatures designed so the same calls can later hit real REST or GraphQL endpoints without reworking cards, filters, galleries, or page layouts.",
          },
        ],
      },

      results: {
        keyFeatures: [
          {
            title: "Sophisticated property discovery",
            description:
              "Advanced search and filtering by location, type, purpose, and price, with sorting, pagination, grid/list views, and URL-shareable search state.",
          },
          {
            title: "Premium property listing experience",
            description:
              "Refined cards with high-quality imagery, pricing, specifications, badges, hover zoom, and quick save/compare actions.",
          },
          {
            title: "Immersive property details",
            description:
              "A dedicated page per listing with gallery, fullscreen viewer, amenities, floor plans, nearby places, map, agent info, and related properties.",
          },
          {
            title: "Saved properties",
            description:
              "Zustand-powered shortlist persisted to localStorage, with a dedicated Saved Properties page for quick access.",
          },
          {
            title: "Side-by-side property comparison",
            description:
              "Up to four properties compared at once across price, size, features, and amenities in a consistent matrix.",
          },
          {
            title: "Interactive map experience",
            description:
              "Property listings explored geographically through React Leaflet, architected for future geocoding, clustering, and location intelligence.",
          },
          {
            title: "Mortgage calculator",
            description:
              "A contextual calculator on property pages lets buyers estimate financing scenarios without leaving the listing.",
          },
          {
            title: "Agent & lead experience",
            description:
              "Contact agent, schedule visit, request callback, and mortgage enquiry forms live directly on the property, not a separate contact page.",
          },
          {
            title: "Accessible & performance-focused",
            description:
              "Built toward WCAG 2.1 AA with semantic HTML, keyboard navigation, and ARIA labeling, backed by Server Components, lazy loading, and skeleton states.",
          },
        ],
        before:
          "A typical property portal feels like a crowded database: repetitive cards, overwhelming filters, disconnected enquiry forms, and little emphasis on the property's own visual quality. Users jump between pages to evaluate listings and lose their search context along the way.",
        after:
          "CitizenLink turns property discovery into a premium, structured experience: fast discovery, intelligent filtering, geographic exploration, immersive property detail pages, saved favorites, four-way comparison, mortgage estimation, and agent contact, all without breaking the visitor's journey. The goal is a platform that feels closer to a premium digital property advisor than a conventional listing directory.",
        proof:
          "CitizenLink demonstrates that a real estate platform doesn't have to choose between beauty and functionality, the same system delivers premium presentation, sophisticated discovery tools, accessibility, and lead generation together. Domain types stay centralized, reusable components are separated from containers, and the data-access layer isolates the UI from its data source, so the platform can grow from a polished property portal into a full real estate SaaS ecosystem without a frontend rewrite.",
      },

      techStack: {
        "Frontend Layer": [
          {
            name: "Next.js 15",
            role: "App Router, Server Components, route-based code splitting",
            icon: Code2,
          },
          {
            name: "React",
            role: "Server and client components split by interaction needs",
            icon: Atom,
          },
          {
            name: "TypeScript",
            role: "Strict end-to-end typing with centralized domain models",
            icon: FileCode,
          },
          {
            name: "Tailwind CSS v3",
            role: "Utility-first styling with centralized design tokens",
            icon: Paintbrush,
          },
        ],
        "Design & Animation Layer": [
          {
            name: "Framer Motion",
            role: "Section reveals, card interactions, gallery transitions",
            icon: Wand2,
          },
          {
            name: "shadcn/ui + Radix",
            role: "Accessible primitives for dialogs, drawers, and controls",
            icon: LayoutGrid,
          },
          {
            name: "Lucide React",
            role: "Consistent iconography across navigation and forms",
            icon: Shapes,
          },
          {
            name: "next-themes",
            role: "Light/dark theme management with persistent preference",
            icon: CloudSun,
          },
        ],
        "State & Form Layer": [
          {
            name: "Zustand",
            role: "Client state for saved properties and comparison lists",
            icon: Package,
          },
          {
            name: "URL Search Params",
            role: "Shareable, bookmarkable search, filter, and sort state",
            icon: Link2,
          },
          {
            name: "React Hook Form",
            role: "Performant form state for lead-generation workflows",
            icon: ListChecks,
          },
          {
            name: "Zod",
            role: "Schema-based validation for forms and application data",
            icon: CheckCircle2,
          },
        ],
        "Property Experience Layer": [
          {
            name: "React Leaflet",
            role: "Open-source interactive maps and location visualization",
            icon: Map,
          },
          {
            name: "Embla Carousel",
            role: "Property galleries and related-property carousels",
            icon: ImageIcon,
          },
          {
            name: "next/image",
            role: "Responsive image optimization and layout-shift prevention",
            icon: Gauge,
          },
        ],
        "Backend Layer": [
          {
            name: "Next.js Route Handlers",
            role: "REST API layer for the Phase 2 backend architecture",
            icon: Network,
          },
          {
            name: "Prisma 6",
            role: "Type-safe database access and schema management",
            icon: Layers,
          },
          {
            name: "PostgreSQL 16",
            role: "Relational persistence for properties, agents, and leads",
            icon: Database,
          },
          {
            name: "Auth.js + JWT",
            role: "Authentication and session architecture, bcrypt-hashed",
            icon: KeyRound,
          },
        ],
        "Data & Service Layer": [
          {
            name: "Pino",
            role: "Structured application logging",
            icon: FileText,
          },
          {
            name: "ioredis",
            role: "Optional Redis connectivity for caching and rate limiting",
            icon: Zap,
          },
          {
            name: "Cloudinary",
            role: "Optional property and media asset management",
            icon: Cloud,
          },
        ],
        "Communication & Deployment": [
          {
            name: "Nodemailer / Resend",
            role: "Transactional email for leads, appointments, and accounts",
            icon: Mail,
          },
          {
            name: "Docker + Compose",
            role: "Containerized deployment with Postgres and optional Redis",
            icon: Boxes,
          },
        ],
      },

      // Deployed on Vercel — shows the live browser-frame embed instead of
      // the "coming soon" placeholder. See LivePreviewTab in CaseStudyPage.
      livePreview: "https://citizenlink.vercel.app/",

      scalability: [
        {
          title: "Property Catalog Expansion",
          description:
            "Currently around 50 realistic mock properties, with filtering, pagination, sorting, and related-property queries isolated from presentation components so the catalog can grow well beyond that without touching the UI.",
        },
        {
          title: "Backend API Evolution",
          description:
            "Phase 1 mock data sits behind typed API functions; Phase 2 swaps those implementations for real REST services, keeping UI components largely independent from transport details.",
        },
        {
          title: "Real Estate Marketplace Expansion",
          description:
            "Can evolve from a discovery portal into a full marketplace supporting agents, agencies, landlords, developers, property managers, and commercial listings.",
        },
        {
          title: "Authentication & User Accounts",
          description:
            "Backend architecture is ready for real accounts, JWT authentication with rotating refresh tokens, RBAC, and personalized saved/compare experiences.",
        },
        {
          title: "Agent & CRM Expansion",
          description:
            "Lead management can grow into a full CRM with agent inboxes, lead assignment, appointment management, and status pipelines.",
        },
        {
          title: "Property Lifecycle Management",
          description:
            "Backend property capabilities support full CRUD and lifecycle states, draft, published, and archived, for real listing management.",
        },
        {
          title: "Map & Location Intelligence",
          description:
            "The existing map layer can extend to production geocoding, clustering, commute information, and saved geographic searches.",
        },
        {
          title: "AI-Powered Property Discovery",
          description:
            "Architecture is prepared for natural-language search and AI-assisted recommendations, letting users describe requirements conversationally.",
        },
        {
          title: "Communication & Live Engagement",
          description:
            "Messaging and notifications can expand into real-time agent chat, appointment reminders, and automated lead follow-ups.",
        },
        {
          title: "Payment & Booking Expansion",
          description:
            "Future phases can add deposits, property booking, paid listings, premium agent subscriptions, and advertising packages.",
        },
        {
          title: "CMS & Content Expansion",
          description:
            "Can grow toward CMS-managed city guides, neighborhood articles, market reports, and SEO-focused real estate content.",
        },
        {
          title: "White-Label Design System",
          description:
            "CSS-variable-based tokens for color, spacing, radius, and typography make the visual system adaptable for future white-labeling.",
        },
        {
          title: "Internationalization Ready",
          description:
            "Centralized copy, typed structures, and isolated UI components provide a strong foundation for multilingual, multi-market portals.",
        },
      ],
    },
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

    caseStudy: {
      category: "AI Automation",
      techIcons: [
        { name: "Groq / Llama", icon: Brain },
        { name: "n8n", icon: Workflow },
        { name: "Google Sheets", icon: Sheet },
        { name: "Email (SMTP)", icon: Mail },
      ],
      summary:
        "An AI-powered executive briefing agent. It pulls daily sales data from Google Sheets, aggregates live crypto, currency, weather, GitHub, and tech-news signals in parallel, has an LLM write a structured executive summary and recommendation, then renders and emails a fully branded HTML dashboard, hands-free, on schedule.",

      overview: {
        problem: [
          "Executives need a daily business pulse, but compiling sales figures, market data, and external context by hand is slow and inconsistent",
          "Sales data sits in spreadsheets, disconnected from the crypto, currency, and industry signals that inform real decisions",
          "No reliable reporting cadence, insight quality depends on whoever has time to assemble the numbers that day",
          "Raw metrics without narrative force leaders to interpret the 'so what' themselves",
        ],
        solution: [
          "Automatically pulls daily sales data from Google Sheets and computes core KPIs, revenue, transaction count, average sale, highest and lowest sale",
          "Aggregates external context in parallel: crypto prices, FX rates, local weather, GitHub activity, and top tech news",
          "AI (Groq-hosted Llama) analyzes the combined dataset and writes a structured executive summary with key insights and a recommendation",
          "Report is rendered into a branded HTML dashboard and delivered straight to inboxes on schedule, no manual compilation required",
        ],
        workflow: [
          { icon: Calendar, label: "Schedule" },
          { icon: Download, label: "Fetch" },
          { icon: Route, label: "Merge" },
          { icon: Sparkles, label: "Compute" },
          { icon: Brain, label: "Analyze" },
          { icon: Send, label: "Deliver" },
        ],
        breakdown: [
          {
            title: "1. Scheduled Multi-Source Data Intake",
            description:
              "A Schedule Trigger fires at a set interval and fans out to six parallel API calls at once, Google Sheets for sales records, CoinGecko for crypto prices, ExchangeRate API for FX rates, Open-Meteo for local weather, GitHub for repository stats, and Hacker News (Algolia) for top tech stories.",
          },
          {
            title: "2. Parallel Branch Merging",
            description:
              "A Merge node combines all six branches by position into a single item, so every downstream node receives the complete dataset in one pass instead of chaining sequential lookups.",
          },
          {
            title: "3. KPI Calculation Engine",
            description:
              "A JavaScript Code node processes raw Google Sheets rows to calculate total revenue, transaction count, average sale, and highest/lowest sale, then normalizes every external source into one structured JSON object ready for analysis.",
          },
          {
            title: "4. AI-Generated Executive Analysis",
            description:
              "The structured metrics are passed to a Basic LLM Chain running on Groq Chat Model, prompted to act as a senior business intelligence analyst. Output is constrained to a fixed structure, Executive Summary, key insights, and one recommendation, concise, plain-text, decision-ready.",
          },
          {
            title: "5. Dynamic HTML Report Generation",
            description:
              "An Edit Fields node maps computed KPIs and AI output into a fully styled HTML email with inline CSS, KPI cards, a live-data table, and a dedicated AI analysis section, so every value is pulled directly from the workflow run.",
          },
          {
            title: "6. Automated Email Delivery",
            description:
              "The finished HTML report is sent automatically via the Email Distributor node, giving stakeholders a polished, ready-to-read daily brief with zero manual compilation.",
          },
        ],
      },

      results: {
        keyFeatures: [
          {
            title: "Multi-source data aggregation",
            description:
              "Combines internal business data with live external signals, crypto markets, currency exchange, weather, developer activity, and tech news, into a single unified report.",
          },
          {
            title: "AI-powered insight generation",
            description:
              "Uses an LLM to interpret raw metrics and produce a structured executive summary, key insights, and a clear recommendation, narrative context, not just numbers.",
          },
          {
            title: "Automated KPI calculation",
            description:
              "Custom JavaScript computes total revenue, transaction count, average sale, and highest/lowest sale directly from live spreadsheet data, no manual spreadsheet math.",
          },
          {
            title: "Scheduled, hands-free reporting",
            description:
              "Runs automatically on a recurring schedule with zero manual triggering, the report is generated and delivered without anyone lifting a finger.",
          },
          {
            title: "Branded HTML dashboard",
            description:
              "Renders as a fully designed HTML dashboard with KPI cards, a data table, and a highlighted AI analysis section, not a plain-text email.",
          },
          {
            title: "Parallel data processing",
            description:
              "All six data sources are fetched simultaneously and merged by position, keeping the workflow fast even as more sources are added.",
          },
        ],
        before:
          "Manually checking spreadsheets, market prices, and news separately each morning, no consistent reporting format, insights dependent on whoever has time to compile them, zero automated narrative or recommendation.",
        after:
          "One consolidated dashboard delivered automatically every day, sales KPIs calculated instantly, market and industry context included alongside business data, AI-written executive summary with actionable recommendations, consistent branded format every time.",
        proof:
          "This system demonstrates that AI can turn disparate, disconnected data sources, internal and external, into a single coherent narrative, giving executives a daily briefing that would otherwise require a dedicated analyst to compile by hand.",
      },

      techStack: {
        "AI Layer": [
          {
            name: "Groq (Llama)",
            role: "Fast-inference LLM for executive summary generation",
            icon: Brain,
          },
          { name: "n8n", role: "Workflow orchestration engine", icon: Workflow },
        ],
        "Data Layer": [
          {
            name: "Google Sheets",
            role: "Sales and transaction data source",
            icon: Sheet,
          },
          {
            name: "CoinGecko API",
            role: "Live cryptocurrency prices",
            icon: Bitcoin,
          },
          {
            name: "ExchangeRate API",
            role: "USD conversion rates",
            icon: ArrowLeftRight,
          },
          {
            name: "Open-Meteo",
            role: "Local weather data",
            icon: CloudSun,
          },
          {
            name: "GitHub API",
            role: "Repository activity metrics",
            icon: GitBranch,
          },
          {
            name: "Hacker News (Algolia)",
            role: "Top tech industry stories",
            icon: Newspaper,
          },
        ],
        "Communication Layer": [
          { name: "Email (SMTP)", role: "Automated report delivery", icon: Mail },
          {
            name: "HTML / CSS",
            role: "Custom-styled dashboard rendering",
            icon: FileCode,
          },
        ],
      },

      // Original pixel dimensions kept alongside each image so the
      // Screenshots tab's bento grid can size each tile to its real aspect
      // ratio instead of cropping everything to a uniform box.
      screenshots: [
        {
          src: execIntelligenceThumb,
          alt: "Full n8n executive intelligence workflow",
          width: 1492,
          height: 729,
        },
        {
          src: execIntelligenceKpiDashboard,
          alt: "Executive Intelligence Dashboard KPI report",
          width: 699,
          height: 796,
        },
        {
          src: execIntelligenceAiAnalysis,
          alt: "AI Executive Analysis section of the report",
          width: 666,
          height: 434,
        },
      ],

      scalability: [
        {
          title: "LLM Provider Flexibility",
          description:
            "Currently runs on Groq-hosted Llama; can swap to OpenAI GPT-4o, Anthropic Claude, or Gemini for deeper analysis or longer-form reporting.",
        },
        {
          title: "Data Source Expansion",
          description:
            "Built on a parallel-fetch-and-merge pattern, so new sources (stock indices, competitor pricing, social sentiment, internal CRM data) can be added as additional branches without reworking core logic.",
        },
        {
          title: "Delivery Channel Flexibility",
          description:
            "Currently delivered via email; can extend to Slack, Microsoft Teams, or a live web dashboard using the same computed dataset.",
        },
        {
          title: "Report Frequency Control",
          description:
            "Schedule trigger can be adjusted for hourly, daily, or weekly cadence, or triggered on-demand via webhook for ad-hoc executive requests.",
        },
        {
          title: "Multi-Recipient Distribution",
          description:
            "Can expand from a single recipient to a distribution list or role-based routing (e.g., finance gets a KPI-focused cut, ops gets a different one).",
        },
        {
          title: "Historical Tracking",
          description:
            "Report data can be logged to a database or spreadsheet on each run to build a historical trendline for revenue, market conditions, and AI-flagged insights over time.",
        },
        {
          title: "Custom Alerting",
          description:
            "Can add threshold-based logic to trigger urgent notifications when KPIs (e.g., revenue drop, crypto volatility) cross defined limits, rather than waiting for the scheduled report.",
        },
        {
          title: "Template Versioning",
          description:
            "HTML layout, KPI set, and AI prompt structure can be versioned so different stakeholders receive tailored report formats from the same pipeline.",
        },
      ],
    },
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

    caseStudy: {
      category: "AI Automation",
      techIcons: [
        { name: "Groq / Llama", icon: Brain },
        { name: "n8n", icon: Workflow },
        { name: "Google Sheets", icon: Sheet },
        { name: "Calendly", icon: Calendar },
      ],
      summary:
        "An AI-powered recruiting pipeline. It extracts resumes from new applications, has Llama 3.3 70B structure candidate profiles into strict JSON, scores each candidate against live job requirements with a weighted engine, logs every decision to a hiring pipeline, and routes outreach, Calendly scheduling for shortlists, polished declines for rejects, and a real-time Slack digest for the team.",

      overview: {
        problem: [
          "Manual resume screening is slow, inconsistent, and breaks down as application volume grows",
          "Recruiters waste hours opening PDFs, comparing skills to job requirements, and rewriting the same accept/decline emails",
          "Strong candidates wait too long while weak applications clog the pipeline",
          "There's no structured record of fit score, missing skills, or why someone was shortlisted, held, or rejected",
        ],
        solution: [
          "New applications trigger the workflow automatically from Google Sheets, intake starts the moment a row is added",
          "Resumes are downloaded from Google Drive, parsed to text, and shaped into a structured candidate object",
          "Llama 3.3 70B extracts normalized skills and experience into strict JSON; a weighted engine scores fit against live requirements",
          "Results are logged to a pipeline sheet, candidates are routed by score threshold, and recruiters get a Slack digest in real time",
        ],
        workflow: [
          { icon: Zap, label: "Trigger" },
          { icon: FolderOpen, label: "Extract" },
          { icon: FileText, label: "Structure" },
          { icon: Brain, label: "Analyze" },
          { icon: Scale, label: "Score" },
          { icon: Route, label: "Route" },
        ],
        breakdown: [
          {
            title: "1. Application Intake & Resume Extraction",
            description:
              "A Google Sheets Trigger fires on rowAdded when a candidate submits an application. The workflow resolves the Google Drive file ID from the row, downloads the resume PDF, and extracts the full text, turning an unstructured upload into machine-readable input.",
          },
          {
            title: "2. Candidate Object Construction",
            description:
              "A Code node maps intake columns into a clean candidate object, Full Name, Email, Phone, Position, Years of Experience, Location, LinkedIn, and GitHub, then attaches the extracted resume text. This normalized payload becomes the single source of truth for AI analysis, scoring, emails, and logging.",
          },
          {
            title: "3. AI ATS Extraction (Llama 3.3 70B)",
            description:
              "A Basic LLM Chain running llama-3.3-70b-versatile via Groq acts as a technical recruiter/ATS, prompted to return only valid JSON covering summary, skills, languages, frameworks, databases, cloud platforms, tools, education, certifications, experience, projects, strengths, and weaknesses. Skills are normalized and missing fields return empty values instead of invented data. A Parse AI JSON node strips fence artifacts and merges contact fields for downstream use.",
          },
          {
            title: "4. Weighted Scoring Engine",
            description:
              "Candidate JSON is merged with live job requirements from Google Sheets, Required Skills, Preferred Skills, Minimum Experience, and Minimum Score. Custom logic fuzzy-matches skills across all stack categories, then computes an explainable fit score: 60% required skills, 20% preferred skills, 20% experience, with matched/missing skills and plain-text reasoning for every decision.",
          },
          {
            title: "5. Threshold Routing & Branded Email Outreach",
            description:
              "Score bands drive automated communication: at or above the minimum score routes to an HTML Gmail with a Calendly scheduling CTA, around 70% of the minimum holds for manual review, and anything below sends a polished HTML decline, both templates fully styled inline HTML, ready for inbox rendering.",
          },
          {
            title: "6. Pipeline Logging & Slack Digest",
            description:
              "Every scored candidate is appended to a Google Sheets hiring pipeline with fit score, status, and reasoning. A digest is built and sent to Slack so recruiters see shortlists and review cases immediately, without babysitting the spreadsheet.",
          },
        ],
      },

      results: {
        keyFeatures: [
          {
            title: "Event-driven application intake",
            description:
              "Screening starts the moment a new Google Sheets row is added, no manual batch runs, no forgotten applications sitting unread.",
          },
          {
            title: "Resume-to-structure pipeline",
            description:
              "Downloads the PDF from Google Drive, extracts text, and builds a clean candidate object from form fields plus resume content, unstructured applications become structured hiring data.",
          },
          {
            title: "Strict JSON ATS extraction",
            description:
              "Llama 3.3 70B extracts a fixed ATS schema with skill normalization and anti-hallucination rules, portfolio-grade structure, not free-form AI summaries.",
          },
          {
            title: "Explainable weighted scoring",
            description:
              "Transparent fit scoring, 60% required skills, 20% preferred, 20% experience, with fuzzy matching, missing-skill lists, and written reasoning for every outcome.",
          },
          {
            title: "Smart threshold routing",
            description:
              "A configurable minimum score drives three paths: Calendly invite for shortlists, manual review for the mid-band, and branded decline emails for clear rejects, speed where it's safe, humans where it matters.",
          },
          {
            title: "Pipeline logging + Slack visibility",
            description:
              "Every decision is logged to Sheets, and Slack keeps the hiring team informed in real time, full audit trail, zero spreadsheet babysitting.",
          },
        ],
        before:
          "Recruiters open each PDF manually, compare skills by eye, rewrite accept/decline emails from scratch, lose track of why decisions were made, and strong candidates wait while volume piles up.",
        after:
          "Applications trigger automatic resume extraction and Llama-powered ATS parsing, a weighted engine produces an explainable fit score, shortlisted candidates get a Calendly scheduling email, rejects get a polished decline, mid-band cases stay in manual review, and the team is alerted on Slack instantly.",
        proof:
          "This system shows that recruiting operations can combine document extraction, constrained LLM structuring, and deterministic scoring into one reliable pipeline, automating first-pass screening while keeping humans in the loop for borderline decisions.",
      },

      techStack: {
        "AI Layer": [
          {
            name: "Groq (Llama 3.3 70B Versatile)",
            role: "Strict JSON resume/ATS extraction",
            icon: Brain,
          },
          { name: "n8n", role: "Workflow orchestration engine", icon: Workflow },
        ],
        "Data Layer": [
          {
            name: "Google Sheets",
            role: "Application intake, job requirements, pipeline log",
            icon: Sheet,
          },
          {
            name: "Google Drive",
            role: "Resume storage and download",
            icon: FolderOpen,
          },
          {
            name: "PDF / File Extraction",
            role: "Resume text extraction",
            icon: FileText,
          },
          {
            name: "Custom JS Scoring Engine",
            role: "Fuzzy skill matching, weighted fit score, routing",
            icon: Calculator,
          },
        ],
        "Communication Layer": [
          {
            name: "Gmail API",
            role: "Shortlist and decline HTML email delivery",
            icon: Mail,
          },
          {
            name: "Calendly",
            role: "30-minute screening-call scheduling",
            icon: Calendar,
          },
          { name: "Slack API", role: "Recruiter digest notifications", icon: Hash },
          {
            name: "HTML / CSS",
            role: "Branded candidate-facing email templates",
            icon: FileCode,
          },
        ],
      },

      // Original pixel dimensions kept alongside each image so the
      // Screenshots tab's bento grid can size each tile to its real aspect
      // ratio instead of cropping everything to a uniform box.
      screenshots: [
        {
          src: candidateScreeningThumb,
          alt: "Full n8n candidate screening workflow",
          width: 1546,
          height: 617,
        },
        {
          src: candidateScreeningShortlistEmail,
          alt: "Shortlist email with Calendly scheduling CTA",
          width: 1140,
          height: 658,
        },
        {
          src: candidateScreeningDeclineEmail,
          alt: "Branded candidate decline email",
          width: 1152,
          height: 623,
        },
      ],

      scalability: [
        {
          title: "LLM Provider Flexibility",
          description:
            "Currently runs on Groq Llama 3.3 70B; can swap to GPT-4o, Claude, or Gemini for deeper resume reasoning or multilingual screening.",
        },
        {
          title: "Config-Driven Roles",
          description:
            "Required Skills, Preferred Skills, Minimum Experience, and Minimum Score live in Sheets, new roles are screened by updating data, not rewriting the graph.",
        },
        {
          title: "Intake Source Expansion",
          description:
            "Trigger can extend from Google Sheets to Typeform, Greenhouse, Lever, Ashby, or a careers-page webhook without redesigning scoring or routing.",
        },
        {
          title: "OCR for Scanned Resumes",
          description:
            "Text extraction can add OCR for image-based PDFs so non-selectable resumes don't drop out of the pipeline.",
        },
        {
          title: "Human-in-the-Loop Review",
          description:
            "Screening-band candidates can gain Slack approve/reject actions before any email sends.",
        },
        {
          title: "Multi-Role / Multi-Team Routing",
          description:
            "One intake flow can fan out by department, each with its own requirements row, email copy, Calendly link, and Slack channel.",
        },
        {
          title: "ATS / CRM Sync",
          description:
            "Fields like fit score, status, matched required skills, and reasoning can push into HubSpot, Airtable, Notion, or a full ATS via API.",
        },
        {
          title: "Hiring Analytics",
          description:
            "Pipeline logs can feed Looker Studio or Power BI for pass-through rates, skill-gap trends, and time-to-screen reporting over time.",
        },
      ],
    },
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

    caseStudy: {
      category: "AI Automation",
      techIcons: [
        { name: "Groq / GPT-OSS", icon: Brain },
        { name: "n8n", icon: Workflow },
        { name: "Google Sheets", icon: Sheet },
        { name: "Slack", icon: Hash },
      ],
      summary:
        "An AI-powered accounts-payable pipeline. It watches Gmail for invoices and receipts, extracts structured financial data with GPT-OSS 120B via Groq, validates totals and duplicates against deterministic business rules, logs clean records to a Google Sheets ledger, and alerts the team on Slack the moment something needs review.",

      overview: {
        problem: [
          "Finance teams waste hours opening invoice PDFs, copying fields into spreadsheets, and double-checking math by hand",
          "Incoming invoices arrive in email with no consistent format, vendors, dates, and line items vary across every document",
          "Duplicate invoices slip through when the same bill is re-sent, forwarded, or logged twice under a different filename",
          "Errors in subtotals, tax, and totals often go unnoticed until reconciliation, or until someone catches them manually",
        ],
        solution: [
          "Gmail is monitored automatically for messages with invoice, receipt, or bill attachments, no manual forwarding required",
          "PDF attachments are parsed to text and passed to GPT-OSS 120B (Groq), which returns strict JSON: vendor, dates, currency, totals, and line items",
          "A validation engine checks required fields, math accuracy, line-item sums, and duplicate invoice numbers against the ledger",
          "Valid invoices are appended to Google Sheets; invalid or suspicious ones trigger a structured Slack alert with vendor, invoice #, total, and issue list",
        ],
        workflow: [
          { icon: Mail, label: "Watch" },
          { icon: FileText, label: "Extract" },
          { icon: Brain, label: "Parse" },
          { icon: Search, label: "Check" },
          { icon: ShieldCheck, label: "Validate" },
          { icon: Route, label: "Route" },
        ],
        breakdown: [
          {
            title: "1. Gmail Intake & Attachment Filtering",
            description:
              "A Gmail Trigger polls the inbox every minute for Message Received events matching has:attachment (invoice OR receipt OR bill). An IF node confirms the message contains attachments before processing, so only relevant financial documents enter the pipeline, not every email in the inbox.",
          },
          {
            title: "2. PDF Text Extraction",
            description:
              "The Extract from PDF node converts the attachment into raw text for downstream AI parsing. This turns vendor-specific PDF layouts, tables, headers, footers, into a consistent text payload regardless of invoice design.",
          },
          {
            title: "3. AI Structured Field Extraction (GPT-OSS 120B)",
            description:
              "A Basic LLM Chain running openai/gpt-oss-120b via Groq extracts invoice fields into a fixed JSON schema: vendor, invoice number, invoice date, due date, currency, subtotal, tax, total, and line items (description, quantity, unit price, amount). A Structured Output Parser enforces the schema. The prompt requires only valid JSON, no markdown, no commentary, and explicitly forbids inventing missing data (null/0 when absent).",
          },
          {
            title: "4. Duplicate Detection",
            description:
              "Before validation completes, a Google Sheets lookup checks whether the extracted invoice number already exists in the ledger. This prevents double-logging when the same invoice is re-sent, forwarded, or processed twice from different email threads.",
          },
          {
            title: "5. Business Rule Validation Engine",
            description:
              "A Code node merges extracted fields with duplicate-check results and runs four deterministic rules: required fields (vendor, invoice number, and total must be present), total math (subtotal + tax must equal total within $0.01 tolerance), duplicate guard (invoice number must not already exist in the sheet), and line-item integrity (sum of line-item amounts must match subtotal within $0.01 tolerance). Each run outputs is_valid, a detailed issues array, and a processed_at timestamp for auditability.",
          },
          {
            title: "6. Routing, Ledger Logging & Slack Alerting",
            description:
              "A Valid? IF node splits the flow: valid invoices are appended to a clean Google Sheets ledger; invalid invoices trigger a Slack alert with structured context, vendor, invoice number, total, and a bulleted issue list, so finance can review duplicates, math mismatches, or missing fields without opening the workflow.",
          },
        ],
      },

      results: {
        keyFeatures: [
          {
            title: "Intelligent Gmail monitoring",
            description:
              "Polls Gmail on a recurring schedule with a targeted search filter, only messages with invoice, receipt, or bill attachments enter the pipeline, reducing noise and wasted runs.",
          },
          {
            title: "PDF-to-structured-data extraction",
            description:
              "Converts unstructured PDF invoices into a normalized JSON object with vendor details, dates, currency, totals, and itemized line items, ready for spreadsheet logging or downstream accounting.",
          },
          {
            title: "Schema-constrained AI parsing",
            description:
              "Uses a structured output parser with strict JSON rules and anti-hallucination guardrails, the model returns exactly the fields defined in the schema, nothing invented.",
          },
          {
            title: "Deterministic validation layer",
            description:
              "AI extraction is followed by code-based business rules, required fields, subtotal + tax = total, line-item sum checks, and duplicate detection, so bad data never silently enters the ledger.",
          },
          {
            title: "Duplicate invoice prevention",
            description:
              "Cross-references every invoice number against the existing Google Sheets ledger before append, protecting against double-payment risk and duplicate bookkeeping entries.",
          },
          {
            title: "Actionable Slack alerts",
            description:
              "Invalid invoices surface in Slack with vendor, invoice #, total, and precise issue details, finance sees exactly what failed and why, without digging through email or n8n execution logs.",
          },
        ],
        before:
          "Manually opening PDF attachments, copying fields into spreadsheets, checking math by hand, missing duplicates until reconciliation, and no structured log of why an invoice was rejected or flagged.",
        after:
          "Invoices are detected automatically from Gmail, parsed into structured JSON by GPT-OSS 120B, validated against business rules, logged cleanly to Sheets when valid, and flagged on Slack with precise issue details when not, consistent, auditable, hands-free intake.",
        proof:
          "This system demonstrates that finance operations can combine document extraction, constrained LLM parsing, and deterministic validation into one reliable pipeline, automating invoice intake while keeping humans in the loop only when data integrity actually requires it.",
      },

      techStack: {
        "AI Layer": [
          {
            name: "Groq (GPT-OSS 120B)",
            role: "Structured invoice field extraction from PDF text",
            icon: Brain,
          },
          {
            name: "Structured Output Parser",
            role: "Schema-enforced JSON response",
            icon: FileCheck,
          },
          { name: "n8n", role: "Workflow orchestration engine", icon: Workflow },
        ],
        "Data Layer": [
          {
            name: "Gmail API",
            role: "Inbox monitoring and attachment intake",
            icon: Mail,
          },
          {
            name: "PDF / File Extraction",
            role: "Invoice text extraction from attachments",
            icon: FileText,
          },
          {
            name: "Google Sheets",
            role: "Duplicate lookup and clean invoice ledger",
            icon: Sheet,
          },
          {
            name: "Custom JS Validation Engine",
            role: "Required-field checks, math validation, duplicate guard",
            icon: Calculator,
          },
        ],
        "Communication Layer": [
          {
            name: "Slack API",
            role: "Invalid-invoice alerts with vendor, invoice #, total, and issue list",
            icon: Hash,
          },
          {
            name: "Google Sheets API",
            role: "Automated ledger append for valid records",
            icon: Sheet,
          },
        ],
      },

      // Original pixel dimensions kept alongside each image so the
      // Screenshots tab's bento grid can size each tile to its real aspect
      // ratio instead of cropping everything to a uniform box.
      screenshots: [
        {
          src: invoiceProcessingThumb,
          alt: "Full n8n invoice processing workflow",
          width: 1535,
          height: 506,
        },
        {
          src: invoiceProcessingSlackAlerts,
          alt: "Slack finance-alerts channel showing flagged invoices with issue details",
          width: 934,
          height: 672,
        },
      ],

      scalability: [
        {
          title: "LLM Provider Flexibility",
          description:
            "Currently runs on Groq GPT-OSS 120B; can swap to Llama 3.3 70B, GPT-4o, Claude, or Gemini for higher-accuracy extraction on complex multi-page or non-English invoices.",
        },
        {
          title: "Intake Channel Expansion",
          description:
            "Gmail trigger can extend to Outlook, Google Drive folder watch, or a shared AP inbox webhook without redesigning extraction or validation logic.",
        },
        {
          title: "Multi-Attachment Handling",
          description:
            "Built to process PDF attachments per message; can loop over multiple files per email (invoice + receipt) with per-file validation and logging.",
        },
        {
          title: "Approval Workflow Optional",
          description:
            "Valid invoices can route through a Slack approve/reject step before final ledger append for high-value or new-vendor bills.",
        },
        {
          title: "Accounting System Sync",
          description:
            "Structured JSON output can push directly into QuickBooks, Xero, or NetSuite via API using the same validated payload.",
        },
        {
          title: "Vendor-Specific Rules",
          description:
            "Validation engine can add per-vendor tolerance rules, expected currency checks, or PO-number matching without changing the core extraction flow.",
        },
        {
          title: "Audit Trail & Historical Logging",
          description:
            "processed_at, issues, and raw extraction can be logged to a separate audit sheet or database for compliance and reconciliation reporting.",
        },
        {
          title: "Threshold Alerting",
          description:
            "Can add logic to flag invoices above a dollar threshold, overdue due dates, or unknown vendors for priority review before payment.",
        },
      ],
    },
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

    caseStudy: {
      category: "Graphic Design",
      techIcons: [
        { name: "Brand Templates", icon: LayoutGrid },
        { name: "Photography", icon: ImageIcon },
        { name: "Typography", icon: Type },
        { name: "Print-Ready Output", icon: FileCheck },
      ],
      summary:
        "An automated design system built for restaurant chains that generates premium, on-brand standees for every location. It combines brand assets, product photography, and operational details, hours, services, into elegant point-of-sale marketing pieces, keeping a luxury positioning with refined typography and elegant spacing without a designer touching every file.",

      overview: {
        problem: [
          "Restaurant chains struggle to create consistent standee designs across multiple locations",
          "Manual design work for each branch is time-consuming and costly, requiring designer involvement",
          "Maintaining brand consistency while incorporating location-specific details (hours, services) is challenging",
          "Standees need to balance promotional messaging, operational hours, and food imagery, difficult to coordinate manually",
          "Updates for seasonal menus, new services, or location changes require full redesigns",
        ],
        solution: [
          "Consistent brand identity, logo, color palette, typography, decorative elements, applied automatically to every standee",
          "Premium food photography integrated seamlessly into every layout",
          "Location-specific operational details, hours, services offered, inserted without manual editing",
          "Professional layout that balances promotional messaging and operational information",
          "Multiple design variations for different restaurant concepts within the same brand",
          "Every design keeps a luxury positioning with refined typography and elegant spacing, no manual designer intervention needed for routine standee creation",
        ],
      },

      gallery: [
        {
          src: restaurantStandeeThumb,
          alt: "Restaurant standee design, full resolution",
          width: 3840,
          height: 2880,
        },
      ],

      designProcess: {
        input: [
          "Restaurant/brand name and logo",
          "Location-specific operating hours (day-by-day schedule)",
          "Services offered (lunch, dinner, takeout, catering)",
          "Food product photography (high-resolution images of signature dishes)",
          "Brand color palette and style guidelines",
          "Marketing tagline or key messaging",
        ],
        workflow: [
          { icon: Download, label: "Input" },
          { icon: LayoutGrid, label: "Template" },
          { icon: Paintbrush, label: "Brand" },
          { icon: ImageIcon, label: "Imagery" },
          { icon: FileCheck, label: "Output" },
        ],
        engine:
          "The engine selects the right standee template based on restaurant concept, primary focus, and location requirements, then applies brand assets, logo placement, color scheme, typography hierarchy, and decorative elements, throughout. Operational details, hours, services, location, are formatted with a clear visual hierarchy and decorative framing, while food photography is intelligently placed, color-corrected, and enhanced with shadow and depth to anchor the design. Messaging is arranged in clear priority, brand name and premium positioning first, value proposition second, operational details third, with photography as the visual anchor, guiding the viewer's eye and emphasizing brand promise over logistics.",
        refinements:
          "Each standee generates as a full-size, print-ready design at high resolution alongside a mobile-optimized preview for quick approvals, with variations for different product photos, seasonal messaging, or location-specific versions, all maintaining professional quality and brand consistency.",
        qa: "Every final design is checked for brand guideline compliance, colors, typography, logo treatment, visual balance and composition, legibility from a distance, image quality and placement, and print readiness, resolution, color mode, bleed safety. Any inconsistency triggers automatic refinement before delivery.",
      },

      keyFeatures: [
        {
          title: "Brand-consistent templates",
          description:
            "Standees automatically maintain design language, color palette, typography, and decorative elements, ensuring every location feels like part of the same premium brand.",
        },
        {
          title: "Multi-location scalability",
          description:
            "Create standees for 1 location or 100+ simultaneously, with each automatically incorporating location-specific hours, services, and branding nuances.",
        },
        {
          title: "Integrated food photography",
          description:
            "Signature dish photography is intelligently placed, sized, and color-corrected to become the visual focal point while complementing the overall design.",
        },
        {
          title: "Operational information formatting",
          description:
            "Hours, services, and location details are beautifully formatted with elegant typography and decorative framing, transforming routine information into part of the premium aesthetic.",
        },
        {
          title: "Multiple design variations",
          description:
            "Generate alternate layouts highlighting different menu items, seasonal promotions, or restaurant concepts, all maintaining core brand identity.",
        },
        {
          title: "Marketing & information balance",
          description:
            "Messaging hierarchy balances premium brand positioning (\"Hand Rolled Hand Crafted\") with practical operational details so neither overwhelms the design.",
        },
        {
          title: "Print-ready output",
          description:
            "Every standee delivers with correct specifications, resolution, color profile, bleed and safety margins, eliminating prep time before printing.",
        },
        {
          title: "Luxury positioning",
          description:
            "Refined typography, elegant spacing, and decorative flourishes reinforce premium positioning rather than looking generic or discount-oriented.",
        },
      ],

      useCases: [
        {
          title: "New Location Launch",
          description:
            "Generate standees highlighting \"Now Open\" messaging, hours, services, and signature dishes within 24 hours of location approval, faster than waiting for designer availability.",
        },
        {
          title: "Menu Refresh or Seasonal Promotion",
          description:
            "Update standees to feature new dish photography or seasonal menu items while keeping the same design language consistent across every location.",
        },
        {
          title: "Multi-Location Expansion",
          description:
            "Rolling out to 20+ new locations generates location-specific standees for all of them simultaneously, complete with local hours and services.",
        },
        {
          title: "Promotional Campaigns",
          description:
            "Create limited-time offer standees, catering services, new menu launches, special events, that feel premium and on-brand rather than hasty or discount-focused.",
        },
        {
          title: "Brand Evolution",
          description:
            "If brand guidelines change, new logo, color palette, typography, every standee across the entire restaurant network regenerates automatically to reflect the update.",
        },
        {
          title: "Delivery & Takeout Focus",
          description:
            "Generate standees emphasizing takeout and delivery services, especially useful for quick-service or ghost kitchen concepts, with seamless brand integration.",
        },
        {
          title: "Catering & Private Events",
          description:
            "Create standees promoting catering services or event capabilities with elegant presentation of signature dishes and service details.",
        },
      ],

      scalability: [
        {
          title: "Template Variations",
          description:
            "Store multiple standee layouts, single-panel, multi-panel, portrait, landscape, for different promotional needs and location constraints.",
        },
        {
          title: "Brand Kit Expansion",
          description:
            "Add new restaurants or concepts to the design system while maintaining core template logic, each brand gets its own color palette and typography while sharing system efficiency.",
        },
        {
          title: "Location-Specific Customization",
          description:
            "Automatically insert location name, hours, phone number, and address into designs without manual adjustments.",
        },
        {
          title: "Seasonal Design Themes",
          description:
            "Create seasonal variations, holiday colors, spring promotions, summer events, that apply across all locations simultaneously.",
        },
        {
          title: "Product Photography Rotation",
          description:
            "Maintain a library of dish photography and automatically rotate featured items, generating fresh standees without redesigning.",
        },
        {
          title: "Promotional Message Templates",
          description:
            "Store pre-approved messaging for common promotions, new menu, limited-time offers, loyalty programs, for quick deployment.",
        },
        {
          title: "Multi-Concept Support",
          description:
            "If a restaurant group operates multiple concepts, fine dining, casual, quick-service, each gets a tailored template while sharing the design system's infrastructure.",
        },
        {
          title: "Approval Workflow Integration",
          description:
            "Add a Slack or email approval step before a standee is finalized, stakeholders review and approve designs before they go to print.",
        },
        {
          title: "Print Vendor Integration",
          description:
            "Connect to print vendors to automatically send approved standees for production, eliminating manual handoff delays.",
        },
        {
          title: "Performance Tracking",
          description:
            "Log every generated standee with timestamps, location data, and promotional focus, then analyze which designs drive the highest foot traffic or sales.",
        },
        {
          title: "Batch Generation & Scheduling",
          description:
            "Set recurring standee generation, monthly, quarterly, to automatically create refreshed designs with updated messaging without manual requests.",
        },
        {
          title: "International Expansion",
          description:
            "Adapt designs for different markets, auto-translate operational details, adjust photography for regional preferences, and maintain brand consistency across countries.",
        },
        {
          title: "Content Library Versioning",
          description:
            "Store all generated standees in a searchable archive with version history, enabling easy reference, reprinting, or rollback to previous designs.",
        },
        {
          title: "Dynamic Text Insertion",
          description:
            "Create standees with placeholder text that auto-populates from location data, the menu database, or seasonal campaigns, no separate file needed per location.",
        },
        {
          title: "Design Variations for A/B Testing",
          description:
            "Generate multiple layout or messaging variants and use foot-traffic or sales data to identify the highest-performing standee designs.",
        },
      ],
    },
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

    caseStudy: {
      category: "Graphic Design",
      techIcons: [
        { name: "Brand Templates", icon: LayoutGrid },
        { name: "Photography", icon: ImageIcon },
        { name: "Benefit Icons", icon: Sparkles },
        { name: "Print-Ready Output", icon: FileCheck },
      ],
      summary:
        "An automated design system built for wellness and supplement brands that generates premium product marketing flyers for every SKU. It combines product photography, primary and mini-benefit callouts, ingredient information, and brand aesthetics into elegant point-of-sale and digital marketing materials, keeping a premium wellness positioning with nature-inspired design and organized information hierarchy without a designer touching every file.",

      overview: {
        problem: [
          "Wellness and supplement brands struggle to create consistent product flyers across multiple SKUs and product lines",
          "Manual design work for each product launch or seasonal promotion is time-consuming and expensive",
          "Balancing product imagery, ingredient benefits, scientific credibility, and brand aesthetic is complex",
          "Flyers need to highlight multiple benefits, usage instructions, and mini-benefits simultaneously, difficult to compose manually",
          "Updating flyers with new testimonials, seasonal information, or product variants requires full redesigns",
        ],
        solution: [
          "Consistent brand identity, logo, color palette, typography, design language, applied automatically to every flyer",
          "High-quality product photography integrated seamlessly into every layout",
          "Structured benefit sections, main benefits and mini-benefit icons, organized automatically",
          "Professional ingredient and usage information layout on every flyer",
          "Multi-product support within a single, consistent design system",
          "Every flyer keeps a premium wellness positioning with elegant typography, nature-inspired aesthetics, and organized information hierarchy, no manual designer involvement needed for routine flyer creation",
        ],
      },

      gallery: [
        {
          src: wellnessFlyerThumb,
          alt: "Wellness product marketing flyer, full resolution",
          width: 3840,
          height: 2880,
        },
      ],

      designProcess: {
        input: [
          "Product name and brand identity",
          "High-resolution product photography (bottle, spray, capsule, etc.)",
          "Primary product benefits (2-3 key selling points)",
          "Mini-benefits (6-8 secondary benefits with icon representation)",
          "Ingredient highlights and certifications",
          "Usage instructions and dosage information",
          "Brand tagline and value proposition",
          "Color palette and design preferences",
        ],
        workflow: [
          { icon: Download, label: "Input" },
          { icon: LayoutGrid, label: "Template" },
          { icon: Paintbrush, label: "Brand" },
          { icon: Sparkles, label: "Benefits" },
          { icon: ImageIcon, label: "Imagery" },
          { icon: FileCheck, label: "Output" },
        ],
        engine:
          "The engine selects the right flyer template based on product category, use case, and brand positioning, then applies logo placement, color scheme, and typography hierarchy throughout. Product photography is strategically positioned as the visual focal point with lifestyle context when applicable, primary benefits get a clear headline and supporting copy, and mini-benefits render as a scannable icon grid. Ingredient and usage information is organized into How to Use, Ingredients, and Certifications sections, and a footer carries the brand story, purchase information, and regulatory fine print.",
        refinements:
          "Each flyer generates as a full-size, print-ready A4/Letter design alongside a digital version optimized for social media, email, and web, in vertical and horizontal layouts, with product-specific and seasonal or promotional variants, all maintaining professional quality and brand consistency.",
        qa: "Every final design is checked for brand guideline compliance, visual balance and information hierarchy, legibility from a distance, regulatory compliance, disclaimer presence, ingredient accuracy, and print readiness, resolution, color mode, bleed/safety margins. Any inconsistency triggers automatic refinement before delivery.",
      },

      keyFeatures: [
        {
          title: "Multi-product flyer templates",
          description:
            "The system automatically generates flyers for different products within the same brand, Sleep Support Spray and Hormone Harmony Capsules each get tailored layouts while maintaining consistent brand language.",
        },
        {
          title: "Dual-benefit presentation",
          description:
            "Flyers highlight both primary benefits, the main value proposition, and mini-benefits, the comprehensive feature set, giving consumers the full picture of product value.",
        },
        {
          title: "Icon-based benefit system",
          description:
            "Standardized icons communicate complex wellness benefits, improved sleep quality, hormone regulation, stress relief, in an instantly recognizable visual format.",
        },
        {
          title: "Integrated product photography",
          description:
            "High-quality product imagery is positioned as the visual anchor with lifestyle context, showing the product in natural, aspirational settings rather than generic backgrounds.",
        },
        {
          title: "Ingredient & certification display",
          description:
            "Professional presentation of ingredients, certifications, and usage instructions establishes clinical credibility while staying accessible to consumers.",
        },
        {
          title: "Information hierarchy optimization",
          description:
            "Complex ingredient and benefit information is organized into scannable sections so consumers quickly understand core value without information overload.",
        },
        {
          title: "Print & digital adaptability",
          description:
            "The system generates both print-ready flyers, with bleeds and safety margins, and digital versions optimized for screen viewing and social sharing.",
        },
        {
          title: "Wellness aesthetic consistency",
          description:
            "Every design element reinforces premium wellness positioning, typography, color palette, and nature-inspired graphics create one cohesive brand experience.",
        },
      ],

      useCases: [
        {
          title: "New Product Launch",
          description:
            "Generate marketing flyers for a new supplement or wellness product within 24 hours of product approval, communicating benefits to retailers and consumers simultaneously.",
        },
        {
          title: "Seasonal Promotions",
          description:
            "Create limited-time offer flyers, holiday promotions, seasonal wellness focus, that feel premium and on-brand rather than discount-focused or hasty.",
        },
        {
          title: "Retailer Point-of-Sale Materials",
          description:
            "Generate high-volume flyers for retail distribution, every retailer location receives consistent, professionally-designed product marketing materials.",
        },
        {
          title: "Influencer & Affiliate Marketing",
          description:
            "Create digital flyer variants optimized for social media sharing so influencers and affiliates promote products with branded, professional materials rather than generic product shots.",
        },
        {
          title: "Customer Education Campaigns",
          description:
            "Develop educational flyers explaining product benefits, ingredients, and usage, supporting customer purchase decisions with detailed, trustworthy information.",
        },
        {
          title: "Multi-SKU Product Line Launch",
          description:
            "Rolling out 5+ new products across multiple categories generates flyers for the entire line simultaneously, each product gets a tailored design while the brand aesthetic stays unified.",
        },
        {
          title: "Email Marketing Campaigns",
          description:
            "Create flyer designs optimized for email distribution, driving customer engagement with visually compelling, benefit-focused product content.",
        },
      ],

      scalability: [
        {
          title: "Product-Specific Templates",
          description:
            "Store distinct flyer layouts for different product categories, sleep support, hormone balance, energy, immunity, each gets an optimized design while sharing system infrastructure.",
        },
        {
          title: "Ingredient Library Management",
          description:
            "Maintain a searchable database of ingredients with benefit callouts and icons, automatically populating ingredient sections based on product formulation.",
        },
        {
          title: "Benefit Icon Customization",
          description:
            "Create branded icon sets for different benefit categories, sleep, hormones, digestion, energy, immunity, maintaining visual consistency across the entire product line.",
        },
        {
          title: "Variant Generation",
          description:
            "Automatically create multiple flyer versions highlighting different benefit angles for the same product, testing which messaging resonates with different customer segments.",
        },
        {
          title: "Certification & Badge Integration",
          description:
            "Automatically insert product certifications, organic, vegan, non-GMO, clinical-tested, based on product attributes, building consumer trust through visual credibility markers.",
        },
        {
          title: "Testimonial & Review Integration",
          description:
            "Include customer testimonials or review highlights on flyers, social proof increases consumer confidence without a redesign.",
        },
        {
          title: "Seasonal & Promotional Overlays",
          description:
            "Add limited-time offer banners, holiday messaging, or seasonal wellness themes while keeping core product information intact.",
        },
        {
          title: "Multi-Language Support",
          description:
            "Generate flyers in different languages for international markets, auto-translating benefit copy and instructions while maintaining design integrity.",
        },
        {
          title: "Retailer-Specific Customization",
          description:
            "Create retailer-branded flyers with a store logo or customized call-to-action, increasing retail partner buy-in through personalized materials.",
        },
        {
          title: "Batch Generation & Distribution",
          description:
            "Schedule recurring flyer generation aligned with the product launch calendar, automatically creating marketing materials without manual requests.",
        },
        {
          title: "Performance Tracking",
          description:
            "Log every generated flyer with timestamps, product SKU, and promotional focus, then analyze which designs drive the highest conversion or retail movement.",
        },
        {
          title: "Regulatory Compliance Versioning",
          description:
            "Store flyer versions with regulatory approval dates, ensuring compliance requirements are met as regulations evolve.",
        },
        {
          title: "QR Code & Dynamic Linking",
          description:
            "Embed QR codes linking to product pages, subscription signups, or customer reviews, driving digital engagement directly from print materials.",
        },
        {
          title: "Price & Promotion Dynamics",
          description:
            "Create flyer variants with different pricing or promotional messaging, A/B testing price positioning without a full redesign.",
        },
        {
          title: "Content Library Archive",
          description:
            "Maintain a searchable archive of all generated flyers with version history, making it easy to reference, reprint, or benchmark past promotional campaigns.",
        },
      ],
    },
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

    caseStudy: {
      category: "Graphic Design",
      techIcons: [
        { name: "Athlete Photography", icon: ImageIcon },
        { name: "Billboard Formats", icon: LayoutGrid },
        { name: "Brand Identity", icon: Paintbrush },
        { name: "Print-Ready Output", icon: FileCheck },
      ],
      summary:
        "An automated design system built for sports organizations that generates high-impact recruitment billboards and transit advertising for every campaign. It combines athlete photography, motivational messaging, and clear calls-to-action into dynamic outdoor marketing assets, keeping team branding and visual energy consistent across every location without a designer touching every file.",

      overview: {
        problem: [
          "Sports organizations need to attract talent and players to their teams but lack scalable marketing materials",
          "Creating compelling recruitment billboards requires multiple design iterations to balance athlete imagery, branding, and messaging",
          "Deploying recruitment campaigns across multiple cities and transit locations is logistically complex without centralized design systems",
          "Each campaign requires custom design work, new athletes, new messaging, new locations mean full redesigns",
          "Seasonal recruitment drives or new team formations demand rapid design turnarounds that overwhelm in-house design teams",
        ],
        solution: [
          "Dynamic athlete imagery integrated into dramatic backgrounds",
          "Bold, motivational messaging hierarchy, primary headline, subheadline, descriptive text",
          "High-visibility call-to-action elements, buttons, contact information",
          "Consistent sports branding, team colors, logo placement, visual identity",
          "Multiple format support, standard billboard, transit shelter, digital display",
          "Every billboard keeps dynamic energy and athlete-focused composition, eliminating manual design work for recruitment campaigns while keeping impact and engagement high",
        ],
      },

      gallery: [
        {
          src: sportsBillboardThumb,
          alt: "Sports recruitment billboard design, full resolution",
          width: 3840,
          height: 2560,
        },
      ],

      designProcess: {
        input: [
          "Athlete name and position information",
          "High-resolution athlete photography (professional headshot or action shot)",
          "Campaign messaging (primary headline, secondary messaging)",
          "Call-to-action text (Join Our Team, Apply Now, Contact Us)",
          "Contact information (website, email, phone number)",
          "Team branding elements (logo, team colors, tagline)",
          "Location specifications (billboard size, placement type)",
          "Campaign timeframe and promotional details",
        ],
        workflow: [
          { icon: Download, label: "Input" },
          { icon: LayoutGrid, label: "Format" },
          { icon: ImageIcon, label: "Athlete" },
          { icon: Zap, label: "Message" },
          { icon: Send, label: "CTA" },
          { icon: FileCheck, label: "Output" },
        ],
        engine:
          "The engine selects the right format based on deployment location, standard dimensions, and content density, then creates dynamic stadium or action-based backgrounds with lighting and color grading aligned to team branding. Athlete photography is retouched, composited realistically, and sized for maximum visual impact as the centerpiece, while a primary headline, secondary tagline, and supporting body text build a clear messaging hierarchy. A branded CTA button, contact information, and QR code complete the composition, with team logo, colors, and typography applied consistently throughout.",
        refinements:
          "The system generates high-resolution, print-ready billboard artwork at 300 DPI alongside multiple format variants, 14x48, 8x20, 16:9 digital ratios, digital display versions, and low-res proof versions for approval, all maintaining professional quality and advertising standards.",
        qa: "Every final design is checked for brand guideline compliance, visual impact and composition balance, text legibility from distance, and regulatory compliance, advertising standards, content accuracy. Any inconsistency triggers automatic refinement before deployment.",
      },

      keyFeatures: [
        {
          title: "Dynamic athlete integration",
          description:
            "The system seamlessly composites high-quality athlete photography with stadium backgrounds, creating a compelling visual focal point that immediately communicates recruitment purpose.",
        },
        {
          title: "Motivational messaging hierarchy",
          description:
            "Billboards balance bold primary headlines (\"METRO EXPRESS 70N7\") with secondary messaging and supporting information, maximizing impact for passing viewers with limited attention span.",
        },
        {
          title: "High-visibility call-to-action",
          description:
            "Bright, branded CTA buttons and contact information are prominently featured, making the recruitment pathway clear and driving specific action from interested candidates.",
        },
        {
          title: "Multi-format deployment",
          description:
            "A single design system generates billboards for transit shelters, roadside billboards, and digital displays, enabling coordinated recruitment campaigns across multiple advertising channels.",
        },
        {
          title: "Team branding consistency",
          description:
            "Every billboard reinforces team identity through color palette, typography, logos, and visual elements, building a cohesive brand presence across all recruitment materials.",
        },
        {
          title: "Rapid campaign turnaround",
          description:
            "Generate recruitment billboards in hours instead of weeks, enabling quick response to recruitment opportunities, player transfers, or seasonal recruitment drives.",
        },
        {
          title: "Location & candidate-specific variations",
          description:
            "Create customized billboards highlighting different athletes or positioning for different regional markets, maximizing relevance for targeted recruitment demographics.",
        },
        {
          title: "Digital & print adaptability",
          description:
            "The system generates both print-ready billboard specifications and digital display formats, enabling deployment across traditional and digital advertising networks.",
        },
      ],

      useCases: [
        {
          title: "Player Recruitment Campaign",
          description:
            "Generate recruitment billboards featuring star athletes and the positions needed, then deploy across the transit network to attract top talent for the upcoming season.",
        },
        {
          title: "Talent Scouting & Academy Promotion",
          description:
            "Create billboards promoting a youth academy or development program, positioned alongside school areas and youth recreation facilities to attract young players.",
        },
        {
          title: "Seasonal Recruitment Drives",
          description:
            "Launch recruitment campaigns timed to the offseason or pre-season, generating multiple athlete-focused billboards for a coordinated campaign rollout.",
        },
        {
          title: "Multi-City Expansion",
          description:
            "Expanding to new cities generates location-specific recruitment billboards featuring athletes and local contact information, establishing team presence in new markets.",
        },
        {
          title: "Coaching & Staff Recruitment",
          description:
            "Generate billboards promoting coaching positions or management roles, targeting active sports professionals considering career opportunities with the organization.",
        },
        {
          title: "Corporate Partnership & Sponsorship",
          description:
            "Create billboards promoting team membership, fan engagement, or corporate partnerships, expanding beyond player recruitment into audience development.",
        },
        {
          title: "League-Wide Campaigns",
          description:
            "Coordinate multi-team recruitment initiatives or league promotion campaigns, generating billboards across different markets and teams simultaneously.",
        },
      ],

      scalability: [
        {
          title: "Athlete Spotlight Variations",
          description:
            "Create multiple billboards featuring different team athletes, each highlights a different position or player profile while keeping team branding consistent.",
        },
        {
          title: "Position-Specific Messaging",
          description:
            "Generate recruitment billboards tailored to specific positions, quarterbacks, defensive ends, midfielders, customizing messaging to appeal to target player profiles.",
        },
        {
          title: "Seasonal Campaign Themes",
          description:
            "Create seasonal variations highlighting off-season recruitment, pre-season camps, or championship pushes, updating messaging and visuals without a full redesign.",
        },
        {
          title: "Location-Specific Customization",
          description:
            "Automatically insert local recruiting office addresses, regional QR codes, or location-specific contact information to personalize campaigns for different markets.",
        },
        {
          title: "Achievement & Performance Highlighting",
          description:
            "Feature team statistics, championship records, or player achievements on billboards, building credibility and competitive advantage in recruitment messaging.",
        },
        {
          title: "Demographic Targeting",
          description:
            "Create variations targeting different athlete demographics, youth academy, transfer market, international recruitment, customizing messaging for specific recruitment audiences.",
        },
        {
          title: "Multi-Athlete Compositions",
          description:
            "Generate billboards featuring multiple athletes or team group photography to showcase roster depth and team culture.",
        },
        {
          title: "Digital Screen Animation Support",
          description:
            "Create motion variants for digital billboards, adding athlete movement, text animation, or dynamic background effects for increased engagement.",
        },
        {
          title: "Sponsor & Partner Integration",
          description:
            "Include sponsor logos or partner branding on recruitment billboards, generating co-branded marketing assets that benefit recruitment and sponsorship objectives.",
        },
        {
          title: "Historical Archive & Legacy Marketing",
          description:
            "Feature legendary athletes or championship history on billboards, building organizational prestige and attracting talent seeking winning programs.",
        },
        {
          title: "QR Code & Mobile Integration",
          description:
            "Embed dynamic QR codes linking to recruitment portals, athlete profiles, or application forms, driving immediate digital engagement from billboard viewers.",
        },
        {
          title: "Real-Time Social Media Integration",
          description:
            "Automatically pull social media posts or trending athlete highlights into billboard designs, keeping recruitment messaging fresh and contemporary.",
        },
        {
          title: "Multilingual Support",
          description:
            "Generate billboards in different languages for international markets, expanding recruitment reach to non-English speaking talent pools.",
        },
        {
          title: "A/B Testing Variations",
          description:
            "Create multiple messaging or visual variants for the same athlete to test different recruitment angles and optimize conversion and engagement.",
        },
        {
          title: "Performance Analytics & Tracking",
          description:
            "Log all deployed billboards with location, timeframe, and recruitment results, analyzing which billboard designs and messaging drive the highest application rates or player conversions.",
        },
      ],
    },
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

    caseStudy: {
      category: "Graphic Design",
      techIcons: [
        { name: "Character Design", icon: Shapes },
        { name: "Color Palettes", icon: Paintbrush },
        { name: "Packaging Mockups", icon: Boxes },
        { name: "Print-Ready Output", icon: FileCheck },
      ],
      summary:
        "An automated packaging design system built for novelty candy and confectionery brands that generates shelf-stopping product packaging for every flavor. It combines flavor-specific color palettes, playful character mascots, ingredient callouts, and regulatory information into bold retail-ready packaging, keeping brand personality consistent across an entire product line without a designer touching every file.",

      overview: {
        problem: [
          "Novelty candy brands need distinctive packaging that stands out on crowded retail shelves",
          "Creating cohesive product lines with multiple flavors requires consistent character design, color systems, and branding language",
          "Each new flavor launch requires custom packaging design work, different colors, different characters, different messaging",
          "Balancing playful aesthetic with regulatory compliance, ingredient lists, warnings, certifications, is challenging",
          "Scaling to 10+ flavors across multiple product lines while maintaining visual consistency is overwhelming for manual design processes",
        ],
        solution: [
          "Vibrant, flavor-specific color palettes, greens for watermelon, blues for blueberry",
          "Playful character mascots aligned with flavor profiles",
          "Bold, energetic typography that appeals to youth audiences",
          "Prominent ingredient callouts and flavor benefits",
          "Structured regulatory information, warnings, certifications",
          "Consistent brand language across the entire product range",
          "Every package keeps a fun, youthful energy while ensuring regulatory compliance and ingredient transparency, eliminating manual design work for multi-flavor product launches",
        ],
      },

      gallery: [
        {
          src: candyPackagingThumb,
          alt: "Novelty candy product packaging design, full resolution",
          width: 3840,
          height: 3072,
        },
      ],

      designProcess: {
        input: [
          "Product name and brand identity (Ziggity)",
          "Flavor name and taste profile (Watermelon Warhead, Blueberry Lemonade)",
          "Primary flavor characteristics (taste, sensation, heat level)",
          "Ingredient list and certifications",
          "Product benefits and key features (Real Z-Terps, Real Pressure, Real Loud)",
          "Target demographic (youth, novelty seekers, flavor enthusiasts)",
          "Package size and format specifications",
          "Regulatory information and warnings",
        ],
        workflow: [
          { icon: Download, label: "Input" },
          { icon: Paintbrush, label: "Palette" },
          { icon: Shapes, label: "Character" },
          { icon: Type, label: "Type" },
          { icon: ShieldCheck, label: "Compliance" },
          { icon: FileCheck, label: "Output" },
        ],
        engine:
          "The engine generates a flavor-specific color scheme, greens for watermelon/citrus, blues for berry/lemonade, then creates or selects a matching character mascot with a consistent art style and flavor-specific personality. A bold, energetic headline and flavor name are set alongside ingredient callouts with checkmarks, and warning labels, certifications, and allergen information are integrated without compromising visual appeal. Front and back panels get a 3D perspective mockup with gloss effects, and every flavor variant stays aligned to the same logo placement, character family style, and typography hierarchy for one cohesive product line.",
        refinements:
          "The system generates print-ready, production-ready individual package artwork, stacked and shelf display mockups, digital mockups for e-commerce, and 3D rotatable 360-degree visualizations, alongside high-resolution CMYK artwork with bleed, trim, and cutline specifications, all production-ready for flawless retail presence.",
        qa: "Final designs are checked for brand guideline compliance, colors, typography, logo treatment, ingredient list accuracy, allergen and warning label placement, and print readiness, resolution, color mode, bleed safety. Any inconsistency triggers automatic refinement before delivery.",
      },

      keyFeatures: [
        {
          title: "Vibrant flavor-specific color palettes",
          description:
            "Each flavor gets a distinct color treatment that immediately communicates taste profile, greens signal watermelon/citrus intensity while blues evoke refreshing lemonade quality.",
        },
        {
          title: "Playful character mascots",
          description:
            "Memorable character designs serve as flavor identifiers and brand ambassadors, consumers recognize flavors at a glance and connect emotionally with the brand personality.",
        },
        {
          title: "Bold youth-targeted typography",
          description:
            "Energetic headline typography and playful text styling appeal to the core demographic, vibrant colors and dynamic composition capture attention on crowded retail shelves.",
        },
        {
          title: "Ingredient transparency & benefit callouts",
          description:
            "Prominent ingredient and benefit display communicates product authenticity and unique sensory experience, building consumer trust while driving purchase decisions.",
        },
        {
          title: "Multi-flavor brand consistency",
          description:
            "The entire product line maintains a cohesive brand identity despite flavor-specific design variations, creating product family recognition and supporting line expansion.",
        },
        {
          title: "Regulatory compliance integration",
          description:
            "Warnings, certifications, and ingredient information are seamlessly integrated into the design, meeting legal requirements without compromising visual appeal.",
        },
        {
          title: "360-degree brand presence",
          description:
            "Front, back, and side panels maintain consistent branding and messaging, ensuring brand communication regardless of shelf positioning or viewing angle.",
        },
        {
          title: "Shelf-stopping visual impact",
          description:
            "The combination of vibrant colors, bold typography, and playful characters creates high shelf presence and consumer attention capture, driving impulse purchases and brand discovery.",
        },
      ],

      useCases: [
        {
          title: "New Flavor Launch",
          description:
            "Generate packaging for a new flavor variant, Sour Apple, Spicy Mango, Cool Mint, in days, maintaining brand consistency while creating flavor-specific visual differentiation.",
        },
        {
          title: "Multi-SKU Product Line Expansion",
          description:
            "Launching 5+ new flavors simultaneously generates coordinated packaging for the entire lineup, each flavor gets a unique identity while the product family stays cohesive.",
        },
        {
          title: "Seasonal or Limited-Edition Releases",
          description:
            "Create packaging for seasonal flavors or limited-time offers, vibrant designs and exclusive characters drive scarcity and collector appeal.",
        },
        {
          title: "Retail Chain Customization",
          description:
            "Generate retailer-specific packaging or promotional variants, adding retail chain branding or location-specific messaging while keeping the core product identity intact.",
        },
        {
          title: "Digital & E-Commerce Optimization",
          description:
            "Create digital mockups and product photography optimized for online retail, ensuring appealing presentation across e-commerce platforms and social media.",
        },
        {
          title: "International Market Adaptation",
          description:
            "Expand to international markets with language-specific packaging, keeping visual identity intact while adapting ingredient lists and compliance information for regional regulations.",
        },
        {
          title: "Promotional & Gift Set Packaging",
          description:
            "Create special packaging for gift sets or multi-pack arrangements, keeping individual product identity while coordinating the larger packaging presentation.",
        },
      ],

      scalability: [
        {
          title: "Unlimited Flavor Variants",
          description:
            "The system supports unlimited flavor expansion, each new flavor automatically gets a unique color palette, character, and positioning while the brand family stays cohesive.",
        },
        {
          title: "Character Design Library",
          description:
            "Maintain a library of character styles and expressions, mix and match character elements across flavors or create entirely new character personalities.",
        },
        {
          title: "Color Palette Templates",
          description:
            "Create color templates for different flavor categories, citrus/zesty, berry/sweet, cooling, automatically generating harmonious palettes for new flavors.",
        },
        {
          title: "Ingredient Library Management",
          description:
            "A centralized ingredient database automatically populates ingredient lists and callouts, ensuring accuracy and compliance consistency across every product.",
        },
        {
          title: "Regulatory Compliance Versioning",
          description:
            "Store packaging versions with regional regulatory compliance dates, ensuring adherence as regulations evolve across different markets.",
        },
        {
          title: "Seasonal & Promotional Overlays",
          description:
            "Add seasonal themes, limited-edition callouts, or promotional messaging without redesigning core packaging, keeping freshness without full redesign cycles.",
        },
        {
          title: "Multi-Language Support",
          description:
            "Generate packaging in multiple languages for international distribution, automatically adapting text while maintaining design integrity.",
        },
        {
          title: "Product Photography Integration",
          description:
            "Include product lifestyle photography or flavor imagery within the packaging design for an aspirational and authentic product presentation.",
        },
        {
          title: "Size Variant Scaling",
          description:
            "Generate packaging designs for different product sizes, small singles, family packs, bulk formats, maintaining visual consistency across the size spectrum.",
        },
        {
          title: "Retailer-Specific Customization",
          description:
            "Add retailer logos, exclusive flavors, or location-specific promotions to create personalized packaging for retail partners or exclusive deals.",
        },
        {
          title: "Brand Ambassador Rotation",
          description:
            "Feature different characters or celebrity endorsements on packaging variants to create collectible limited editions and drive repeat purchases.",
        },
        {
          title: "QR Code & Gamification Integration",
          description:
            "Embed QR codes linking to flavor games, flavor challenges, or social media content, driving digital engagement and brand community building.",
        },
        {
          title: "Sustainability & Eco-Packaging Adaptation",
          description:
            "Design for sustainable packaging materials, recyclable, compostable, communicating environmental credentials through packaging messaging.",
        },
        {
          title: "Performance Tracking & Sales Analytics",
          description:
            "Log packaging designs with flavor, market, timeframe, and sales data, analyzing which flavor designs, colors, or characters drive the highest sales performance.",
        },
        {
          title: "Social Media & Influencer Customization",
          description:
            "Create packaging variants designed specifically for social media virality or influencer collaboration, building shareable, collectible packaging.",
        },
        {
          title: "Augmented Reality Integration",
          description:
            "Design packaging compatible with AR scanning experiences, unlocking digital content, games, or immersive brand experiences through phone cameras.",
        },
      ],
    },
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

    caseStudy: {
      category: "Graphic Design",
      techIcons: [
        { name: "Logo Design", icon: Wand2 },
        { name: "Color System", icon: Paintbrush },
        { name: "Typography", icon: Type },
        { name: "Brand Guidelines", icon: Layers },
      ],
      summary:
        "An intelligent design system built for coffee shop and cafe brands that generates a complete brand identity, from custom logo design through cup, signage, and digital collateral. It combines logo concept development, color palette and typography systems, and branded templates into one cohesive visual identity, keeping every customer touchpoint consistent without a designer touching every file.",

      overview: {
        problem: [
          "Coffee shop owners struggle to develop cohesive brand identities that reflect their cafe concept",
          "Creating consistent logo applications across multiple materials (cups, signage, menus, digital) requires specialized design skills",
          "Small cafes lack resources for professional brand identity work, resulting in inconsistent or amateurish visual presentation",
          "Logo design that works across different scales, colors, and applications is complex",
          "Applying brand identity to operational materials (cups, packaging, signage) requires multiple custom design files and iterations",
        ],
        solution: [
          "Custom logo design reflecting cafe concept, coffee elements, natural themes, local inspiration",
          "Versatile color palettes that work across light and dark applications",
          "Professional typography system, headline and body type selections",
          "Logo application guidelines and technical specifications",
          "Branded collateral templates, cups, menus, signage, digital assets",
          "Multi-color logo variations, monochrome, full-color, inverted",
          "Every brand keeps a professional, approachable aesthetic aligned with specialty coffee culture, eliminating fragmented design work while ensuring visual consistency across every customer touchpoint",
        ],
      },

      gallery: [
        {
          src: coffeeBrandThumb,
          alt: "Coffee shop brand identity and logo application, full resolution",
          width: 3840,
          height: 2560,
        },
      ],

      designProcess: {
        input: [
          "Cafe name and concept (Brew & Bloom)",
          "Brand story and positioning (specialty coffee, sustainable, community-focused)",
          "Target audience and cafe atmosphere",
          "Aesthetic preferences (modern, rustic, minimalist, eclectic)",
          "Competitive landscape and differentiation points",
          "Geographic location and local inspiration elements",
          "Core values (quality, sustainability, community, craftsmanship)",
        ],
        workflow: [
          { icon: Download, label: "Input" },
          { icon: Wand2, label: "Logo" },
          { icon: Paintbrush, label: "Color" },
          { icon: Type, label: "Type" },
          { icon: Boxes, label: "Collateral" },
          { icon: Layers, label: "Guidelines" },
        ],
        engine:
          "The engine develops a custom logo concept aligned with brand positioning, coffee beans, leaves, growth, nature, refined and simplified for scalability from business cards to storefront signage. A professional color system, typography pairing, and full logo delivery, full-color, monochrome, inverted, horizontal and vertical lockups, generate together, then extend into cup and collateral branding, signage and environmental design, and digital and marketing asset templates, so every touchpoint carries the same identity.",
        refinements:
          "Merchandise and loyalty program designs, t-shirts, tumblers, loyalty cards, gift cards, generate alongside a comprehensive brand guidelines document covering logo usage, color specifications, typography, and do's and don'ts, so the identity stays consistent as new collateral gets added.",
        qa: "Every deliverable is checked for logo scalability and clear-space compliance, color accuracy across RGB, CMYK, and HEX, typography legibility at small sizes, and consistency across every application before the brand kit ships.",
      },

      keyFeatures: [
        {
          title: "Custom logo design",
          description:
            "A unique symbol-based logo reflecting the cafe concept combines coffee bean and leaf elements into a distinctive visual identity instantly recognizable to customers.",
        },
        {
          title: "Versatile logo variations",
          description:
            "Multiple logo formats, full-color, monochrome, inverted, work seamlessly across print cups, digital displays, embroidered merchandise, and small-scale applications.",
        },
        {
          title: "Cohesive color system",
          description:
            "A professional palette balances warm coffee tones with fresh natural greens, working across light and dark backgrounds to keep visibility and brand recognition.",
        },
        {
          title: "Complete collateral system",
          description:
            "Pre-designed templates for cups, signage, menus, and digital assets eliminate fragmented design work and keep every touchpoint visually consistent.",
        },
        {
          title: "Application flexibility",
          description:
            "The logo works effectively at storefront scale and business card scale, maintaining clarity and recognition regardless of size or medium.",
        },
        {
          title: "Professional typography",
          description:
            "A carefully selected typeface pairing balances personality with legibility, working across printed menus, signage, and digital platforms.",
        },
        {
          title: "Brand guidelines documentation",
          description:
            "A comprehensive guide keeps brand application consistent by staff, vendors, and partners, protecting brand integrity as the cafe grows.",
        },
        {
          title: "Multi-location support",
          description:
            "The flexible system supports expansion to additional locations with consistent branding while allowing local customization for regional relevance.",
        },
      ],

      useCases: [
        {
          title: "Cafe Launch & Grand Opening",
          description:
            "Generate a complete brand identity and collateral system for a new cafe opening, establishing a professional presence from day one across cups, signage, and digital platforms.",
        },
        {
          title: "Brand Refresh & Evolution",
          description:
            "An existing cafe modernizing its visual identity can refresh logo, color palette, and collateral while maintaining brand equity and customer recognition.",
        },
        {
          title: "Multi-Location Expansion",
          description:
            "Opening a second or third cafe location extends the brand identity with a consistent visual language while allowing location-specific customization, addresses, hours, local imagery.",
        },
        {
          title: "Merchandise & Retail Expansion",
          description:
            "Generate branded merchandise designs, tumblers, apparel, accessories, that extend the coffee shop brand into a retail product line.",
        },
        {
          title: "Franchise or Licensing",
          description:
            "Developing a franchise model creates a comprehensive brand system and guidelines that enable consistent operations across multiple franchise locations.",
        },
        {
          title: "Seasonal Campaign Variations",
          description:
            "Generate seasonal branding variations, holiday cups, summer menus, that maintain the core brand identity while celebrating seasonal themes.",
        },
        {
          title: "Corporate Catering & B2B Expansion",
          description:
            "Create branded catering packaging and corporate gift designs that extend the cafe brand into business-to-business revenue streams.",
        },
      ],

      scalability: [
        {
          title: "Multi-Location Branding",
          description:
            "Extend the brand system to multiple cafe locations with a consistent identity while allowing location-specific customization, address, local imagery, hours.",
        },
        {
          title: "Logo Variation Library",
          description:
            "Create multiple logo style variations, monochrome, outline, solid fill, gradient, for different applications and mediums.",
        },
        {
          title: "Seasonal Design Variations",
          description:
            "Generate seasonal cup designs, menu headers, and promotional graphics that keep the core brand while celebrating seasonal themes.",
        },
        {
          title: "Merchandise Design Templates",
          description:
            "Extend branding to coffee mugs, t-shirts, tote bags, and apparel, creating revenue opportunities through branded merchandise.",
        },
        {
          title: "Packaging Design System",
          description:
            "Create branded designs for take-out boxes, packaging labels, stickers, and branded bags, enhancing the unboxing experience for retail or catering.",
        },
        {
          title: "Digital Ecosystem Design",
          description:
            "Extend the identity across a website, app interface, social media templates, and digital menu boards for a consistent brand presence on every digital touchpoint.",
        },
        {
          title: "Photography Style Guide",
          description:
            "Develop brand-aligned photography guidelines for social media and marketing, creating visual cohesion across user-generated and professional content.",
        },
        {
          title: "Signage Templates",
          description:
            "Pre-designed outdoor signage, menu boards, wayfinding, and interior wall graphics accelerate physical environment branding.",
        },
        {
          title: "Loyalty Program Design",
          description:
            "Branded loyalty card, digital app interface, reward graphics, and promotional materials reinforce the brand while building customer retention.",
        },
        {
          title: "Corporate Partnership Materials",
          description:
            "Co-branded materials for supplier partnerships, sponsorships, or collaborations extend brand reach through strategic partnerships.",
        },
        {
          title: "International Expansion Adaptation",
          description:
            "Modify branding for international markets, language, cultural symbols, local imagery, while keeping the core identity intact.",
        },
        {
          title: "Social Media Content Templates",
          description:
            "Instagram stories, feed post templates, Reels thumbnails, and TikTok graphics enable a consistent social presence without custom design for every post.",
        },
        {
          title: "Email Marketing Templates",
          description:
            "Newsletter designs, promotional email templates, and customer communication graphics keep brand consistency in digital communications.",
        },
        {
          title: "Employee Training Materials",
          description:
            "Brand guidelines documentation, training videos, and point-of-sale materials ensure staff understand and represent the brand consistently.",
        },
        {
          title: "Competitor Differentiation System",
          description:
            "Continuously evolve the brand while maintaining its core identity, adapting to market changes and emerging cafe trends.",
        },
        {
          title: "Community & Local Adaptation",
          description:
            "Feature local artists, suppliers, or neighborhood imagery in branding to build community connection and local relevance.",
        },
        {
          title: "Sustainability & Eco-Branding",
          description:
            "Emphasize sustainable practices through eco-friendly package design and materials messaging, aligning visual branding with environmental values.",
        },
        {
          title: "Augmented Reality Integration",
          description:
            "Design cups and packaging compatible with AR scanning experiences, unlocking digital content, loyalty rewards, or interactive brand experiences.",
        },
      ],
    },
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

    caseStudy: {
      category: "Graphic Design",
      techIcons: [
        { name: "Data Visualization", icon: BarChart3 },
        { name: "Typography", icon: Type },
        { name: "Iconography", icon: Shapes },
        { name: "Print-Ready Output", icon: FileCheck },
      ],
      summary:
        "An intelligent design system built for grassroots and social justice organizations that generates high-impact activism posters at campaign scale. It combines bold messaging, data visualization, iconography, and professional typography into shareable, print-ready visual campaigns, keeping messaging cohesive and persuasive across dozens of poster variations without a designer touching every file.",

      overview: {
        problem: [
          "Social justice organizations lack resources for professional graphic design supporting campaigns and messaging",
          "Creating visually compelling activism content requires design expertise that many grassroots organizations cannot afford",
          "Individual poster designs don't scale to multi-message campaigns without significant time and resource investment",
          "Activism messaging needs to be both intellectually rigorous and emotionally compelling, balancing data, narrative, and visual impact",
          "Campaigns requiring dozens of poster variations for different issues, messages, and audiences demand rapid design iteration",
        ],
        solution: [
          "Bold messaging hierarchy capturing attention and communicating the core argument",
          "Data visualization translating complex economic or social statistics into visual impact",
          "Consistent visual language building a recognizable campaign identity",
          "Iconic imagery and illustration supporting messaging themes",
          "Professional typography balancing readability and emotional resonance",
          "Multiple message variations supporting diverse campaign angles",
          "Every poster keeps visual cohesion and intellectual rigor, supporting grassroots organizing while ensuring messaging reaches and persuades its intended audience",
        ],
      },

      gallery: [
        {
          src: activismPosterThumb,
          alt: "Social activism poster design, full resolution",
          width: 1111,
          height: 868,
        },
      ],

      designProcess: {
        input: [
          "Core campaign message and objectives (wealth inequality, workers' rights, systemic theft)",
          "Target audience and intended impact (awakening, organizing, action)",
          "Key data points and statistics to communicate",
          "Campaign tone (provocative, educational, emotional, urgent)",
          "Visual metaphors and thematic elements",
          "Call-to-action messaging",
          "Supporting evidence and narrative behind the main claim",
          "Related issues and interconnected messaging",
        ],
        workflow: [
          { icon: Download, label: "Input" },
          { icon: FileText, label: "Message" },
          { icon: BarChart3, label: "Data" },
          { icon: Shapes, label: "Icons" },
          { icon: LayoutGrid, label: "Layout" },
          { icon: FileCheck, label: "Output" },
        ],
        engine:
          "The engine organizes messaging into a bold primary headline, secondary tagline, supporting evidence, and a call-to-action, then applies a dark-background color system, cream typography, and an accent color that emphasizes key points and data. Complex statistics transform into pie charts, bar graphs, and proportional icon systems, custom iconography and illustration reinforce the message, and a composition with a clear focal point, information hierarchy, and generous white space keeps every poster accessible and visually impactful. Multiple angles, statistics-driven, narrative, call-to-action, question-based, generate from the same core messaging framework.",
        refinements:
          "The system generates high-resolution, 300+ DPI print artwork for large-scale printing, digital-optimized versions for social media and web, multiple size variations, A1 poster, flyer, social square, story format, and color-separated files for silk-screen printing, alongside a messaging guide, printing specifications, and social captions for grassroots distribution.",
        qa: "Every poster is checked for messaging clarity and argument rigor, color contrast and legibility from a distance, data accuracy and labeling transparency, and print readiness across every output format before deployment.",
      },

      keyFeatures: [
        {
          title: "Bold messaging impact",
          description:
            "Posters communicate complex ideas through clear, emotionally resonant headlines, making abstract concepts concrete and persuasive.",
        },
        {
          title: "Data-driven visualization",
          description:
            "Complex statistics are transformed into visually compelling graphics that make inequality and injustice tangible and undeniable.",
        },
        {
          title: "Consistent campaign identity",
          description:
            "Multiple posters maintain a cohesive visual language and color system, building a recognizable campaign presence across diverse messaging.",
        },
        {
          title: "Rapid deployment capability",
          description:
            "Generate dozens of poster variations in days, enabling responsive activism to urgent social issues without bureaucratic delays.",
        },
        {
          title: "Professional visual quality",
          description:
            "The design system ensures grassroots messaging achieves visual quality matching institutional campaigns, elevating credibility and persuasiveness.",
        },
        {
          title: "Accessibility & inclusion",
          description:
            "Multiple message angles, language versions, and graphic styles ensure messaging reaches diverse audiences with different needs and preferences.",
        },
        {
          title: "Print & digital optimization",
          description:
            "Posters work across large-scale printing, social media sharing, email distribution, and web display, maximizing reach through every channel.",
        },
        {
          title: "Shareable & community-driven",
          description:
            "The design system enables grassroots distribution through social media, community groups, and organic sharing, amplifying message reach beyond institutional control.",
        },
      ],

      useCases: [
        {
          title: "Wealth Inequality Campaign",
          description:
            "Generate multiple posters communicating wealth distribution statistics, workers' rights issues, and systemic inequality, creating a coordinated campaign across different messaging angles.",
        },
        {
          title: "Workers' Rights Organizing",
          description:
            "Develop a poster series supporting labor organizing campaigns, communicating worker value, rights claims, and calls-to-action for union building or workplace demands.",
        },
        {
          title: "Systemic Justice Messaging",
          description:
            "Create posters addressing systemic issues, criminal justice, housing, education, using data and narrative to build public understanding and demand policy change.",
        },
        {
          title: "Climate Justice Campaign",
          description:
            "Generate environmental justice posters connecting climate issues to inequality and systemic impact, reaching audiences with different entry points to climate action.",
        },
        {
          title: "Immigrant Rights Organizing",
          description:
            "Develop a poster series supporting immigrant communities and rights, communicating statistics, human stories, and political demands in multiple languages.",
        },
        {
          title: "Election & Political Campaigns",
          description:
            "Create political campaign posters supporting candidates or ballot initiatives, communicating policy positions and mobilizing voters around economic and social justice issues.",
        },
        {
          title: "Coalition & Solidarity Campaigns",
          description:
            "Coordinate multi-organizational campaigns requiring a consistent visual identity across diverse groups, enabling coordination while respecting organizational autonomy.",
        },
      ],

      scalability: [
        {
          title: "Unlimited Message Angles",
          description:
            "Generate infinite poster variations from the core messaging framework, adapting the message to different audiences, issues, or campaign moments.",
        },
        {
          title: "Statistical Database Integration",
          description:
            "Connect to data sources, census, economic reports, labor statistics, to automatically populate current data, ensuring posters reflect real-time information.",
        },
        {
          title: "Multilingual Support",
          description:
            "Generate posters in multiple languages for international or multilingual communities while maintaining design consistency across language variations.",
        },
        {
          title: "Regional Customization",
          description:
            "Adapt posters to regional contexts, state-specific laws, local political figures, geographic issues, increasing relevance for local organizing.",
        },
        {
          title: "Accessibility Variations",
          description:
            "Create plain-language versions, large-print editions, and accessible color schemes to ensure posters reach people with different access needs.",
        },
        {
          title: "Interactive & Digital Versions",
          description:
            "Convert static poster designs into interactive web experiences, enabling digital organizing and data exploration beyond print.",
        },
        {
          title: "Animation & Video Versions",
          description:
            "Adapt poster designs into animated social media content, maximizing reach through TikTok, Instagram Reels, and video platforms.",
        },
        {
          title: "Coalition Branding Integration",
          description:
            "Add organizational logos or coalition branding while keeping the core poster visual identity intact, supporting multi-organization campaigns and fund development.",
        },
        {
          title: "Merchandise Adaptation",
          description:
            "Extend poster designs to t-shirts, stickers, buttons, and other merchandise, monetizing the campaign while spreading the message through wearable activism.",
        },
        {
          title: "Historical Archive & Legacy",
          description:
            "Document every campaign poster with metadata, messaging impact, and distribution reach, building a historical record of activism and design effectiveness.",
        },
        {
          title: "Participatory Design Versions",
          description:
            "Create blank poster templates that let community members add personal stories or local data, democratizing poster creation within campaigns.",
        },
        {
          title: "Offline & Online Integration",
          description:
            "Design posters with QR codes, hashtags, and URLs linking to digital campaigns, connecting physical activism to digital organizing.",
        },
        {
          title: "Seasonal & Recurring Campaigns",
          description:
            "Develop template systems for annual campaigns, May Day, climate strikes, labor days, enabling rapid deployment of recurring activism.",
        },
        {
          title: "Impact Measurement",
          description:
            "Track social media shares, engagement, print runs, and physical display locations to measure campaign reach and effectiveness.",
        },
        {
          title: "Funding & Donation Integration",
          description:
            "Design posters that drive donations to supporting organizations, connecting messaging to resource mobilization.",
        },
        {
          title: "Coalition & Network Sharing",
          description:
            "Enable organizations to share and adapt poster designs within activist networks, accelerating movement-wide campaign coordination.",
        },
      ],
    },
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

    caseStudy: {
      category: "Graphic Design",
      techIcons: [
        { name: "Editorial Photography", icon: ImageIcon },
        { name: "Luxury Typography", icon: Type },
        { name: "Ornamental Design", icon: Sparkles },
        { name: "Print-Ready Output", icon: FileCheck },
      ],
      summary:
        "A sophisticated design automation system built for high-end fashion brands that generates gallery-quality retail standees for every collection and campaign. It combines editorial model photography, refined typography, ornamental design elements, and promotional messaging into premium advertising assets, keeping brand prestige consistent across every retail location without a designer touching every file.",

      overview: {
        problem: [
          "Luxury fashion brands need sophisticated standees that reflect premium positioning and craftsmanship",
          "Creating standees that balance aspirational imagery with commercial messaging requires high-level design expertise",
          "Each seasonal collection or campaign requires custom standee design matching brand aesthetic and collection theme",
          "Multiple retail locations and boutiques need coordinated standees maintaining luxury brand consistency",
          "Promotional elements, prizes, QR codes, exclusive offers, must integrate seamlessly without compromising premium aesthetic",
        ],
        solution: [
          "Editorial-quality model photography with dramatic lighting and composition",
          "Refined typography system reflecting luxury brand aesthetic",
          "Ornamental design elements, flourishes, borders, embellishments, reinforcing premium positioning",
          "Balanced composition integrating promotional messaging without compromising elegance",
          "Consistent brand language across every retail touchpoint",
          "Multi-campaign variations supporting seasonal collections and promotional initiatives",
          "Every standee keeps a gallery-quality presentation and aspirational brand positioning, eliminating manual design friction while ensuring every retail location reflects brand prestige",
        ],
      },

      gallery: [
        {
          src: luxuryFashionStandeeThumb,
          alt: "Luxury fashion standee design, full resolution",
          width: 1177,
          height: 918,
        },
      ],

      designProcess: {
        input: [
          "Brand name and luxury positioning (Ralph Vandale, haute couture designer)",
          "Collection name, theme, and creative direction",
          "Designer vision and aesthetic philosophy",
          "Target customer demographic and aspirations",
          "Seasonal or campaign-specific messaging",
          "Collaboration or partnership details (Chanel gift promotion)",
          "Brand color palette and visual identity",
          "Retail location and placement context",
        ],
        workflow: [
          { icon: Download, label: "Input" },
          { icon: ImageIcon, label: "Photography" },
          { icon: Type, label: "Typography" },
          { icon: Sparkles, label: "Ornament" },
          { icon: LayoutGrid, label: "Compose" },
          { icon: FileCheck, label: "Output" },
        ],
        engine:
          "The engine selects editorial-quality model photography with dramatic lighting matching the collection aesthetic, then applies a refined serif/sans-serif typography pairing and subtle ornamental flourishes, borders, and embellishments that reinforce craftsmanship without excess. Composition gives photography 60-70% of the visual space, with brand name and collection messaging above and promotional or retail information below, and commercial elements, prize presentation, QR code, contact information, integrate through soft-sell styling that keeps the luxury tone. Neutral base colors, metallic accents, and material suggestions, marble, suede, silk, complete the premium positioning.",
        refinements:
          "The system generates standard, print-ready retail standee dimensions alongside multiple size variants, digital display versions, social media mockups, international translated versions, and special edition variations for flagship locations, all as campaign-specific design iterations.",
        qa: "Final deliverables are checked for high-resolution artwork at 300+ DPI, color-managed accuracy, print material and finish recommendations, brand guideline compliance, and installation specifications, ensuring flawless, production-ready retail presentation.",
      },

      keyFeatures: [
        {
          title: "Editorial photography integration",
          description:
            "High-quality model photography with professional lighting and styling becomes the hero of the design, elevating brand perception through visual sophistication.",
        },
        {
          title: "Refined luxury typography",
          description:
            "Elegant typeface selection and refined spacing communicate brand sophistication, every letter reinforces premium positioning.",
        },
        {
          title: "Ornamental design system",
          description:
            "Subtle decorative elements reinforce craftsmanship and heritage, ornaments enhance without overwhelming the elegant aesthetic.",
        },
        {
          title: "Promotional balance",
          description:
            "Commercial messaging, prizes, QR codes, location info, integrates seamlessly without compromising luxury brand positioning, maintaining prestige while driving engagement.",
        },
        {
          title: "Gallery-quality composition",
          description:
            "Professional layout and visual hierarchy create standees worthy of luxury retail environments, elevating the shopping experience.",
        },
        {
          title: "Brand consistency across locations",
          description:
            "Multiple standees maintain identical aesthetic and positioning, ensuring every retail boutique reflects brand prestige consistently.",
        },
        {
          title: "Material & finish quality",
          description:
            "Print material recommendations and finish specifications support the perception of luxury, every detail reinforces premium positioning.",
        },
        {
          title: "Campaign-specific variations",
          description:
            "Multiple design iterations support seasonal collections and promotional campaigns, keeping retail presentation fresh while maintaining brand identity.",
        },
      ],

      useCases: [
        {
          title: "Seasonal Collection Launch",
          description:
            "Generate standees for a new fashion collection showcasing models in collection pieces, creating an aspirational retail presentation that drives sales for the seasonal release.",
        },
        {
          title: "Flagship Boutique Opening",
          description:
            "Create signature standees for a new luxury boutique launch, establishing a premium brand presence from day one across every retail location.",
        },
        {
          title: "Designer Collaboration",
          description:
            "Develop special edition standees highlighting a collaboration with another luxury brand (Chanel gift promotion), positioning the collaboration as an exclusive, prestigious offering.",
        },
        {
          title: "Brand Heritage Campaign",
          description:
            "Create standees celebrating brand history, craftsmanship, or design philosophy, reinforcing brand prestige and justifying premium pricing through heritage narrative.",
        },
        {
          title: "Exclusive Event & VIP Experience",
          description:
            "Design standees promoting invitation-only events or VIP experiences, driving demand for exclusive brand access.",
        },
        {
          title: "Multi-Location Retail Expansion",
          description:
            "Rolling out to 20+ luxury boutiques generates coordinated standees that maintain brand consistency while supporting location-specific messaging.",
        },
        {
          title: "Advertising Campaign Integration",
          description:
            "Create standees supporting broader advertising campaigns, ensuring the retail environment aligns with media and digital brand positioning.",
        },
      ],

      scalability: [
        {
          title: "Seasonal Collection Variations",
          description:
            "Create standee variations for spring/summer, fall/winter, and resort collections, keeping retail presentation aligned with the design calendar.",
        },
        {
          title: "Multi-Lookbook Support",
          description:
            "Generate different standees featuring different models or outfits from the same collection to maximize visual interest across retail locations.",
        },
        {
          title: "Designer Story Integration",
          description:
            "Feature designer biography, inspiration sources, or creative process to build emotional connection and brand prestige through narrative.",
        },
        {
          title: "Location-Specific Customization",
          description:
            "Add boutique addresses, regional imagery, or location-specific styling to personalize standees for different geographic markets.",
        },
        {
          title: "Collaboration & Partnership Highlighting",
          description:
            "Feature co-branded messaging for designer collaborations or brand partnerships, positioning exclusivity and prestigious associations.",
        },
        {
          title: "Material & Finish Variations",
          description:
            "Generate specifications for different printing finishes, matte, gloss, metallic, emboss, elevating luxury perception through production quality.",
        },
        {
          title: "Digital & Social Media Adaptation",
          description:
            "Create digital versions optimized for Instagram, TikTok, and digital retail, extending the campaign across online and offline touchpoints.",
        },
        {
          title: "VIP & Exclusive Offer Variations",
          description:
            "Create standees promoting exclusive access, membership tiers, or limited editions to drive aspiration and purchase intent.",
        },
        {
          title: "Heritage & Archive Integration",
          description:
            "Feature brand history, iconic designs, or archival imagery to reinforce prestige and heritage positioning.",
        },
        {
          title: "International Market Adaptation",
          description:
            "Create multilingual standees for different markets with culturally relevant imagery and messaging to expand global brand presence.",
        },
        {
          title: "Window Display Coordination",
          description:
            "Design complementary standees that coordinate with window display themes to create a cohesive retail environment.",
        },
        {
          title: "Promotional Prize & Contest Integration",
          description:
            "Create variations highlighting different promotional offers or seasonal contests to drive customer engagement and data collection.",
        },
        {
          title: "Photography Series Rotation",
          description:
            "Generate multiple standees featuring different photographers' aesthetics or editorials to keep the visual presentation fresh and contemporary.",
        },
        {
          title: "Interactive & Augmented Reality",
          description:
            "Design standees with embedded QR codes or AR experiences to drive digital engagement and data collection from retail environments.",
        },
        {
          title: "Analytics & Performance Tracking",
          description:
            "Monitor engagement through QR code scans, social media hashtags, or location-specific data to measure standee effectiveness and optimize future designs.",
        },
        {
          title: "Sustainability & Eco-Luxury Messaging",
          description:
            "Highlight sustainable practices or eco-luxury materials in standee design to appeal to conscious luxury consumers.",
        },
        {
          title: "Limited Edition & Collector Signaling",
          description:
            "Create standees emphasizing exclusivity and limited availability to drive urgency and collector mentality among luxury customers.",
        },
      ],
    },
  },
];

export function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}
