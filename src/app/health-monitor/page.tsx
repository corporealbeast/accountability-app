import Link from "next/link";

const vitals = [
  { label: "Resting HR", value: "58", unit: "bpm", delta: "Excellent", status: "good" },
  { label: "Blood Pressure", value: "118/76", unit: "mmHg", delta: "Optimal", status: "good" },
  { label: "HRV", value: "62", unit: "ms", delta: "+8 vs last week", status: "good" },
  { label: "O2 Saturation", value: "98", unit: "%", delta: "Normal", status: "good" },
];

const weeklyChecks = [
  { label: "Water Intake", current: 2.8, goal: 3.5, unit: "L", emoji: "💧" },
  { label: "Steps", current: 8400, goal: 10000, unit: "steps", emoji: "🚶" },
  { label: "Active Minutes", current: 52, goal: 60, unit: "min", emoji: "⚡" },
  { label: "Standing Hours", current: 7, goal: 10, unit: "hrs", emoji: "🧍" },
];

const recentAlerts = [
  { type: "info", message: "HRV trending up — recovery improving", time: "Today" },
  { type: "warn", message: "Steps below goal 3 days in a row", time: "Yesterday" },
  { type: "info", message: "Blood pressure check logged", time: "Mar 12" },
  { type: "good", message: "7-day avg sleep: 7.5h — on target", time: "Mar 11" },
];

const alertColors: Record<string, string> = {
  info: "#8ACDD4",
  warn: "#e6c87a",
  good: "#4ade80",
};

const statusColor = (s: string) => (s === "good" ? "#B0E0E6" : s === "warn" ? "#e6c87a" : "#9aa5b0");

export default function HealthMonitorPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
          ❤️ Health Monitor
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
          Vitals, daily health habits, and long-term metrics.
        </p>
      </div>

      {/* Vitals grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {vitals.map((v) => (
          <div
            key={v.label}
            className="rounded-xl p-5 space-y-1"
            style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
          >
            <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>{v.label}</p>
            <p className="text-2xl font-bold" style={{ color: statusColor(v.status) }}>
              {v.value}
              <span className="text-sm font-normal ml-1" style={{ color: "#7a8a95" }}>{v.unit}</span>
            </p>
            <p className="text-xs" style={{ color: "#8ACDD4" }}>{v.delta}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link
          href="/health-monitor/metrics"
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
        >
          📉 Log Metrics
        </Link>
        <Link
          href="/health-monitor/sleep"
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#36393F", color: "#B0E0E6", border: "1px solid #B0E0E6" }}
        >
          😴 Sleep Detail
        </Link>
      </div>

      {/* Daily habit progress */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>Today&apos;s Habits</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {weeklyChecks.map((c) => {
            const pct = Math.min(Math.round((c.current / c.goal) * 100), 100);
            const done = c.current >= c.goal;
            return (
              <div key={c.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "#9aa5b0" }}>{c.emoji} {c.label}</span>
                  <span style={{ color: done ? "#4ade80" : "#B0E0E6" }}>
                    {c.current.toLocaleString()} / {c.goal.toLocaleString()} {c.unit}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#23262A" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: done ? "#4ade80" : "#B0E0E6" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts / insights */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#7a8a95" }}>
          Insights & Alerts
        </h2>
        <div
          className="rounded-xl divide-y overflow-hidden"
          style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
        >
          {recentAlerts.map((a, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4">
              <span
                className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                style={{ backgroundColor: alertColors[a.type] }}
              />
              <p className="flex-1 text-sm" style={{ color: "#9aa5b0" }}>{a.message}</p>
              <span className="text-xs shrink-0" style={{ color: "#7a8a95" }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body system summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { system: "Cardiovascular", score: 88, icon: "❤️", notes: "HR and BP optimal. HRV improving." },
          { system: "Metabolic", score: 82, icon: "⚡", notes: "BF% trending down. Energy stable." },
          { system: "Musculoskeletal", score: 74, icon: "💪", notes: "Some tightness in quads. Stretch more." },
        ].map((s) => (
          <div
            key={s.system}
            className="rounded-xl p-5 space-y-3"
            style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">{s.icon}</span>
              <span className="text-xl font-bold" style={{ color: s.score >= 85 ? "#B0E0E6" : s.score >= 70 ? "#8ACDD4" : "#e6c87a" }}>
                {s.score}
              </span>
            </div>
            <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>{s.system}</p>
            <p className="text-xs" style={{ color: "#9aa5b0" }}>{s.notes}</p>
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
    </div>
  );
}
