/** Pricing math shared by seeds and the booking flow. */
import type { Estimate } from "./types";

export const CONVENIENCE_FEE = 49;
export const GST_RATE = 0.18;
export const ESTIMATE_DISCLAIMER =
  "Final charges depend on inspection and customer approval.";

/** Line-item breakdown for a booking estimate (demo figures in INR). */
export function buildEstimate(serviceCharge: number): Estimate {
  const subtotal = serviceCharge + CONVENIENCE_FEE;
  const tax = Math.round(subtotal * GST_RATE * 100) / 100;
  const total =
    Math.round((subtotal + tax) * 100) / 100;

  return {
    lines: [
      { label: "Service charge", amount: serviceCharge, kind: "charge" },
      { label: "Convenience fee", amount: CONVENIENCE_FEE, kind: "fee" },
      { label: "Tax (18% GST)", amount: tax, kind: "tax" },
    ],
    total,
    disclaimer: ESTIMATE_DISCLAIMER,
  };
}
