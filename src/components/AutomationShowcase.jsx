import { lazy, Suspense } from "react";
import { ContainerScroll } from "./ui/ContainerScroll";
import { useAfterIdle } from "../hooks/useAfterIdle";

// The editor is a fair amount of SVG; it loads after the page is idle so it
// never competes with the first screen.
const WorkflowDemo = lazy(() => import("./n8n/WorkflowDemo"));

export default function AutomationShowcase() {
  const ready = useAfterIdle();

  return (
    <section id="automation" className="relative overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="mb-16 md:mb-20">
            <h2 className="font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl">
              Your Business, <span className="text-accent-from">On Autopilot.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-body-dim">
              A live AI support workflow: every message read, routed and
              resolved in seconds, around the clock.
            </p>
          </div>
        }
      >
        {ready && (
          <Suspense fallback={null}>
            <WorkflowDemo />
          </Suspense>
        )}
      </ContainerScroll>
    </section>
  );
}
