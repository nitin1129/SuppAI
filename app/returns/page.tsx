import { LegalDoc, PublicPage } from "@/components/shell/PublicPage";

export default function Page() {
  return (
    <PublicPage title="Return policy" subtitle="When and how you can return an order.">
      <LegalDoc
        updated="1 July 2026"
        sections={[
          { h: "Return window", p: "Most products can be returned within 7 days of delivery if they are unopened and in their original, sealed condition." },
          { h: "Eligible items", p: "Sealed supplements, foods, and equipment in resalable condition are eligible. Please keep the original packaging and invoice." },
          { h: "Non-returnable items", p: "For safety and hygiene, opened supplements or foods, personalised items, and completed lab tests or consultations cannot be returned." },
          { h: "How to start a return", p: "Open the order in Track and Manage and choose Return, or raise a ticket from Support. We will arrange pickup where available." },
          { h: "Refund timeline", p: "Once we receive and check the item, wallet refunds are instant and card or UPI refunds reflect within 3 to 5 business days." },
        ]}
      />
    </PublicPage>
  );
}
