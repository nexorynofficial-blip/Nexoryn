// A point card: icon tile, an all-caps title with its key words in orange, and
// one short line of detail, on a dark card that warms to orange at the left.
// Shared by the Problems and Solutions sections so they read as a pair.
export function HighlightCard({ icon, title, highlight, description }) {
  return (
    <div className="flex h-full items-center gap-4 rounded-[1.25rem] bg-[linear-gradient(90deg,rgba(107,37,8,0.45)_0%,rgba(42,15,4,0.5)_20%,#000_45%)] p-2.5 pr-4 lg:gap-3 lg:pr-3 wide:gap-4 wide:pr-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border lg:h-12 lg:w-12 lg:rounded-xl wide:h-16 wide:w-16 wide:rounded-2xl border-accent-from/30 bg-gradient-to-b from-[#2a1608] to-[#0d0703] text-accent-from shadow-[0_0_24px_-6px_rgba(255,122,26,0.35)] [&_svg]:h-7 [&_svg]:w-7 lg:[&_svg]:h-6 lg:[&_svg]:w-6 wide:[&_svg]:h-7 wide:[&_svg]:w-7">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-heading text-[15px] font-extrabold uppercase leading-tight text-white lg:text-[14px] wide:whitespace-nowrap wide:text-[14px] 2xl:text-[16px]">
          {title}{" "}
          <span className="bg-gradient-to-r from-accent-from to-accent-to bg-clip-text text-transparent">
            {highlight}
          </span>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-body-dim lg:text-[13px] wide:text-[15px]">{description}</p>
      </div>
    </div>
  );
}
