import Link from "next/link";

const gymSections = [
  {
    title: "House of Power",
    href: "/house-of-power",
    icon: "🏛️",
    desc: "Goals, accountability check-ins, and daily wins.",
    links: [
      { label: "Goals", href: "/house-of-power/goals" },
      { label: "Check-In Log", href: "/house-of-power/accountability" },
    ],
  },
  {
    title: "Strength Collective",
    href: "/strength-collective",
    icon: "💪",
    desc: "Workout logging, PRs, volume, and body composition.",
    links: [
      { label: "Log Workout", href: "/strength-collective/workouts" },
      { label: "Progress", href: "/strength-collective/progress" },
    ],
  },
  {
    title: "PowerSource",
    href: "/powersource",
    icon: "⚡",
    desc: "Energy tracking, nutrition macros, sleep & recovery.",
    links: [
      { label: "Nutrition", href: "/powersource/nutrition" },
      { label: "Recovery", href: "/powersource/recovery" },
    ],
  },
];

const supportSections = [
  {
    title: "GrayRevenue",
    href: "/gray-revenue",
    icon: "💰",
    desc: "Revenue streams & projections.",
    color: "#8ACDD4",
  },
  {
    title: "Health Monitor",
    href: "/health-monitor",
    icon: "❤️",
    desc: "Vitals, sleep detail & metrics.",
    color: "#B0E0E6",
  },
];

export default function Home() {
  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#7a8a95" }}>
          Welcome back
        </p>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: "#B0E0E6" }}>
          Accountability Dashboard
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#9aa5b0" }}>
          Dark Wolf Gray · Powder Blue · Built to perform.
        </p>
      </div>

      {/* THE GYMS */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#B0E0E6" }}>
            ⚡ The Gyms
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(176,224,230,0.2)" }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {gymSections.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="group rounded-xl p-6 space-y-4 block hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: "#36393F",
                border: "1px solid rgba(176,224,230,0.15)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{s.icon}</span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: "rgba(176,224,230,0.12)", color: "#B0E0E6" }}
                >
                  Active
                </span>
              </div>

              <div>
                <h2 className="font-bold text-base" style={{ color: "#B0E0E6" }}>
                  {s.title}
                </h2>
                <p className="text-xs mt-1" style={{ color: "#9aa5b0" }}>
                  {s.desc}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {s.links.map((l) => (
                  <span
                    key={l.label}
                    className="text-xs px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: "#2C2F33", color: "#8ACDD4" }}
                  >
                    {l.label}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* STRONGMAN HEALTH MONITOR CARD */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#7a8a95" }}>
            Command Center
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#36393F" }} />
        </div>

        <div
          className="rounded-xl p-6 space-y-5"
          style={{
            background: "linear-gradient(135deg, #23262A 0%, #2C2F33 50%, #1e2428 100%)",
            border: "1px solid #B0E0E6",
          }}
        >
          {/* Title */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#7a8a95" }}>
                Strongman
              </p>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: "#B0E0E6" }}>
                Health Monitor
              </h2>
              <p className="text-sm mt-1" style={{ color: "#9aa5b0" }}>
                Cardiovascular · Metabolic · Musculoskeletal
              </p>
            </div>
            <span className="text-4xl">❤️</span>
          </div>

          {/* Body system scores */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { system: "Cardiovascular", score: 88, icon: "❤️" },
              { system: "Metabolic",      score: 82, icon: "⚡" },
              { system: "Musculoskeletal",score: 74, icon: "💪" },
            ].map((s) => (
              <div
                key={s.system}
                className="rounded-lg p-3 text-center space-y-1"
                style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
              >
                <p className="text-xs" style={{ color: "#7a8a95" }}>{s.icon} {s.system}</p>
                <p
                  className="text-2xl font-black"
                  style={{
                    color: s.score >= 85 ? "#B0E0E6" : s.score >= 70 ? "#8ACDD4" : "#e6c87a",
                  }}
                >
                  {s.score}
                </p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#23262A" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.score}%`,
                      backgroundColor: s.score >= 85 ? "#B0E0E6" : s.score >= 70 ? "#8ACDD4" : "#e6c87a",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Key vitals strip */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Resting HR",  value: "58 bpm" },
              { label: "HRV",         value: "62 ms" },
              { label: "Blood Press", value: "118/76" },
              { label: "O2 Sat",      value: "98%" },
            ].map((v) => (
              <div key={v.label} className="text-center">
                <p className="text-xs mb-0.5" style={{ color: "#7a8a95" }}>{v.label}</p>
                <p className="text-sm font-bold" style={{ color: "#B0E0E6" }}>{v.value}</p>
              </div>
            ))}
          </div>

          <Link
            href="/health-monitor"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
          >
            Open Health Monitor →
          </Link>
        </div>
      </div>

      {/* Support sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {supportSections.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="rounded-xl p-5 flex items-center gap-4 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
          >
            <span className="text-3xl">{s.icon}</span>
            <div>
              <h3 className="font-bold text-sm" style={{ color: s.color }}>{s.title}</h3>
              <p className="text-xs mt-0.5" style={{ color: "#9aa5b0" }}>{s.desc}</p>
            </div>
            <span className="ml-auto" style={{ color: "#7a8a95" }}>›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
