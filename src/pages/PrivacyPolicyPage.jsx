import LegalPageShell, {
  LegalSection,
  LegalList,
} from "../components/legal/LegalPageShell";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      description="How Nexoryn collects, uses, and protects the information you share with us."
      updated="August 21, 2026"
    >
      <LegalSection heading="1. Introduction">
        <p>
          Nexoryn ("we," "us," or "our") builds automation systems, websites,
          and design assets for clients. This policy explains what
          information our website (nexoryn.ai and its subdomains, the "Site")
          collects when you browse it or submit one of our contact forms, and
          how that information is used, shared, and protected.
        </p>
        <p>
          This policy covers the Nexoryn website itself. It does not cover
          the separate websites, apps, or platforms we build and operate for
          our clients, each of which has its own privacy practices.
        </p>
      </LegalSection>

      <LegalSection heading="2. Information You Provide to Us">
        <p>
          The Site does not require an account or login. The only
          information we collect directly from you is what you choose to
          submit through the Contact page's three forms, Ask a Question, Book
          a Consultation, and Let's Start, depending on which one you fill
          out:
        </p>
        <LegalList
          items={[
            "Your name and email address",
            "Your contact/phone number, if provided",
            "Your country and city, if provided",
            "Your company name, if provided",
            "The message, notes, or project details you write",
            "For consultation requests: your preferred date and time",
            "For project inquiries: the project type and budget range you select",
          ]}
        />
        <p>
          All fields marked optional are exactly that, you're never required
          to provide more than your name, email, and message to reach us.
        </p>
      </LegalSection>

      <LegalSection heading="3. Information Collected Automatically">
        <p>
          The Site does not run any analytics, advertising, or
          visitor-tracking scripts, we don't currently use tools like Google
          Analytics, Meta Pixel, or similar services to monitor how you use
          the Site. The Site also does not use browser storage
          (localStorage/sessionStorage) or set any cookies of its own. See
          our{" "}
          <a
            href="/cookie-policy"
            className="font-medium text-accent-to underline underline-offset-2 transition-colors duration-300 hover:text-accent-from"
          >
            Cookie Policy
          </a>{" "}
          for the full picture, including what our hosting and font
          providers may log as a standard part of serving the page.
        </p>
        <p>
          Our hosting/CDN provider automatically records standard technical
          request data for every visit, such as IP address, browser type,
          and pages requested, purely as part of normal web server operation
          and basic security monitoring. We don't use this data to build
          individual visitor profiles.
        </p>
      </LegalSection>

      <LegalSection heading="4. How We Use Your Information">
        <LegalList
          items={[
            "To respond to your question, consultation request, or project inquiry",
            "To understand your project scope well enough to prepare a proposal or quote",
            "To schedule and prepare for a consultation call, if you booked one",
            "To keep a record of client communications for our own project and business records",
          ]}
        />
        <p>
          We do not use the information you submit for advertising, and we
          do not sell, rent, or trade it to third parties.
        </p>
      </LegalSection>

      <LegalSection heading="5. How Your Information Is Shared">
        <p>
          Form submissions are delivered to us by email using EmailJS, a
          third-party email-delivery service that relays your submitted
          information from the Site to our inbox at
          nexorynofficial@gmail.com. EmailJS processes that data solely to
          deliver the message and does not appear to us to use it for any
          other purpose. Beyond EmailJS and our own hosting provider, we do
          not share your information with any other third party, and we
          never sell it.
        </p>
      </LegalSection>

      <LegalSection heading="6. Data Retention">
        <p>
          We keep submitted contact and project information for as long as
          reasonably necessary to respond to your inquiry, deliver a project,
          or maintain our business records, and delete or anonymize it once
          it's no longer needed for those purposes. You can ask us to delete
          your information at any time, see Section 8 below.
        </p>
      </LegalSection>

      <LegalSection heading="7. Third-Party Links and Embedded Content">
        <p>
          Portions of the Site link out to, or embed, content we don't
          control:
        </p>
        <LegalList
          items={[
            "Case study pages may embed a live preview of a client project's deployed website (for example, a project hosted on Vercel) directly inside the page. Once loaded, that embedded site operates under its own privacy and cookie practices, not ours.",
            "Footer and contact links point to our social profiles (Facebook, Instagram, Threads, LinkedIn) and to WhatsApp, each governed by that platform's own privacy policy.",
            "The \"Prefer email?\" link opens Gmail's compose window with our address pre-filled, that interaction happens on Google's site, not ours.",
          ]}
        />
        <p>
          We recommend reviewing the privacy policy of any third-party site
          before sharing information with it.
        </p>
      </LegalSection>

      <LegalSection heading="8. Your Choices and Rights">
        <p>
          You can ask us, at any time, to tell you what information we hold
          about you, correct it, or delete it. To do so, email us at{" "}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=nexorynofficial@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent-to underline underline-offset-2 transition-colors duration-300 hover:text-accent-from"
          >
            nexorynofficial@gmail.com
          </a>{" "}
          and we'll action your request within a reasonable time.
        </p>
      </LegalSection>

      <LegalSection heading="9. Children's Privacy">
        <p>
          The Site is intended for business use and is not directed at
          children. We don't knowingly collect information from anyone under
          16.
        </p>
      </LegalSection>

      <LegalSection heading="10. Data Security">
        <p>
          We take reasonable technical and organizational measures to
          protect the information you share with us. No method of
          transmission or storage is completely secure, so while we work to
          protect your information, we can't guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to This Policy">
        <p>
          We may update this policy as the Site or our practices change.
          Material changes will be reflected by updating the "Last updated"
          date above. We encourage you to review this page periodically.
        </p>
      </LegalSection>

      <LegalSection heading="12. Contact Us">
        <p>
          Questions about this policy or your information? Reach us at{" "}
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
