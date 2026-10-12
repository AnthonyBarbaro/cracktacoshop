import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prime Tacos",
    short_name: "Prime Tacos",
    description: "Order tri-tip tacos and burritos from Prime Tacos locations.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f7f1",
    theme_color: "#173d2c",
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
