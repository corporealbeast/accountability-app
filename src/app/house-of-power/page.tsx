import Link from "next/link";

const stats = [
  { label: "Active Goals", value: "7", delta: "+2 this week" },
  { label: "Completed", value: "12", delta: "+3 this month" },
  { label: "Streak", value: "14d", delta: "Personal best" },
  { label: "Accountability Score", value: "87%", delta: "+5% vs last week" },
];

const recentActivity = [
  { action: "Goal completed", detail: "Finish Q1 revenue plan", time: "2h ago", type: "success" },
  { action: "Check-in logged", detail: "Morning routine — Day 14", time: "5h ago", type: "info" },
  { action: "Goal updated", detail: "Workout 5x/week → progress 3/5", time: "Yesterday", type: "warning" },
  { action: "New goal added", detail: "Read 2 books per month", time: "2 days ago", type: "info" },
  { action: "Goal completed", detail: "Cold shower 30-day challenge", time: "3 days ago", type: "success" },
];

const typeColors: Record<string, string> = {
  success: "#B0E0E6",
  info: "#9aa5b0",
  warning: "#e6c87a",
};

export default function HouseOfPowerPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
          🏛️ House of Power
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
          Your command center for goals and accountability.
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
            <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>
              {s.label}
            </p>
            <p className="text-3xl font-bold" style={{ color: "#B0E0E6" }}>
              {s.value}
            </p>
            <p className="text-xs" style={{ color: "#8ACDD4" }}>
              {s.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link
          href="/house-of-power/goals"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
        >
          🎯 Manage Goals
        </Link>
        <Link
          href="/house-of-power/accountability"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#36393F", color: "#B0E0E6", border: "1px solid #B0E0E6" }}
        >
          📋 Accountability Log
        </Link>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#7a8a95" }}>
          Recent Activity
        </h2>
        <div
          className="rounded-xl divide-y"
          style={{ backgroundColor: "#36393F", borderColor: "#2C2F33", border: "1px solid #2C2F33" }}
        >
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4">
              <span
                className="mt-0.5 w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: typeColors[item.type], marginTop: "6px" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "#B0E0E6" }}>
                  {item.action}
                </p>
                <p className="text-xs truncate" style={{ color: "#9aa5b0" }}>
                  {item.detail}
                </p>
              </div>
              <span className="text-xs shrink-0" style={{ color: "#7a8a95" }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
