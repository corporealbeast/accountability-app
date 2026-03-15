"use client";

import Link from "next/link";
import { Swords, Landmark, Dumbbell, Zap, BarChart2, Brain, FlaskConical, Crosshair, ArrowRight } from "lucide-react";

const cards = [
  {
    href: "/strongman-prep",
    icon: <Swords size={22} />,
    label: "Strongman Prep",
    desc: "California's Strongest Man — March 28",
    badge: "Active",
    badgeColor: "#4ade80",
    badgeBg: "#1e3a2f",
  },
  {
    href: "/house-of-power",
    icon: <Landmark size={22} />,
    label: "House of Power",
    desc: "Goals, accountability, daily check-ins",
    badge: "7 active goals",
    badgeColor: "#B0E0E6",
    badgeBg: "rgba(176,224,230,0.12)",
  },
  {
    href: "/strength-collective",
    icon: <Dumbbell size={22} />,
    label: "Strength Collective",
    desc: "Workouts, PRs, volume tracking",
    badge: "3 / 5 this week",
    badgeColor: "#B0E0E6",
    badgeBg: "rgba(176,224,230,0.12)",
  },
  {
    href: "/powersource",
    icon: <Zap size={22} />,
    label: "PowerSource",
    desc: "Nutrition, energy, recovery",
    badge: "2,840 kcal today",
    badgeColor: "#B0E0E6",
    badgeBg: "rgba(176,224,230,0.12)",
  },
  {
    href: "/gray-revenue",
    icon: <BarChart2 size={22} />,
    label: "GrayRevenue",
    desc: "Revenue streams & projections",
    badge: "$7,240 MRR",
    badgeColor: "#8ACDD4",
    badgeBg: "rgba(138,205,212,0.12)",
  },
  {
    href: "/stack",
    icon: <FlaskConical size={22} />,
    label: "The Stack",
    desc: "Supplement tracker & Vald integration",
    badge: "10 supplements",
    badgeColor: "#20B2AA",
    badgeBg: "rgba(32,178,170,0.12)",
  },
  {
    href: "/precision-programming",
    icon: <Crosshair size={22} />,
    label: "Precision Programming",
    desc: "Athlete dashboard · Macrocycle planner",
    badge: "4 athletes",
    badgeColor: "#FFD700",
    badgeBg: "rgba(255,215,0,0.12)",
  },
  {
    href: "/vald",
    icon: <Brain size={22} />,
    label: "Vald Brain",
    desc: "Visual knowledge graph — 14 nodes",
    badge: "8 categories",
    badgeColor: "#9370DB",
    badgeBg: "rgba(147,112,219,0.15)",
  },
];

export default function Home() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "48px" }}>
        <p style={{ fontSize: "13px", color: "#7a8a95", marginBottom: "8px", margin: "0 0 8px" }}>
          Good morning
        </p>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "#B0E0E6",
            margin: "0 0 12px",
            letterSpacing: "-0.02em",
          }}
        >
          Home
        </h1>
      </div>

      {/* Strongman callout */}
      <Link
        href="/strongman-prep"
        style={{
          display: "block",
          background: "linear-gradient(135deg, #23262A 0%, #2a2e32 100%)",
          border: "1px solid #B0E0E6",
          borderRadius: "10px",
          padding: "24px 28px",
          marginBottom: "32px",
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "32px" }}>🏆</span>
            <div>
              <div style={{ fontSize: "11px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
                Active Competition Prep
              </div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#B0E0E6" }}>
                California&apos;s Strongest Man
              </div>
              <div style={{ fontSize: "14px", color: "#9aa5b0", marginTop: "4px" }}>
                March 28 · Weight: 260–270 lbs · Monitoring Adductor/Gracilis Strain
              </div>
            </div>
          </div>
          <ArrowRight size={20} color="#B0E0E6" style={{ flexShrink: 0 }} />
        </div>
      </Link>

      {/* Section label */}
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#7a8a95",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "12px",
        }}
      >
        All Sections
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            style={{
              display: "block",
              backgroundColor: "#36393F",
              border: "1px solid #2C2F33",
              borderRadius: "10px",
              padding: "20px",
              textDecoration: "none",
              transition: "border-color 0.15s, background-color 0.15s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#B0E0E6";
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#3a3d42";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#2C2F33";
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#36393F";
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#B0E0E6" }}>{card.icon}</span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  borderRadius: "20px",
                  backgroundColor: card.badgeBg,
                  color: card.badgeColor,
                  fontWeight: 500,
                }}
              >
                {card.badge}
              </span>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#B0E0E6", marginBottom: "4px" }}>
              {card.label}
            </div>
            <div style={{ fontSize: "13px", color: "#9aa5b0" }}>{card.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
