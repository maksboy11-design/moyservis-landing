/**
 * Smooth scroll to hash target with sticky-header offset.
 * Native only — no scroll libraries (tech-stack).
 */
export function getHeaderOffset(): number {
  if (typeof document === "undefined") return 80;

  const header = document.querySelector<HTMLElement>("header.site-header");
  if (header) {
    const height = header.getBoundingClientRect().height;
    if (height > 0) return height;
  }

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();

  if (raw.endsWith("rem")) {
    const rem = Number.parseFloat(raw);
    const root = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    if (Number.isFinite(rem) && Number.isFinite(root)) return rem * root;
  }

  if (raw.endsWith("px")) {
    const px = Number.parseFloat(raw);
    if (Number.isFinite(px)) return px;
  }

  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 80;
}

export function scrollToHash(
  hash: string,
  options?: { behavior?: ScrollBehavior; updateHash?: boolean },
): boolean {
  const id = getHashId(hash) ?? (hash.startsWith("#") ? hash.slice(1) : hash);
  if (!id || id.includes("/")) return false;

  const target = document.getElementById(id);
  if (!target) return false;

  const behavior =
    options?.behavior ??
    (window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth");

  const top =
    target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();

  window.scrollTo({ top: Math.max(0, top), behavior });

  if (options?.updateHash !== false) {
    history.replaceState(null, "", `#${id}`);
  }

  return true;
}

export function isHashHref(href: string): boolean {
  return href.startsWith("#") && href.length > 1;
}

/** `/#section` or `#section` → section id; otherwise null */
export function getHashId(href: string): string | null {
  if (isHashHref(href)) return href.slice(1);

  if (href.startsWith("/#") && href.length > 2) {
    return href.slice(2);
  }

  return null;
}
