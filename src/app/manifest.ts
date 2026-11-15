import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prime Taco Shop",
    short_name: "Prime Taco Shop",
    description: "Order tri-tip tacos and burritos from Prime Taco Shop locations.",
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
