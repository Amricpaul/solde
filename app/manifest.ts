import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Solde — Personal Finance",
    short_name: "Solde",
    description: "Track income, expenses, and budgets with a clear at-a-glance dashboard.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFCF2",
    theme_color: "#FFFCF2",
    categories: ["finance", "productivity"],
    icons: [
      { src: "/android-icon-96x96.png", sizes: "96x96", type: "image/png" },
      { src: "/android-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { src: "/android-icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      // Scalable source covers larger sizes (e.g. the 512 install icon) since no PNG ≥512 was provided.
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
