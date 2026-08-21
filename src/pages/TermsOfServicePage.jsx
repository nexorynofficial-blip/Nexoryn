import LegalPageShell, {
  LegalSection,
  LegalList,
} from "../components/legal/LegalPageShell";

export default function TermsOfServicePage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      description="The terms that apply when you use the Nexoryn website or engage us for a project."
      updated="August 21, 2026"
    >
      <LegalSection heading="1. Acceptance of Terms">
        <p>
          By browsing this website or submitting one of our contact forms,
          you agree to these Terms of Service. If you don't agree with them,
          please don't use the Site.
        </p>
      </LegalSection>

      <LegalSection heading="2. Who We Are">
        <p>
          Nexoryn is a Pakistan-based agency offering three core services:
          AI-driven workflow and voice automation, custom website and web
          application development, and brand/graphic design. Details of each
          service are described on our Services page.
        </p>
      </LegalSection>

      <LegalSection heading="3. Website Use">
        <p>
          The content on this Site, including the portfolio case studies,
          service descriptions, and written copy, is provided for
          informational purposes to help you evaluate our work. You agree
          not to:
        </p>
        <LegalList
          items={[
            "Use the Site for any unlawful purpose",
            "Scrape, harvest, or systematically extract content from the Site using automated tools",
            "Attempt to gain unauthorized access to the Site, its forms, or any connected service",
            "Interfere with the Site's normal operation or security",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Contact Forms Are Inquiries, Not Contracts">
        <p>
          Submitting the Ask a Question, Book a Consultation, or Let's Start
          form starts a conversation, it does not create a binding agreement
          or commit either party to a project. A project only begins once
          we've discussed scope, pricing, and timeline with you and both
          sides agree, typically documented in a separate proposal or
          contract outside of this Site.
        </p>
        <p>
          A free consultation, where offered, is a scoping conversation with
          no obligation to move forward on either side.
        </p>
      </LegalSection>

      <LegalSection heading="5. Portfolio and Case Studies">
        <p>
          Our portfolio showcases real projects we've built, including
          automation systems, websites, and design work, described from our
          own perspective as the developer or designer. Results, timelines,
          and outcomes described in a case study reflect that specific
          project and are not a guarantee of similar results for a future
          engagement, every business and workflow is different.
        </p>
        <p>
          Some case study pages embed a live preview of the deployed client
          project inside the page (for example, an iframe pointing to a
          Vercel deployment). These embedded sites are separate products,
          in some cases still owned and operated by us, in others handed
          over to the client, and are not part of this Site's own
          functionality.
        </p>
      </LegalSection>

      <LegalSection heading="6. Intellectual Property">
        <p>
          The Nexoryn name, logo, and the design, layout, and original
          written content of this Site belong to Nexoryn. Screenshots and
          descriptions of client projects shown in our portfolio are used to
          showcase our work; underlying client brands, trademarks, and
          proprietary business content remain the property of the respective
          client.
        </p>
        <p>
          You may not reproduce, copy, or redistribute this Site's design or
          written content without our permission.
        </p>
      </LegalSection>

      <LegalSection heading="7. Third-Party Services and Links">
        <p>
          The Site relies on a small number of third-party services to
          function: EmailJS to deliver contact-form submissions to our
          inbox, Google Fonts to load our typefaces, and standard hosting
          infrastructure to serve the Site itself. The Site also links out
          to our social profiles and to WhatsApp for direct messaging. We
          aren't responsible for the content, availability, or practices of
          any third-party service or site we link to or rely on.
        </p>
      </LegalSection>

      <LegalSection heading="8. No Warranty">
        <p>
          The Site and its content are provided "as is." We work to keep
          information on the Site accurate and up to date, but we don't
          guarantee that it's error-free, complete, or uninterrupted at all
          times.
        </p>
      </LegalSection>

      <LegalSection heading="9. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, Nexoryn is not liable for
          any indirect, incidental, or consequential damages arising from
          your use of, or inability to use, this Site. This section does not
          limit any separate liability terms agreed to in a signed project
          contract.
        </p>
      </LegalSection>

      <LegalSection heading="10. Governing Law">
        <p>
          These Terms are governed by the laws of Pakistan, without regard to
          conflict-of-law principles. Any dispute arising from your use of
          the Site will be subject to the jurisdiction of the courts of
          Pakistan.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Material changes will
          be reflected by updating the "Last updated" date above. Continued
          use of the Site after changes are posted means you accept the
          updated Terms.
        </p>
      </LegalSection>

      <LegalSection heading="12. Contact Us">
        <p>
          Questions about these Terms? Reach us at{" "}
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
