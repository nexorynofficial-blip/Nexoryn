import { Phone, MessageCircle } from "lucide-react";

const PHONE_DISPLAY = "+1 (555) 123-4567";
const PHONE_HREF = "tel:+15551234567";
const WHATSAPP_HREF = "https://wa.me/15551234567";

// Floating on desktop (bottom-right corner widget), a full-width sticky bar
// on mobile — stays reachable no matter how far the page is scrolled.
export function ContactShortcuts() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-3 border-t border-white/10 bg-black/80 p-3 backdrop-blur-xl md:inset-x-auto md:bottom-6 md:right-6 md:flex-col md:items-stretch md:border-0 md:bg-transparent md:p-0">
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
