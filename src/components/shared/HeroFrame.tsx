"use client";

import Image from "next/image";
import type { HTMLAttributes } from "react";
import { BrandSpark } from "@/components/shared/BrandSpark";
import { cn } from "@/lib/cn";

export type HeroFrameMedia = {
  src: string;
  srcMobile?: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
};

export type HeroFrameProps = HTMLAttributes<HTMLDivElement> & {
  media: HeroFrameMedia;
  caption: string;
  brand: string;
  titleId?: string;
  /** Accessible page title */
  title: string;
  brandStackCount?: number;
  priority?: boolean;
};

/**
 * Accent visual block — rounded media, caption pill, brand tab (refs).
 */
export function HeroFrame({
  media,
  caption,
  brand,
  title,
  titleId = "hero-heading",
  brandStackCount = 6,
  priority = true,
  className,
  ...props
}: HeroFrameProps) {
  const stack = Array.from({ length: brandStackCount }, (_, i) => i);
  const titleSuffix = title.includes("—")
    ? title.slice(title.indexOf("—") + 1).trim()
    : title;

  return (
    <div className={cn("hero-frame", className)} {...props}>
      <div className="hero-frame__media">
        {media.srcMobile ? (
          <Image
            src={media.srcMobile}
            alt={media.alt}
            fill
            priority={priority}
            sizes="100vw"
            placeholder={media.blurDataURL ? "blur" : "empty"}
            blurDataURL={media.blurDataURL}
            className="object-cover lg:hidden"
          />
        ) : null}
        <Image
          src={media.src}
          alt={media.srcMobile ? "" : media.alt}
          fill
          priority={priority}
          sizes="(max-width: 1023px) 100vw, min(100vw, 1400px)"
          placeholder={media.blurDataURL ? "blur" : "empty"}
          blurDataURL={media.blurDataURL}
          className={cn(
            "object-cover",
            media.srcMobile && "max-lg:hidden",
          )}
          aria-hidden={media.srcMobile ? true : undefined}
        />
      </div>

      <div className="hero-frame__shade" aria-hidden />

      <p className="hero-frame__caption">{caption}</p>

      <div className="hero-frame__brand">
        <div className="hero-frame__brand-tab">
          <div className="hero-frame__brand-stack lg:hidden" aria-hidden>
            {stack.map((index) => (
              <span key={index}>{brand}</span>
            ))}
          </div>

          <h1 id={titleId} className="hero-frame__title max-lg:sr-only">
            {brand}
            <span className="sr-only"> — {titleSuffix}</span>
          </h1>
        </div>

        <BrandSpark />
      </div>
    </div>
  );
}
