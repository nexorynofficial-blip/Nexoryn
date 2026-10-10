import { BatteryFull, Lock, Signal, Wifi } from "lucide-react";

const DATE_FORMAT = { weekday: "long", day: "numeric", month: "long" };

/**
 * An iPhone (Pro-style: thin titanium frame, Dynamic Island) showing its lock
 * screen, with `children` as the notification stack. Pure CSS, no images.
 */
export function PhoneMockup({ children, className = "" }) {
  const today = new Date().toLocaleDateString("en-GB", DATE_FORMAT).replace(",", "");

  return (
    <div className={`relative ${className}`}>
      {/* Side buttons */}
      <span aria-hidden="true" className="absolute -left-[3px] top-[110px] h-7 w-[3px] rounded-l bg-[#2b2b2e]" />
      <span aria-hidden="true" className="absolute -left-[3px] top-[160px] h-12 w-[3px] rounded-l bg-[#2b2b2e]" />
      <span aria-hidden="true" className="absolute -left-[3px] top-[220px] h-12 w-[3px] rounded-l bg-[#2b2b2e]" />
      <span aria-hidden="true" className="absolute -right-[3px] top-[180px] h-20 w-[3px] rounded-r bg-[#2b2b2e]" />

      {/* Frame: dark titanium with an orange rim light */}
      <div className="relative h-full rounded-[3.1rem] bg-gradient-to-b from-[#3a3a3d] via-[#1d1d20] to-[#2a2a2d] p-[9px] shadow-[0_0_0_1px_rgba(255,122,26,0.35),0_0_60px_-8px_rgba(255,122,26,0.45),0_40px_80px_rgba(0,0,0,0.65)]">
        {/* Screen */}
        <div className="relative flex h-full flex-col overflow-hidden rounded-[2.55rem] bg-[radial-gradient(120%_80%_at_50%_0%,#3a1a08_0%,#140904_45%,#050302_100%)]">
          {/* Dynamic Island */}
          <div aria-hidden="true" className="absolute left-1/2 top-2.5 z-10 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />

          {/* Status bar */}
          <div className="flex items-center justify-between px-7 pt-3.5 text-white">
            <span className="text-[13px] font-semibold">9:41</span>
            <span className="flex items-center gap-1">
              <Signal aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
              <Wifi aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
              <BatteryFull aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            </span>
          </div>

          {/* Lock screen clock */}
          <div className="mt-5 flex flex-col items-center text-white">
            <Lock aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
            <p className="mt-1.5 text-[64px] font-light leading-none tracking-tight">9:41</p>
            <p className="mt-1.5 text-sm font-medium text-white/85">{today}</p>
          </div>

          {/* Notifications */}
          <div className="relative mt-5 min-h-0 flex-1 overflow-hidden px-3 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]">
            {children}
          </div>

          {/* Home indicator */}
          <div aria-hidden="true" className="flex justify-center pb-2 pt-3">
            <span className="h-1 w-28 rounded-full bg-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
