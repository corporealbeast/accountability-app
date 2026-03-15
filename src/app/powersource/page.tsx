import Link from "next/link";

const stats = [
  { label: "Avg Energy Score", value: "7.4", delta: "+0.6 vs last week", unit: "/ 10" },
  { label: "Calories Today", value: "2,840", delta: "Target: 2,900", unit: "kcal" },
  { label: "Sleep Last Night", value: "7.2", delta: "Goal: 8h", unit: "hrs" },
  { label: "Recovery Score", value: "81%", delta: "+4% vs yesterday", unit: "" },
];

const energyLog = [
  { time: "6:00 AM", score: 8, note: "Woke up refreshed. Cold shower." },
  { time: "9:00 AM", score: 9, note: "Peak focus. Deep work session." },
  { time: "12:00 PM", score: 7, note: "Post-lunch slight dip." },
  { time: "3:00 PM", score: 6, note: "Afternoon slump. Took a walk." },
  { time: "6:00 PM", score: 8, note: "Post-workout energy boost." },
  { time: "9:00 PM", score: 6, note: "Winding down." },
];

const maxScore = 10;

export default function PowerSourcePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
          ⚡ PowerSource
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
          Energy, nutrition, and recovery — your daily fuel system.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-5 space-y-1"
            style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
          >
            <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: "#B0E0E6" }}>
              {s.value}
              {s.unit && <span className="text-sm font-normal ml-1" style={{ color: "#7a8a95" }}>{s.unit}</span>}
            </p>
            <p className="text-xs" style={{ color: "#8ACDD4" }}>{s.delta}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link
          href="/powersource/nutrition"
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
        >
          🥗 Log Nutrition
        </Link>
        <Link
          href="/powersource/recovery"
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#36393F", color: "#B0E0E6", border: "1px solid #B0E0E6" }}
        >
          🔄 Recovery Log
        </Link>
      </div>

      {/* Energy curve */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>
          Today&apos;s Energy Curve
        </p>
        <div className="flex items-end gap-3" style={{ height: "120px" }}>
          {energyLog.map((e) => {
            const h = Math.round((e.score / maxScore) * 100);
            const color = e.score >= 8 ? "#B0E0E6" : e.score >= 6 ? "#8ACDD4" : "#4a6a7a";
            return (
              <div key={e.time} className="flex flex-col items-center gap-1 flex-1 group relative">
                <span className="text-xs font-semibold" style={{ color }}>{e.score}</span>
                <div
                  className="w-full rounded-t transition-all"
                  style={{ height: `${h}%`, backgroundColor: color, minHeight: "6px" }}
                />
                <span className="text-xs" style={{ color: "#7a8a95" }}>{e.time.replace(":00", "")}</span>
              </div>
            );
          })}
        </div>
        <div className="space-y-1 pt-1 border-t" style={{ borderColor: "#2C2F33" }}>
          {energyLog.map((e) => (
            <div key={e.time} className="flex gap-3 text-xs">
              <span className="shrink-0 w-16" style={{ color: "#7a8a95" }}>{e.time}</span>
              <span style={{ color: "#9aa5b0" }}>{e.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Macro ring summary */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#7a8a95" }}>
          Today&apos;s Macros
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Protein", current: 198, goal: 220, unit: "g", color: "#B0E0E6" },
            { label: "Carbs", current: 290, goal: 350, unit: "g", color: "#8ACDD4" },
            { label: "Fat", current: 82, goal: 90, unit: "g", color: "#7a8a95" },
          ].map((m) => {
            const pct = Math.round((m.current / m.goal) * 100);
            return (
              <div key={m.label} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#9aa5b0" }}>{m.label}</span>
                  <span style={{ color: m.color }}>{m.current}/{m.goal}{m.unit}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#23262A" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: m.color }}
                  />
                </div>
                <p className="text-xs text-right" style={{ color: "#7a8a95" }}>{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
