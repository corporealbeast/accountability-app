"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Clock, Dumbbell, Zap, Users, Star, ChevronRight, Menu } from "lucide-react";

// ── Design tokens ──────────────────────────────────────────────────────────────
// Swap these once brand kit is delivered
const C = {
  bg: "#0D0D0F",
  bgAlt: "#111115",
  bgCard: "#18181C",
  bgCardHover: "#1E1E23",
  white: "#F5F5F5",
  muted: "#9AA5B0",
  dim: "#5A6470",
  // Track A — Open Gym (placeholder accent — swap to brand primary)
  accentA: "#E84A10",
  accentADim: "rgba(232,74,16,0.12)",
  accentABorder: "rgba(232,74,16,0.3)",
  // Track B — Sports Performance (placeholder — swap if brand has secondary)
  accentB: "#B0E0E6",
  accentBDim: "rgba(176,224,230,0.1)",
  accentBBorder: "rgba(176,224,230,0.25)",
  border: "#252528",
  borderLight: "#2E2E34",
};

// ── Reusable pieces ─────────────────────────────────────────────────────────────

function GHLPlaceholder({ label, note }: { label: string; note?: string }) {
  return (
    <div
      style={{
        border: "2px dashed rgba(74,222,128,0.3)",
        borderRadius: "12px",
        padding: "48px 32px",
        textAlign: "center",
        backgroundColor: "rgba(74,222,128,0.04)",
      }}
    >
      <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#4ade80", marginBottom: "8px" }}>
        GHL EMBED PLACEHOLDER
      </div>
      <div style={{ fontSize: "18px", fontWeight: 600, color: C.white, marginBottom: "6px" }}>{label}</div>
      {note && <div style={{ fontSize: "13px", color: C.dim }}>{note}</div>}
      <div style={{ marginTop: "20px", fontSize: "12px", color: "rgba(74,222,128,0.6)" }}>
        Paste embed code here → goes live instantly
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-block",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        color: C.accentB,
        marginBottom: "16px",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function TestimonialCard({ quote, name, role, stars = 5 }: { quote: string; name: string; role: string; stars?: number }) {
  return (
    <div
      style={{
        backgroundColor: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        padding: "28px",
        flex: 1,
      }}
    >
      <div style={{ display: "flex", gap: "3px", marginBottom: "16px" }}>
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} size={14} fill={C.accentA} color={C.accentA} />
        ))}
      </div>
      <p style={{ fontSize: "14px", lineHeight: 1.7, color: C.muted, marginBottom: "20px" }}>"{quote}"</p>
      <div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: C.white }}>{name}</div>
        <div style={{ fontSize: "12px", color: C.dim }}>{role}</div>
      </div>
    </div>
  );
}

// ── Nav ────────────────────────────────────────────────────────────────────────

function SiteNav() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(13,13,15,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        height: "64px",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: C.accentA,
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Dumbbell size={18} color="#fff" />
        </div>
        <span style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "0.05em", color: C.white }}>
          HOUSE OF POWER
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: "28px" }}>
        {["Open Gym", "Sports Performance", "Memberships", "About", "Contact"].map((link) => (
          <a
            key={link}
            href="#"
            style={{ fontSize: "13px", color: C.muted, textDecoration: "none", fontWeight: 500 }}
          >
            {link}
          </a>
        ))}
      </div>

      {/* Dual CTAs */}
      <div style={{ display: "flex", gap: "10px" }}>
        <a
          href="#free-trial"
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 700,
            backgroundColor: C.accentA,
            color: "#fff",
            textDecoration: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Free Pass
        </a>
        <a
          href="#assessment"
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 700,
            backgroundColor: "transparent",
            color: C.accentB,
            textDecoration: "none",
            border: `1px solid ${C.accentBBorder}`,
            cursor: "pointer",
          }}
        >
          Book Assessment
        </a>
      </div>
    </nav>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "88vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#070709",
      }}
    >
      {/* Video background placeholder */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #070709 0%, #0f0c14 40%, #070709 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Subtle grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(176,224,230,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(176,224,230,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Video placeholder badge */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            border: "2px dashed rgba(74,222,128,0.2)",
            borderRadius: "12px",
            padding: "12px 24px",
            color: "rgba(74,222,128,0.4)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          HERO VIDEO BACKGROUND
          <br />
          <span style={{ fontSize: "10px", opacity: 0.6 }}>supply footage → drops in here</span>
        </div>
      </div>

      {/* Dark gradient overlays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(7,7,9,0.85) 0%, rgba(7,7,9,0.4) 50%, rgba(7,7,9,0.7) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "200px",
          background: "linear-gradient(to top, #0D0D0F, transparent)",
        }}
      />

      {/* Hero content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          maxWidth: "800px",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: C.accentA,
            marginBottom: "20px",
            textTransform: "uppercase",
          }}
        >
          [City] · Est. [Year]
        </div>

        <h1
          style={{
            fontSize: "clamp(40px, 6vw, 76px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: C.white,
            margin: "0 0 20px",
          }}
        >
          BUILT FOR THE ONES
          <br />
          <span style={{ color: C.accentA }}>WHO SHOW UP.</span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: C.muted,
            lineHeight: 1.6,
            marginBottom: "36px",
            maxWidth: "520px",
            margin: "0 auto 36px",
          }}
        >
          Two paths. One facility. Whether you're here to train hard or compete harder — this is your gym.
        </p>

        {/* Dual CTA */}
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#free-trial"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "16px 32px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 800,
              backgroundColor: C.accentA,
              color: "#fff",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            <Dumbbell size={18} />
            Claim Free Pass
          </a>
          <a
            href="#assessment"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "16px 32px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 800,
              backgroundColor: "transparent",
              color: C.accentB,
              textDecoration: "none",
              letterSpacing: "0.02em",
              border: `1.5px solid ${C.accentB}`,
            }}
          >
            <Zap size={18} />
            Book Athletic Assessment
          </a>
        </div>

        {/* Trust badges */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            justifyContent: "center",
            marginTop: "40px",
            flexWrap: "wrap",
          }}
        >
          {["24/7 Access", "No Contracts", "Cancel Anytime", "[City], [State]"].map((badge) => (
            <div key={badge} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: C.accentA }} />
              <span style={{ fontSize: "12px", color: C.dim, fontWeight: 500 }}>{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Two Tracks ─────────────────────────────────────────────────────────────────

function TwoTracks() {
  const gymFeatures = [
    "State-of-the-art equipment",
    "24/7 unrestricted access",
    "Unlimited classes included",
    "No long-term contracts",
  ];
  const perfFeatures = [
    "Custom athletic programming",
    "Sport-specific strength & speed",
    "Expert performance coaches",
    "Athlete assessment & goal mapping",
  ];

  return (
    <section style={{ backgroundColor: C.bgAlt, padding: "96px 40px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <SectionLabel>Two Paths. One Facility.</SectionLabel>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 800,
              color: C.white,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Which path is yours?
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Track A — Open Gym */}
          <div
            style={{
              backgroundColor: C.bgCard,
              border: `1px solid ${C.accentABorder}`,
              borderRadius: "16px",
              padding: "40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                backgroundColor: C.accentA,
              }}
            />
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "999px",
                backgroundColor: C.accentADim,
                border: `1px solid ${C.accentABorder}`,
                fontSize: "11px",
                fontWeight: 700,
                color: C.accentA,
                letterSpacing: "0.08em",
                marginBottom: "24px",
              }}
            >
              <Dumbbell size={11} />
              FOR MEMBERS
            </div>

            <h3
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: C.white,
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              Open Gym Access
            </h3>
            <p style={{ fontSize: "14px", color: C.muted, lineHeight: 1.7, marginBottom: "28px" }}>
              Train when you want, how you want. Full access to premium equipment and a community that pushes you forward.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {gymFeatures.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: C.muted }}>
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      backgroundColor: C.accentADim,
                      border: `1px solid ${C.accentABorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: C.accentA }} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="#free-trial"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 700,
                backgroundColor: C.accentA,
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Claim Your Free Pass
              <ChevronRight size={16} />
            </a>
          </div>

          {/* Track B — Sports Performance */}
          <div
            style={{
              backgroundColor: C.bgCard,
              border: `1px solid ${C.accentBBorder}`,
              borderRadius: "16px",
              padding: "40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                backgroundColor: C.accentB,
              }}
            />
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "999px",
                backgroundColor: C.accentBDim,
                border: `1px solid ${C.accentBBorder}`,
                fontSize: "11px",
                fontWeight: 700,
                color: C.accentB,
                letterSpacing: "0.08em",
                marginBottom: "24px",
              }}
            >
              <Zap size={11} />
              FOR ATHLETES
            </div>

            <h3
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: C.white,
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              Sports Performance
            </h3>
            <p style={{ fontSize: "14px", color: C.muted, lineHeight: 1.7, marginBottom: "28px" }}>
              Serious results for serious athletes. Performance coaching built around your sport, your goals, your timeline.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {perfFeatures.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: C.muted }}>
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      backgroundColor: C.accentBDim,
                      border: `1px solid ${C.accentBBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: C.accentB }} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="#assessment"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 700,
                backgroundColor: "transparent",
                color: C.accentB,
                textDecoration: "none",
                border: `1.5px solid ${C.accentB}`,
              }}
            >
              Book Athletic Assessment
              <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Facility Highlights ────────────────────────────────────────────────────────

function FacilityHighlights() {
  const highlights = [
    {
      icon: <Dumbbell size={24} color={C.accentA} />,
      title: "Premium Equipment",
      desc: "Full free weight section, machines, cardio, and functional training space built for serious work.",
    },
    {
      icon: <Clock size={24} color={C.accentA} />,
      title: "24/7 Access",
      desc: "No restrictions. Early morning, late night, whenever you need it — the gym is open.",
    },
    {
      icon: <Zap size={24} color={C.accentA} />,
      title: "Performance Zone",
      desc: "Dedicated space for speed, agility, and sport-specific training separate from the main floor.",
    },
    {
      icon: <Users size={24} color={C.accentA} />,
      title: "Real Community",
      desc: "Members who take it seriously. Coaches who know your name. A culture built on showing up.",
    },
  ];

  return (
    <section style={{ backgroundColor: C.bg, padding: "96px 40px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "56px" }}>
          <SectionLabel>The Facility</SectionLabel>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 800,
              color: C.white,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Everything you need.
            <br />
            <span style={{ color: C.accentA }}>Nothing you don't.</span>
          </h2>
        </div>

        {/* Photo placeholder + feature grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Photo placeholder */}
          <div
            style={{
              border: "2px dashed rgba(74,222,128,0.2)",
              borderRadius: "16px",
              aspectRatio: "4/3",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(74,222,128,0.02)",
              gap: "8px",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(74,222,128,0.4)" }}>
              FACILITY PHOTO
            </div>
            <div style={{ fontSize: "11px", color: C.dim }}>supply photos → fills here</div>
          </div>

          {/* Feature cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {highlights.map((h) => (
              <div
                key={h.title}
                style={{
                  backgroundColor: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  padding: "20px 24px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    backgroundColor: C.accentADim,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {h.icon}
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: C.white, marginBottom: "4px" }}>{h.title}</div>
                  <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.6 }}>{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Free Trial Section ─────────────────────────────────────────────────────────

function FreeTrialSection() {
  return (
    <section id="free-trial" style={{ backgroundColor: C.bgAlt, padding: "96px 40px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
        <SectionLabel>Open Gym — Track A</SectionLabel>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 46px)",
            fontWeight: 800,
            color: C.white,
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
          }}
        >
          Claim Your Free Day Pass
        </h2>
        <p style={{ fontSize: "16px", color: C.muted, lineHeight: 1.7, marginBottom: "48px" }}>
          Come train for free. No credit card. No commitment. Just show up and see what House of Power is about.
        </p>

        {/* GHL Free Trial Form Embed */}
        <GHLPlaceholder
          label="Free Trial / Day Pass Form"
          note="Fields: First, Last, Email, Phone, SMS consent, Age 18+, Local residency"
        />

        <p style={{ fontSize: "12px", color: C.dim, marginTop: "20px" }}>
          After submitting → /thank-you-free-trial (instructions + optional GHL calendar booking)
        </p>
      </div>
    </section>
  );
}

// ── Assessment Section ─────────────────────────────────────────────────────────

function AssessmentSection() {
  return (
    <section id="assessment" style={{ backgroundColor: C.bg, padding: "96px 40px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          {/* Left — copy */}
          <div>
            <SectionLabel>Sports Performance — Track B</SectionLabel>
            <h2
              style={{
                fontSize: "clamp(26px, 3.5vw, 42px)",
                fontWeight: 800,
                color: C.white,
                margin: "0 0 16px",
                letterSpacing: "-0.02em",
              }}
            >
              Book Your Complimentary
              <br />
              <span style={{ color: C.accentB }}>Athletic Assessment</span>
            </h2>
            <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.7, marginBottom: "28px" }}>
              Sit down with a performance coach. Walk out with a clear picture of where you are, where you're going, and exactly how to get there.
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {[
                "Movement screen + athletic baseline",
                "Goal mapping & sport-specific review",
                "Custom program recommendation",
                "Zero sales pressure — 100% focused on you",
              ].map((item) => (
                <li key={item} style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "14px", color: C.muted }}>
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: C.accentB,
                      flexShrink: 0,
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — GHL form */}
          <div>
            <GHLPlaceholder
              label="Athletic Assessment Form"
              note="Sports Performance / Assessment — built in GHL"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ───────────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <section style={{ backgroundColor: C.bgAlt, padding: "96px 40px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <SectionLabel>Social Proof</SectionLabel>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 800,
              color: C.white,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Real people. Real results.
          </h2>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <TestimonialCard
            quote="I've been to a lot of gyms. This is different. The equipment is serious, the coaches actually know what they're talking about, and I've made more progress here in 3 months than I did anywhere else in a year."
            name="[Member Name]"
            role="Open Gym Member · [X] months"
          />
          <TestimonialCard
            quote="The athletic assessment was the turning point for me. They built a program that was specific to my sport and my weaknesses. I'm faster and stronger than I've ever been going into this season."
            name="[Athlete Name]"
            role="Sports Performance Client · [Sport]"
          />
          <TestimonialCard
            quote="Honestly didn't think I'd stick with it, but the community here makes it easy. People push each other and the coaches actually care. Worth every penny."
            name="[Member Name]"
            role="Open Gym Member · [X] months"
          />
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: C.dim, marginTop: "28px" }}>
          ↑ Replace with real testimonials — 3–6 recommended across both tracks
        </p>
      </div>
    </section>
  );
}

// ── Final CTA Strip ────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section
      style={{
        backgroundColor: "#070709",
        borderTop: `1px solid ${C.border}`,
        padding: "80px 40px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 52px)",
            fontWeight: 900,
            color: C.white,
            margin: "0 0 16px",
            letterSpacing: "-0.03em",
          }}
        >
          Your move.
        </h2>
        <p style={{ fontSize: "16px", color: C.muted, marginBottom: "40px" }}>
          Pick the path. Show up. The rest takes care of itself.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#free-trial"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "18px 36px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 800,
              backgroundColor: C.accentA,
              color: "#fff",
              textDecoration: "none",
            }}
          >
            <Dumbbell size={18} />
            Claim Your Free Pass
          </a>
          <a
            href="#assessment"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "18px 36px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 800,
              backgroundColor: "transparent",
              color: C.accentB,
              textDecoration: "none",
              border: `1.5px solid ${C.accentB}`,
            }}
          >
            <Zap size={18} />
            Book Athletic Assessment
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#070709",
        borderTop: `1px solid ${C.border}`,
        padding: "48px 40px 32px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px" }}>
          {/* Brand col */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: C.accentA,
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Dumbbell size={14} color="#fff" />
              </div>
              <span style={{ fontSize: "14px", fontWeight: 800, letterSpacing: "0.05em", color: C.white }}>
                HOUSE OF POWER
              </span>
            </div>
            <p style={{ fontSize: "13px", color: C.dim, lineHeight: 1.7, marginBottom: "16px" }}>
              [Tagline — enter in planner]
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Instagram", "Facebook", "TikTok"].map((s) => (
                <div
                  key={s}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    backgroundColor: C.bgCard,
                    border: `1px solid ${C.border}`,
                    fontSize: "11px",
                    color: C.dim,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.muted, marginBottom: "12px", letterSpacing: "0.08em" }}>
              TRAIN
            </div>
            {["Open Gym", "Sports Performance", "Personal Training", "Memberships"].map((l) => (
              <div key={l} style={{ fontSize: "13px", color: C.dim, marginBottom: "8px" }}>{l}</div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.muted, marginBottom: "12px", letterSpacing: "0.08em" }}>
              EXPLORE
            </div>
            {["About Us", "Gallery", "Events", "Careers"].map((l) => (
              <div key={l} style={{ fontSize: "13px", color: C.dim, marginBottom: "8px" }}>{l}</div>
            ))}
          </div>

          {/* Contact info */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.muted, marginBottom: "12px", letterSpacing: "0.08em" }}>
              VISIT US
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <MapPin size={13} color={C.dim} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: C.dim, lineHeight: 1.5 }}>[Address]<br />[City, State Zip]</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Phone size={13} color={C.dim} />
                <span style={{ fontSize: "13px", color: C.dim }}>[Phone]</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <Clock size={13} color={C.dim} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", color: C.dim, lineHeight: 1.5 }}>24/7 Member Access<br />Staff: [Hours]</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: C.dim }}>
            © {new Date().getFullYear()} House of Power. All rights reserved.
          </span>
          <span style={{ fontSize: "12px", color: C.dim }}>Privacy · Terms</span>
        </div>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function HOPSiteTemplate() {
  const router = useRouter();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflowY: "auto",
        backgroundColor: C.bg,
        color: C.white,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Template banner */}
      <div
        style={{
          backgroundColor: "rgba(14,28,14,0.95)",
          borderBottom: "1px solid rgba(74,222,128,0.2)",
          padding: "7px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 200,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#4ade80",
              boxShadow: "0 0 6px #4ade80",
            }}
          />
          <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: 600 }}>
            TEMPLATE PREVIEW — placeholder content · GHL embeds marked in green · brand colors TBD
          </span>
        </div>
        <button
          onClick={() => router.push("/webdev/house-of-power")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: "6px",
            padding: "5px 14px",
            color: "#4ade80",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={12} />
          Back to Planner
        </button>
      </div>

      {/* Site */}
      <SiteNav />
      <Hero />
      <TwoTracks />
      <FacilityHighlights />
      <FreeTrialSection />
      <AssessmentSection />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
