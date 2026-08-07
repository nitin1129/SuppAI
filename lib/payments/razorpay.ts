"use client";

/* Razorpay Checkout integration for the SuppAI Pro plans.

   The Key ID comes from the environment:
     NEXT_PUBLIC_RAZORPAY_KEY_ID   (set it in .env.local, see .env.example)
   Plan prices come from the existing plans, so nothing else to set.
   When the Key ID is missing, checkout runs in demo mode: it skips the
   real Razorpay popup and simulates a successful payment so the full flow
   (confirm -> paid -> plan active) can be seen. */

export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

export function isRazorpayConfigured(): boolean {
  return /^rzp_(test|live)_/.test(RAZORPAY_KEY_ID) && !RAZORPAY_KEY_ID.includes("XXXX");
}

/* ----------------------------- SDK loader ----------------------------- */

type RazorpaySuccess = { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string };
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler?: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
};
type RazorpayInstance = { open: () => void; on: (event: string, cb: (r: unknown) => void) => void };

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SDK = "https://checkout.razorpay.com/v1/checkout.js";
let loader: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay needs a browser"));
  if (window.Razorpay) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SDK;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { loader = null; reject(new Error("Could not load Razorpay")); };
    document.body.appendChild(s);
  });
  return loader;
}

/* ----------------------------- checkout ----------------------------- */

export async function openRazorpay(params: {
  amountPaise: number;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  onSuccess: (paymentId: string) => void;
  onDismiss?: () => void;
}): Promise<void> {
  await loadRazorpay();
  if (!window.Razorpay) throw new Error("Razorpay unavailable");
  const rzp = new window.Razorpay({
    key: RAZORPAY_KEY_ID,
    amount: params.amountPaise,
    currency: "INR",
    name: params.name,
    description: params.description,
    prefill: params.prefill,
    notes: params.notes,
    theme: { color: "#006E42" },
    handler: (res) => params.onSuccess(res.razorpay_payment_id),
    modal: { ondismiss: () => params.onDismiss?.() },
  });
  rzp.open();
}
