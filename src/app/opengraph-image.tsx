import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name} — ${profile.role}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090b",
          padding: "72px 80px",
          color: "#edeef0",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8a8f98",
          }}
        >
          {profile.location} — open to {profile.relocation.summary}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, letterSpacing: -4 }}>
            {profile.name}
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 40, color: "#8a8f98" }}>
            {profile.role}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", width: 56, height: 6, background: "#4cc9f0" }} />
          <div style={{ display: "flex", fontSize: 26, color: "#5a5f68", letterSpacing: 2 }}>
            {profile.disciplines.join("  ·  ")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
