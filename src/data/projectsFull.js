import { PROJECTS } from "./projects";
import { CASE_STUDIES } from "./projectCaseStudies";

// PROJECTS with each project's case study attached. Imported by the case-study
// page (and, lazily, by lib/content.js); everything else uses the light list.
export const FULL_PROJECTS = PROJECTS.map((p) => ({ ...p, caseStudy: CASE_STUDIES[p.slug] }));

export function getProjectBySlug(slug) {
  return FULL_PROJECTS.find((p) => p.slug === slug);
}
