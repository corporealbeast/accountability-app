import Link from "next/link";

const stats = [
  { label: "Workouts This Week", value: "3", delta: "Goal: 5" },
  { label: "Total This Month", value: "14", delta: "+2 vs last month" },
  { label: "Current Streak", value: "6d", delta: "Keep going" },
  { label: "Avg Session", value: "52 min", delta: "+4 min vs avg" },
];

const recentWorkouts = [
  { name: "Push Day — Chest & Tris", date: "Today", duration: "58 min", sets: 18, volume: "12,450 lbs" },
  { name: "Legs — Squat Focus", date: "Yesterday", duration: "61 min", sets: 20, volume: "18,200 lbs" },
  { name: "Pull Day — Back & Bis", date: "Mar 12", duration: "49 min", sets: 16, volume: "10,800 lbs" },
  { name: "Upper Power", date: "Mar 11", duration: "55 min", sets: 17, volume: "13,100 lbs" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const completedDays = [true, true, false, true, false, false, false];

export default function StrengthCollectivePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
          💪 Strength Collective
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
          Track your training, volume, and progress.
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
            <p className="text-3xl font-bold" style={{ color: "#B0E0E6" }}>{s.value}</p>
            <p className="text-xs" style={{ color: "#8ACDD4" }}>{s.delta}</p>
          </div>
        ))}
      </div>

      {/* Weekly tracker */}
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#7a8a95" }}>
          This Week
        </p>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <span className="text-xs" style={{ color: "#7a8a95" }}>{day}</span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: completedDays[i] ? "#B0E0E6" : "#23262A",
                  color: completedDays[i] ? "#23262A" : "#7a8a95",
                }}
              >
                {completedDays[i] ? "✓" : "·"}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "#7a8a95" }}>
          3 / 5 sessions complete
        </p>
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link
          href="/strength-collective/workouts"
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
        >
          🏋️ Log Workout
        </Link>
        <Link
          href="/strength-collective/progress"
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#36393F", color: "#B0E0E6", border: "1px solid #B0E0E6" }}
        >
          📈 View Progress
        </Link>
      </div>

      {/* Recent workouts */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#7a8a95" }}>
          Recent Workouts
        </h2>
        <div
          className="rounded-xl divide-y"
          style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", divideColor: "#2C2F33" }}
        >
          {recentWorkouts.map((w, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4 gap-4">
              <div>
                <p className="text-sm font-medium" style={{ color: "#B0E0E6" }}>{w.name}</p>
                <p className="text-xs" style={{ color: "#9aa5b0" }}>
                  {w.date} · {w.duration} · {w.sets} sets
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold" style={{ color: "#8ACDD4" }}>{w.volume}</p>
                <p className="text-xs" style={{ color: "#7a8a95" }}>volume</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
