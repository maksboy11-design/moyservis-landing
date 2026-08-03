import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6B2CF5",
          borderRadius: 8,
          color: "#C8FF00",
          fontSize: 20,
          fontWeight: 800,
        }}
      >
        М
      </div>
    ),
    { ...size },
  );
}
