import type { MetadataRoute } from "next";

/**
 * Web app manifest — makes Fixora installable and gives it a standalone
 * window on Android, desktop Chrome and iOS (via the meta tags in layout.tsx).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Fixora — home repair booking",
    short_name: "Fixora",
    description:
      "Book home repairs with clear estimates, technician progress and support in one place. A frontend demo running on fictional data.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f7fb",
    theme_color: "#143779",
    lang: "en-IN",
    dir: "ltr",
    categories: ["home", "lifestyle", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Browse services",
        short_name: "Services",
        url: "/services",
      },
      {
        name: "My bookings",
        short_name: "Bookings",
        url: "/bookings",
      },
    ],
  };
}
