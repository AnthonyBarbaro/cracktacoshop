import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = path.join(projectRoot, "public/images/food");
const photos = [
  ["1AD2901A-AA10-4802-B881-E4C233099CD7.JPG", "loaded-nachos-chip.webp"],
  ["2E8E2D9A-58C9-46AF-89C9-A661D05F7A4C.JPG", "loaded-nachos-guacamole.webp"],
  ["544B4939-68C8-4979-849C-BF2F51EB00CC.JPG", "loaded-fries-fork.webp"],
  ["6219DA65-8A54-4765-8940-BFFD95F2C263.JPG", "takeout-spread.webp"],
  ["IMG_2164.PNG", "tacos-blue-table.webp"],
  ["IMG_3154.PNG", "patio-burrito.webp"],
  ["IMG_6949.JPG", "loaded-tostada-lime.webp"],
  ["IMG_2164.PNG", "hero-tacos.webp", 2800, 86],
];

await mkdir(outputDirectory, { recursive: true });

for (const [sourceName, outputName, height = 1800, quality = 84] of photos) {
  const source = path.join(projectRoot, "public/new-", sourceName);
  const output = path.join(outputDirectory, outputName);
  const info = await sharp(source)
    .rotate()
    .resize({ width: 1600, height, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(output);

  console.log(JSON.stringify({
    source: `public/new-/${sourceName}`,
    output: `public/images/food/${outputName}`,
    width: info.width,
    height: info.height,
    bytes: info.size,
    sourceBytes: (await stat(source)).size,
  }));
}
