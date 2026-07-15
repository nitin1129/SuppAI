import { LegalDoc, PublicPage } from "@/components/shell/PublicPage";

export default function Page() {
  return (
    <PublicPage title="Terms and conditions" subtitle="The rules for using SuppAI.">
      <LegalDoc
        updated="1 July 2026"
        sections={[
          { h: "Acceptance of terms", p: "By creating an account or using SuppAI, you agree to these terms. If you do not agree, please do not use the service." },
          { h: "Eligibility", p: "You must be at least 18 years old, or use the service under the supervision of a parent or guardian, and provide accurate information about yourself." },
          { h: "Your account", p: "You are responsible for keeping your login secure and for all activity under your account. Tell us immediately if you suspect any unauthorised use." },
          { h: "Services", p: "SuppAI provides health tools, plans, bookings, and a store. Availability of specific products, labs, or doctors may change, and some features depend on third-party partners." },
          { h: "Payments and subscriptions", p: "Prices are shown before you pay. Subscriptions renew automatically until cancelled, and you can pause, resume, or cancel from your account." },
          { h: "Acceptable use", p: "Do not misuse the service, attempt to disrupt it, or use it for anything unlawful. We may suspend accounts that violate these terms." },
          { h: "Limitation of liability", p: "SuppAI is provided on an as-is basis. To the extent permitted by law, we are not liable for indirect or consequential losses arising from your use of the service." },
          { h: "Changes to these terms", p: "We may update these terms from time to time. Continued use after an update means you accept the revised terms." },
          { h: "Contact", p: "For questions about these terms, contact support@suppai.health." },
        ]}
      />
    </PublicPage>
  );
}
