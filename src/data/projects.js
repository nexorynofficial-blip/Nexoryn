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
} from "lucide-react";
import chatbotThumb from "../assets/project-ai-chatbot-thumb.png";

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
        "An AI-powered support agent built for Shopify stores. It classifies every incoming customer message, resolves routine requests like order status or FAQs instantly, and escalates refunds or complaints to a human through Slack — with every conversation logged for full visibility.",

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
              "Routes each conversation down the correct path — live Shopify lookups for orders, refund eligibility checks, FAQ answers, or complaint escalation.",
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
          "This system demonstrates that AI can safely handle the majority of support volume while keeping humans in control of sensitive decisions — reducing response time without sacrificing judgment or accuracy.",
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
];

export function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}
