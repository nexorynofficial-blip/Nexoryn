import { Phone, MessageCircle } from "lucide-react";

const PHONE_DISPLAY = "0334-1236462";
const PHONE_HREF = "tel:+923341236462";
const WHATSAPP_HREF = "https://wa.me/923341236462";

// Lives inline at the bottom-right of the footer (rendered once, from
// Footer.jsx) rather than floating over page content on every route.
export function ContactShortcuts({ className = "" }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-3 md:justify-end ${className}`}
    >

      <a
        href={PHONE_HREF}
        aria-label={`Call us at ${PHONE_DISPLAY}`}
        className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition duration-300 hover:border-orange-400/40 hover:bg-white/10"
      >
        <Phone className="h-4 w-4 text-orange-400" />
        Call Us
      </a>
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp"
        className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition duration-300 hover:border-orange-400/40 hover:bg-white/10"
      >
        <MessageCircle className="h-4 w-4 text-orange-400" />
        WhatsApp Us
      </a>
    </div>
  );
}
