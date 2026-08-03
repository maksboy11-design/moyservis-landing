import { Geologica, Manrope } from "next/font/google";

export const fontDisplay = Geologica({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geologica",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const fontBody = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const fontVariables = `${fontDisplay.variable} ${fontBody.variable}`;
