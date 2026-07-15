"use client";

/* ------------------------------ infra ------------------------------ */

const DELAY = 160;
const delay = <T,>(v: T, ms = DELAY): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
function uid(p: string) {
  return `${p}-${Math.random().toString(36).slice(2, 8)}`;
}
function ref(p: string) {
  return `${p}-${Math.floor(1000 + Math.random() * 8999)}`;
}

/* ------------------------------ tickets ------------------------------ */

export type TicketStatus = "open" | "in_progress" | "awaiting_you" | "resolved" | "closed";
export type TicketCategory = "order" | "refund" | "payment" | "appointment" | "bug" | "account" | "other";
export type TicketPriority = "low" | "normal" | "high";

export type TicketMessage = {
  id: string;
  from: "you" | "agent";
  author: string;
  body: string;
  at: string;
};

export type Ticket = {
  id: string;
  ref: string;
  requester: string;
  category: TicketCategory;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  related?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
};

const DEFAULT_REQUESTER = "Jane Sharma";

export type NewTicket = {
  category: TicketCategory;
  subject: string;
  body: string;
  priority: TicketPriority;
  related?: string;
};

const LS_TICKETS = "suppai.support.tickets.v1";

function seedTickets(): Ticket[] {
  const now = Date.now();
  const hr = 3600000;
  const day = 86400000;
  return [
    {
      id: "t-1",
      ref: "SUP-4821",
      requester: DEFAULT_REQUESTER,
      category: "refund",
      subject: "Refund not received for cancelled lab test",
      priority: "high",
      status: "awaiting_you",
      related: "SA-ORD-4788",
      createdAt: new Date(now - 2 * day).toISOString(),
      updatedAt: new Date(now - 5 * hr).toISOString(),
      messages: [
        { id: "m1", from: "you", author: "You", body: "I cancelled my Thyroid Profile test two days ago but the ₹499 refund is still not in my wallet.", at: new Date(now - 2 * day).toISOString() },
        { id: "m2", from: "agent", author: "Ananya, Care team", body: "Thanks for flagging this. The refund was approved and is processing with your bank. Could you confirm the last 4 digits of the card used so we can trace it faster?", at: new Date(now - 5 * hr).toISOString() },
      ],
    },
    {
      id: "t-2",
      ref: "SUP-4756",
      requester: DEFAULT_REQUESTER,
      category: "order",
      subject: "Multivitamin subscription arrived a week late",
      priority: "normal",
      status: "resolved",
      related: "SA-ORD-4712",
      createdAt: new Date(now - 8 * day).toISOString(),
      updatedAt: new Date(now - 6 * day).toISOString(),
      messages: [
        { id: "m1", from: "you", author: "You", body: "My monthly multivitamin shipment was 7 days late this cycle.", at: new Date(now - 8 * day).toISOString() },
        { id: "m2", from: "agent", author: "Rohit, Care team", body: "Apologies for the delay. We have credited ₹100 to your wallet and prioritised your next dispatch. It ships tomorrow.", at: new Date(now - 6 * day).toISOString() },
      ],
    },
  ];
}

export async function fetchTickets(): Promise<Ticket[]> {
  return delay(readLocal(LS_TICKETS, seedTickets()));
}

export async function createTicket(input: NewTicket): Promise<Ticket[]> {
  const list = readLocal(LS_TICKETS, seedTickets());
  const iso = new Date().toISOString();
  const created: Ticket = {
    id: uid("t"),
    ref: ref("SUP"),
    requester: DEFAULT_REQUESTER,
    category: input.category,
    subject: input.subject.trim(),
    priority: input.priority,
    status: "open",
    related: input.related?.trim() || undefined,
    createdAt: iso,
    updatedAt: iso,
    messages: [{ id: uid("m"), from: "you", author: "You", body: input.body.trim(), at: iso }],
  };
  const next = [created, ...list];
  writeLocal(LS_TICKETS, next);
  return delay(next, 260);
}

export async function replyToTicket(id: string, body: string): Promise<Ticket[]> {
  const iso = new Date().toISOString();
  const list = readLocal(LS_TICKETS, seedTickets()).map((t) =>
    t.id === id
      ? {
          ...t,
          status: "in_progress" as TicketStatus,
          updatedAt: iso,
          messages: [...t.messages, { id: uid("m"), from: "you" as const, author: "You", body: body.trim(), at: iso }],
        }
      : t,
  );
  writeLocal(LS_TICKETS, list);
  return delay(list, 200);
}

export async function agentReplyToTicket(id: string, body: string, author = "Care team"): Promise<Ticket[]> {
  const iso = new Date().toISOString();
  const list = readLocal(LS_TICKETS, seedTickets()).map((t) =>
    t.id === id
      ? {
          ...t,
          status: "awaiting_you" as TicketStatus,
          updatedAt: iso,
          messages: [...t.messages, { id: uid("m"), from: "agent" as const, author, body: body.trim(), at: iso }],
        }
      : t,
  );
  writeLocal(LS_TICKETS, list);
  return delay(list, 200);
}

export async function setTicketStatus(id: string, status: TicketStatus): Promise<Ticket[]> {
  const iso = new Date().toISOString();
  const list = readLocal(LS_TICKETS, seedTickets()).map((t) =>
    t.id === id ? { ...t, status, updatedAt: iso } : t,
  );
  writeLocal(LS_TICKETS, list);
  return delay(list, 160);
}

/* ------------------------------ refunds & cancellations ------------------------------ */

export type RefundStatus = "requested" | "approved" | "processing" | "credited" | "rejected";

export type RefundRequest = {
  id: string;
  ref: string;
  orderRef: string;
  label: string;
  kind: "refund" | "cancellation";
  amount: number;
  method: string;
  status: RefundStatus;
  requestedAt: string;
  eta?: string;
};

export const REFUND_STEPS: { key: Exclude<RefundStatus, "rejected">; label: string }[] = [
  { key: "requested", label: "Requested" },
  { key: "approved", label: "Approved" },
  { key: "processing", label: "Processing" },
  { key: "credited", label: "Credited" },
];

const LS_REFUNDS = "suppai.support.refunds.v1";

function seedRefunds(): RefundRequest[] {
  const now = Date.now();
  const day = 86400000;
  return [
    { id: "r-1", ref: "RF-2031", orderRef: "SA-ORD-4788", label: "Thyroid Profile lab test", kind: "cancellation", amount: 499, method: "SuppAI Wallet", status: "processing", requestedAt: new Date(now - 2 * day).toISOString(), eta: "Credited by tomorrow" },
    { id: "r-2", ref: "RF-2018", orderRef: "SA-ORD-4655", label: "Omega-3 (2 units)", kind: "refund", amount: 1198, method: "HDFC card ending 4821", status: "credited", requestedAt: new Date(now - 9 * day).toISOString(), eta: "Credited on 26 Jun" },
    { id: "r-3", ref: "RF-1999", orderRef: "SA-ORD-4590", label: "Cancelled consult, Dr. Meera Nair", kind: "cancellation", amount: 600, method: "SuppAI Wallet", status: "requested", requestedAt: new Date(now - 6 * 3600000).toISOString(), eta: "Review within 24h" },
  ];
}

export async function fetchRefunds(): Promise<RefundRequest[]> {
  return delay(readLocal(LS_REFUNDS, seedRefunds()));
}

/* ------------------------------ help centre ------------------------------ */

export type HelpArticle = { id: string; q: string; a: string };
export type HelpCategory = { id: string; title: string; blurb: string; articles: HelpArticle[] };

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "orders",
    title: "Orders & delivery",
    blurb: "Tracking, changes, and shipping",
    articles: [
      { id: "o1", q: "How do I track my order?", a: "Open Track & Manage from the sidebar. Every order shows a live status and estimated delivery date, and shipped orders include a courier tracking link." },
      { id: "o2", q: "Can I change my delivery address after ordering?", a: "You can edit the address until the order is packed. Go to Track & Manage, open the order, and choose Change address. After dispatch, contact us and we will reroute where possible." },
      { id: "o3", q: "My order is late. What should I do?", a: "If an order is more than 3 days past its estimated date, raise a ticket under Orders & delivery and we will trace the shipment and compensate wallet credit where applicable." },
    ],
  },
  {
    id: "refunds",
    title: "Refunds & cancellations",
    blurb: "Cancelling and getting money back",
    articles: [
      { id: "rf1", q: "How long does a refund take?", a: "Wallet refunds are instant once approved. Card and UPI refunds take 3 to 5 working days to reflect, depending on your bank." },
      { id: "rf2", q: "Can I cancel a lab test or consult?", a: "Yes, up to 8 hours before the scheduled slot. Open Track & Manage, choose the booking, and select Cancel. The amount is refunded to your original payment method." },
      { id: "rf3", q: "Where do I see refund status?", a: "This Support page shows every refund and cancellation with a step-by-step status. You will also get a notification at each stage." },
    ],
  },
  {
    id: "payments",
    title: "Payments & wallet",
    blurb: "Billing, wallet, and offers",
    articles: [
      { id: "p1", q: "My payment failed but money was deducted.", a: "Failed-payment debits are auto-reversed within 5 working days. If it has been longer, raise a ticket under Payments & wallet with the transaction reference." },
      { id: "p2", q: "How do wallet offers and codes work?", a: "Apply an offer code at checkout. Cashback lands in your wallet after the order is delivered and the return window closes." },
    ],
  },
  {
    id: "care",
    title: "Doctors & labs",
    blurb: "Consults, tests, and reports",
    articles: [
      { id: "c1", q: "How do I reschedule an appointment?", a: "You can reschedule up to 8 hours before your slot from Track & Manage. Pick a new time from the doctor or lab's available slots." },
      { id: "c2", q: "When will my lab report be ready?", a: "Most reports publish within 24 to 48 hours of sample collection. You will be notified, and the PDF becomes downloadable from your report page." },
    ],
  },
  {
    id: "account",
    title: "Account & privacy",
    blurb: "Profile, plan, and data",
    articles: [
      { id: "a1", q: "How do I change my plan?", a: "Open Account, then Manage plan, or visit Plans & Membership. Changes apply from the next billing cycle." },
      { id: "a2", q: "How is my health data protected?", a: "Your data is encrypted in transit and at rest. You can export or delete it anytime from Account, Privacy & data." },
    ],
  },
];

/* ------------------------------ shared meta ------------------------------ */

export const TICKET_CATEGORY_LABEL: Record<TicketCategory, string> = {
  order: "Orders & delivery",
  refund: "Refunds & cancellations",
  payment: "Payments & wallet",
  appointment: "Doctors & labs",
  bug: "App problem",
  account: "Account & plan",
  other: "Something else",
};
