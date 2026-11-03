/**
 * Decorative hero illustration: a geometric house with a wrench and an
 * approval check — the product's promise (repair work you approve) drawn as
 * one simple mark. Purely decorative, so it is hidden from assistive tech.
 */
export function HeroArt({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 420 360"
      fill="none"
      className={className}
    >
      <circle cx="228" cy="176" r="150" fill="white" fillOpacity="0.05" />
      <circle
        cx="228"
        cy="176"
        r="112"
        stroke="white"
        strokeOpacity="0.16"
        strokeDasharray="4 8"
      />

      {/* House */}
      <g stroke="white" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M110 172 228 84l118 88" strokeOpacity="0.92" />
        <path d="M138 168v104h180V168" strokeOpacity="0.55" />
        <path d="M196 272v-58h64v58" strokeOpacity="0.55" />
        <path d="M162 200h34v34h-34z" strokeOpacity="0.35" />
      </g>

      {/* Approval badge */}
      <circle cx="308" cy="212" r="26" fill="#FF8A34" />
      <path
        d="m297 212 7.5 8 13-15"
        stroke="#143779"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Wrench */}
      <g
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      >
        <path d="M96 268c-18-18-6-44 12-46l14 14 12-8-3-18c18-12 40 0 38 20l-30 30c-20 4-32 14-43 8Z" />
        <path d="m112 244 26 26" />
      </g>
    </svg>
  );
}
