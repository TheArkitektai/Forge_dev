/* @forge/subscription — Stripe Placeholder (Session 05 gap) */

export interface StripePlaceholder {
  enabled: false;
  note: string;
}

export const stripePlaceholder: StripePlaceholder = {
  enabled: false,
  note: "Stripe integration is a placeholder. Set STRIPE_SECRET_KEY to enable.",
};

export function isStripeEnabled(): boolean {
  return false;
}
