import thumbnail from "../assets/blog/website-development-services-thumbnail.webp";
import fiveComponents from "../assets/blog/website-development-services-five-components.webp";
import pricingTable from "../assets/blog/website-development-services-pricing-table.webp";
import vettingChecklist from "../assets/blog/website-development-agency-vetting-checklist.webp";
import processFiveSteps from "../assets/blog/website-development-process-five-steps.webp";
import aiThumbnail from "../assets/blog/ai-automation-company-thumbnail.webp";
import aiManualToAutomated from "../assets/blog/ai-automation-manual-to-automated.webp";
import aiPricingTable from "../assets/blog/ai-automation-pricing-table.webp";
import aiVerificationChecklist from "../assets/blog/ai-automation-vendor-verification-checklist.webp";
import aiProcessFiveSteps from "../assets/blog/ai-automation-process-five-steps.webp";

// Bundled images, looked up by the key a post uses in blogPosts.js. Kept apart
// from the post text so blogPosts.js has no asset imports and the build-time
// SEO script (plain Node) can read it too.
export const BLOG_IMAGES = {
  thumbnail,
  "five-components": fiveComponents,
  "pricing-table": pricingTable,
  "vetting-checklist": vettingChecklist,
  "process-five-steps": processFiveSteps,
  "ai-thumbnail": aiThumbnail,
  "ai-manual-to-automated": aiManualToAutomated,
  "ai-pricing-table": aiPricingTable,
  "ai-verification-checklist": aiVerificationChecklist,
  "ai-process-five-steps": aiProcessFiveSteps,
};
