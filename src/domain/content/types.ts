/** Content domain shapes — filled on UI stages. */

export type NavItem = {
  label: string;
  href: string;
};

export type ServiceCardContent = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  mediaPosition: "top" | "bottom";
  icon?: "phone" | "laptop" | "chip";
};

export type TrustFactContent = {
  id: string;
  label: string;
  icon: "star" | "wrench" | "chip";
};
