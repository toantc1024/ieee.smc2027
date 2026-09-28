import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Cache official logo as base64 data URI for instant rendering
let cachedLogoBase64: string | null = null;

function getOfficialLogoBase64(): string {
  if (cachedLogoBase64 !== null) {
    return cachedLogoBase64;
  }
  try {
    const logoPath = path.join(
      process.cwd(),
      "public",
      "logo",
      "ieee-smc-2027-logo-group-transparent.png"
    );
    if (fs.existsSync(logoPath)) {
      const buffer = fs.readFileSync(logoPath);
      cachedLogoBase64 = `data:image/png;base64,${buffer.toString("base64")}`;
      return cachedLogoBase64;
    }
  } catch (err) {
    console.error("Failed to load official logo for OG route:", err);
  }
  cachedLogoBase64 = "";
  return "";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "IEEE SMC 2027 • Ho Chi Minh City, Vietnam";
  const description =
    searchParams.get("description") ||
    "The 2027 IEEE International Conference on Systems, Man, and Cybernetics. October 6–10, 2027 • Ho Chi Minh City, Vietnam. Theme: Human-Centric Intelligence: Shaping the Digital Future.";
  const badge = searchParams.get("badge") || "FLAGSHIP CONFERENCE";
  const cover = searchParams.get("cover");

  const titleSize = title.length > 60 ? 38 : title.length > 40 ? 44 : 52;
  const logoBase64 = getOfficialLogoBase64();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          backgroundColor: "#ffffff",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Subtle Royal Blue Dot Pattern in Top-Right */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: "550px",
            width: "300px",
            height: "220px",
            display: "flex",
            backgroundImage: "radial-gradient(#115eff 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
            opacity: 0.25,
          }}
        />

        {/* 1. Left Content Column */}
        <div
          style={{
            width: "640px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 48px",
            boxSizing: "border-box",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Official IEEE SMC 2027 Logo Lockup */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {logoBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoBase64}
                alt="IEEE SMC 2027"
                style={{
                  height: "54px",
                  width: "309px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "#004776",
                  letterSpacing: "-0.02em",
                }}
              >
                IEEE SMC 2027
              </span>
            )}
          </div>

          {/* Main Title & Narrative Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              flex: 1,
              paddingTop: "24px",
              paddingBottom: "24px",
            }}
          >
            {/* Category Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                borderRadius: "6px",
                backgroundColor: "rgba(17, 94, 255, 0.08)",
                border: "1px solid rgba(17, 94, 255, 0.2)",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  color: "#115eff",
                  textTransform: "uppercase",
                }}
              >
                {badge}
              </span>
            </div>

            {/* High-Impact Main Title */}
            <div
              style={{
                fontSize: `${titleSize}px`,
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "#004776",
                display: "flex",
                marginBottom: "16px",
              }}
            >
              {title}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: 1.45,
                color: "#475569",
                display: "flex",
                maxWidth: "540px",
              }}
            >
              {description.length > 180 ? `${description.slice(0, 180)}...` : description}
            </div>
          </div>

          {/* Bottom Conference Metadata Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              paddingTop: "16px",
              borderTop: "1px solid #e2e8f0",
              fontSize: "13px",
              fontWeight: 600,
              color: "#004776",
            }}
          >
            <span style={{ color: "#115eff" }}>October 6–10, 2027</span>
            <span style={{ color: "#cbd5e1" }}>•</span>
            <span>Ho Chi Minh City, Vietnam</span>
            <span style={{ color: "#cbd5e1" }}>•</span>
            <span style={{ color: "#64748b" }}>Sheraton Saigon</span>
          </div>
        </div>

        {/* 2. Right Floating Card (HCMUTE Blue Glass Showcase Card) */}
        <div
          style={{
            width: "510px",
            height: "586px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px",
            boxSizing: "border-box",
            backgroundColor: "#115eff",
            borderRadius: "28px",
            position: "absolute",
            top: "22px",
            right: "24px",
            overflow: "hidden",
            boxShadow:
              "-16px 0 40px -8px rgba(0, 24, 68, 0.28), 0 16px 40px -10px rgba(17, 94, 255, 0.35)",
          }}
        >
          {cover ? (
            /* Cover Image Mode */
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "510px",
                height: "586px",
                display: "flex",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "510px",
                  height: "586px",
                  display: "flex",
                  background:
                    "linear-gradient(to top, rgba(0, 34, 68, 0.95) 0%, rgba(17, 94, 255, 0.3) 50%, rgba(0, 0, 0, 0.1) 100%)",
                }}
              />
            </div>
          ) : (
            /* Decorative Futuristic Conference Visual */
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "510px",
                height: "586px",
                display: "flex",
                background:
                  "radial-gradient(circle at 80% 20%, #3b82f6 0%, #115eff 45%, #004776 100%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px)",
                  backgroundSize: "24px 24px",
                  opacity: 0.3,
                }}
              />
            </div>
          )}

          {/* Top of Card: IEEE Badge */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "9999px",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 700,
                backdropFilter: "blur(8px)",
              }}
            >
              <span>IEEE SMC SOCIETY</span>
            </div>

            <div
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1px",
              }}
            >
              2027
            </div>
          </div>

          {/* Bottom of Card: Theme & Host branding */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
              }}
            >
              Human-Centric Intelligence
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
                lineHeight: 1.4,
              }}
            >
              Shaping the Digital Future in Ho Chi Minh City
            </div>
            <div
              style={{
                marginTop: "12px",
                paddingTop: "14px",
                borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                fontSize: "12px",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              ieee-smc2027.org
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
