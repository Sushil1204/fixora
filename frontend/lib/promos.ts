/**
 * Home hero promotion content.
 *
 * The hero renders this list in order and adapts to whatever it contains —
 * add, remove, reorder or reword slides here and the page layout stays the
 * same. Only `id`, `title`, `tone`, `icon` and `cta` are required; every other
 * field is optional, so one slide can be a headline plus a link while another
 * carries an offer badge and a price.
 *
 * Swap this static list for a CMS or API response later: the `Promo[]` shape
 * is the only contract the carousel depends on.
 */

import type { ServiceCategory } from "./types";

/** Visual treatment of a slide — three restrained options from the token set. */
export type PromoTone = "brand" | "sunrise" | "mist";

export interface Promo {
  id: string;
  tone: PromoTone;
  /** Category glyph used by the slide artwork. */
  icon: ServiceCategory["icon"];
  /** Short kicker, e.g. "Seasonal" or "This week". */
  eyebrow?: string;
  /** One concise line — clamped to two lines in the hero. */
  title: string;
  /** Optional supporting line — clamped to one line. */
  body?: string;
  /** Optional price/offer badge, e.g. "From ₹899". */
  price?: string;
  cta: { label: string; href: string };
}

export const HOME_PROMOS: Promo[] = [
  {
    id: "monsoon-cooling",
    tone: "brand",
    icon: "wind",
    eyebrow: "Seasonal",
    title: "Monsoon-ready cooling, checked end to end.",
    body: "AC deep clean and gas-pressure check.",
    price: "From ₹899",
    cta: { label: "Book AC service", href: "/book/ac-service-deep-clean" },
  },
  {
    id: "leak-week",
    tone: "sunrise",
    icon: "droplet",
    eyebrow: "This week",
    title: "Stop the drip before it spreads.",
    body: "Taps, mixers and blocked drains — parts quoted up front.",
    price: "From ₹499",
    cta: { label: "Fix a leak", href: "/book/tap-faucet-repair" },
  },
  {
    id: "mobile-featured",
    tone: "mist",
    icon: "smartphone",
    eyebrow: "Featured",
    title: "Dead charging port? Fixed at home.",
    body: "Same-week slots for phone repairs.",
    price: "From ₹1,299",
    cta: { label: "Book mobile repair", href: "/book/phone-charging-port-repair" },
  },
];
