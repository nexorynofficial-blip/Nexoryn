import LegalPageShell, { LegalSection, LegalList } from "../components/legal/LegalPageShell";

export default function CookiePolicyPage() {
  return (
    <LegalPageShell
      title="Cookie Policy"
      description="What Nexoryn's website does, and doesn't, store in your browser."
      updated="August 21, 2026"
    >
      <LegalSection heading="1. What Are Cookies">
        <p>
          Cookies are small text files a website can store in your browser
          to remember information between visits. Sites also sometimes use
          similar browser storage, like localStorage, for the same purpose.
        </p>
      </LegalSection>

      <LegalSection heading="2. Cookies We Set">
        <p>
          Short answer: none. Nexoryn's own website code does not set any
          cookies, and does not use localStorage or sessionStorage. We don't
          run any analytics, advertising, or visitor-tracking scripts, so
          there's no cookie banner on this Site because there's nothing
          non-essential to ask your consent for.
        </p>
      </LegalSection>

      <LegalSection heading="3. What Our Third-Party Providers May Do">
        <p>
          A small number of external services are loaded as part of serving
          the Site, and each operates under its own policy, outside our
          control:
        </p>
        <LegalList
          items={[
            "Google Fonts, used to load the typefaces you see across the Site, fetched directly from Google's servers (fonts.googleapis.com and fonts.gstatic.com). Google may log standard technical request data as part of delivering these fonts.",
            "EmailJS, used only when you submit a contact form, to relay your message to our inbox by email. It is not loaded or active unless you submit a form.",
            "Our hosting/CDN provider, which serves the Site's files and may keep standard server access logs (IP address, browser type, request time) as part of normal web hosting operation.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Embedded Live Previews">
        <p>
          Some portfolio case study pages include a "Live Preview" tab that
          loads a client project's actual deployed website inside an iframe
          directly on the page. Once that embedded site loads, it is a
          separate website and may set its own cookies according to its own
          cookie policy, we don't control what it does and this policy
          doesn't cover it.
        </p>
      </LegalSection>

      <LegalSection heading="5. External Images">
        <p>
          A small number of images on the Site (for example, team photos on
          the About page) are loaded directly from Unsplash's image CDN
          rather than hosted by us. Loading these images may cause your
          browser to make a request to Unsplash's servers, subject to
          Unsplash's own policies.
        </p>
      </LegalSection>

      <LegalSection heading="6. If This Changes">
        <p>
          If we introduce analytics, advertising, or any other cookie-based
          tool in the future, we'll update this page to describe exactly
          what's added and, where legally required, add a consent mechanism
          before it's active.
        </p>
      </LegalSection>

      <LegalSection heading="7. Managing Cookies in Your Browser">
        <p>
          Since this Site doesn't set cookies of its own, there's nothing
          here to opt out of. If you'd like to control cookies set by
          third-party sites you visit in general, most browsers let you
          block or clear cookies from their privacy or settings menu.
        </p>
      </LegalSection>

      <LegalSection heading="8. Contact Us">
        <p>
          Questions about this policy? Reach us at{" "}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=nexorynofficial@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent-to underline underline-offset-2 transition-colors duration-300 hover:text-accent-from"
          >
            nexorynofficial@gmail.com
          </a>{" "}
          or{" "}
          <a
            href="tel:+923341236462"
            className="font-medium text-accent-to underline underline-offset-2 transition-colors duration-300 hover:text-accent-from"
          >
            0334-1236462
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
