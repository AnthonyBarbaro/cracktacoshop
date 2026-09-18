import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prime Tacos",
    short_name: "Prime Tacos",
    description: "Order tri-tip tacos and burritos from Prime Tacos locations.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e21c2a",
    icons: [
      {
        src: "/newlogo.png",
        sizes: "3822x2378",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
