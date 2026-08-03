import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#121212",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 12,
            background: "#C8FF00",
            borderRadius: 999,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#FF4D00",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 36, color: "#FFFFFF", fontWeight: 600 }}>
            {siteConfig.tagline}
          </div>
          <div style={{ fontSize: 28, color: "#C8C8C8" }}>{siteConfig.city}</div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 280,
            height: 64,
            borderRadius: 999,
            background: "#C8FF00",
            color: "#111111",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          Сервисный центр
        </div>
      </div>
    ),
    { ...size },
  );
}
