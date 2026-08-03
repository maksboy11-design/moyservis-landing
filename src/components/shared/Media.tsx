import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type MediaProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** object-fit mode */
  fit?: "cover" | "contain";
  /** Wrap in aspect frame (e.g. "16/9", "4/3") */
  aspect?: `${number}/${number}`;
  rounded?: boolean;
};

/**
 * Adaptive image — always max-width 100%, never overflows container.
 * Uses `.media-ds` / `.media-ds__frame` from responsive.css.
 */
export function Media({
  className,
  fit = "cover",
  aspect,
  rounded = true,
  alt = "",
  ...props
}: MediaProps) {
  const imgClass = cn(
    "media-ds",
    fit === "contain" && "media-ds--contain",
    !aspect && rounded && "rounded-[var(--image-radius)]",
    className,
  );

  if (!aspect) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- primitive; Next/Image at feature layer
      <img alt={alt} className={imgClass} loading="lazy" decoding="async" {...props} />
    );
  }

  return (
    <div
      className={cn(
        "media-ds__frame",
        rounded && "rounded-[var(--image-radius)]",
      )}
      style={{ aspectRatio: aspect.replace("/", " / ") }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- primitive; Next/Image at feature layer */}
      <img
        alt={alt}
        className={cn(imgClass, "absolute inset-0 size-full")}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
}
