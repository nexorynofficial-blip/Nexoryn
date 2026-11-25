import thumbnail from "../assets/blog/website-development-services-thumbnail.webp";
import fiveComponents from "../assets/blog/website-development-services-five-components.webp";
import pricingTable from "../assets/blog/website-development-services-pricing-table.webp";
import vettingChecklist from "../assets/blog/website-development-agency-vetting-checklist.webp";
import processFiveSteps from "../assets/blog/website-development-process-five-steps.webp";

// Bundled images, looked up by the key a post uses in blogPosts.js. Kept apart
// from the post text so blogPosts.js has no asset imports and the build-time
// SEO script (plain Node) can read it too.
export const BLOG_IMAGES = {
  thumbnail,
  "five-components": fiveComponents,
  "pricing-table": pricingTable,
  "vetting-checklist": vettingChecklist,
  "process-five-steps": processFiveSteps,
};
