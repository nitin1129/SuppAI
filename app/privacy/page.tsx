import { LegalDoc, PublicPage } from "@/components/shell/PublicPage";

export default function Page() {
  return (
    <PublicPage title="Privacy policy" subtitle="How SuppAI collects, uses, and protects your information.">
      <LegalDoc
        updated="1 July 2026"
        sections={[
          { h: "Information we collect", p: "We collect the details you provide when you create an account, upload a report, book a consult or lab test, and place an order. This includes your name, contact details, health documents, and payment information processed by our payment partners." },
          { h: "How we use your information", p: "Your information is used to analyse your reports, build your plans, fulfil orders and bookings, provide support, and keep your account secure. We do not sell your personal data." },
          { h: "Health data", p: "Health reports and results are sensitive. They are encrypted in transit and at rest, and are only used to deliver the features you ask for. You can export or delete this data at any time from Account, Privacy and data." },
          { h: "Sharing", p: "We share information only with the partners needed to serve you, such as labs, doctors, delivery, and payment providers, and only to the extent required to complete your request or as required by law." },
          { h: "Security", p: "We use industry-standard safeguards to protect your data. No method of transmission or storage is completely secure, so we continually review and improve our controls." },
          { h: "Your rights", p: "You can access, correct, export, or delete your data, and control notifications, from your account settings. Contact us if you need help exercising any of these rights." },
          { h: "Contact", p: "Questions about privacy can be sent to privacy@suppai.health and we will respond within a reasonable time." },
        ]}
      />
    </PublicPage>
  );
}
