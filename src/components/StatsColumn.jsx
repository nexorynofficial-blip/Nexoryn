import { EncryptedText } from "./ui/EncryptedText";

const STATS = [
  { label: ["Project", "Delivered"], value: "200+" },
  { label: ["Client", "Retention"], value: "87%" },
  { label: ["Country", "Served"], value: "25+" },
];

export default function StatsColumn({ className = "" }) {
  return (
    <div className={`w-full max-w-sm ${className}`}>
      {STATS.map((stat, i) => (
        <div
          key={stat.value}
          className={`flex items-center justify-between gap-8 py-4 short:py-2.5 ${
            i > 0 ? "border-t border-white/40" : ""
          }`}
        >
          <p className="font-heading-hero text-xs uppercase leading-relaxed tracking-[0.2em] text-white">
            {stat.label[0]}
            <br />
            {stat.label[1]}
          </p>
          <EncryptedText
            text={stat.value}
            className="font-heading-hero text-3xl tracking-wider lg:text-4xl"
            encryptedClassName="text-neutral-500"
            revealedClassName="text-white font-bold"
            revealDelayMs={50}
            startDelayMs={400 + i * 300}
          />
        </div>
      ))}
    </div>
  );
}
