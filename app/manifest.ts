import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "smash.watch",
    short_name: "smash.watch",
    description:
      "Smash Watch — weighted win rate vs opponent strength, state snapshots, and tournament filters.",
    start_url: "/dashboard",
    scope: "/dashboard/",
    display: "standalone",
    background_color: "#060910",
    theme_color: "#060910",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
