import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Crack Taco Shop San Diego",
    short_name: "Crack Taco Shop",
    description: "Order tri-tip tacos and burritos from Crack Taco Shop locations.",
    start_url: "/",
    display: "standalone",
    background_color: "#090909",
    theme_color: "#f0be3e",
    icons: [
      {
        src: "/logo.png",
        sizes: "276x105",
        type: "image/png",
      },
    ],
  };
}
