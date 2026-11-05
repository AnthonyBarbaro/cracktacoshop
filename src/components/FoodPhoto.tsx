import Image from "next/image";
import type { ReactElement } from "react";

import type { FoodPhoto as FoodPhotoData } from "@/data/food-photos";

import styles from "./FoodPhoto.module.css";

type Props = {
  photo: FoodPhotoData;
  sizes: string;
  priority?: boolean;
  unoptimized?: boolean;
  className?: string;
  onLoad?: () => void;
};

export default function FoodPhoto({ photo, sizes, priority = false, unoptimized = false, className = "", onLoad }: Props): ReactElement {
  const frame = photo.frame ?? photo;
  return (
    <div className={`${styles.frame} ${className}`} style={{ aspectRatio: `${frame.width} / ${frame.height}` }}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        onLoad={onLoad}
        className={styles.image}
        style={{ objectPosition: photo.frame?.position ?? "50% 50%" }}
      />
    </div>
  );
}
