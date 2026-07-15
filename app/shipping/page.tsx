import { LegalDoc, PublicPage } from "@/components/shell/PublicPage";

export default function Page() {
  return (
    <PublicPage title="Shipping policy" subtitle="How and when your orders are delivered.">
      <LegalDoc
        updated="1 July 2026"
        sections={[
          { h: "Order processing", p: "Orders are usually processed within 1 business day. You will get a confirmation and, once dispatched, a tracking link inside Track and Manage." },
          { h: "Delivery timelines", p: "Standard delivery typically takes 2 to 5 business days depending on your location. Metro areas are usually faster than remote pin codes." },
          { h: "Shipping charges", p: "Shipping charges, if any, are shown at checkout before you pay. Eligible plans and offers may include free delivery." },
          { h: "Tracking", p: "Every shipped order includes live status and a courier tracking link. You will also receive notifications at key stages." },
          { h: "Delays and issues", p: "If an order is delayed beyond its estimate or arrives damaged, raise a ticket from Support and we will trace the shipment and make it right." },
        ]}
      />
    </PublicPage>
  );
}
