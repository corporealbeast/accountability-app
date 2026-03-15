import Link from "next/link";

const stats = [
  { label: "MRR", value: "$7,240", delta: "+$640 vs last month", up: true },
  { label: "YTD Revenue", value: "$19,880", delta: "On pace for $87k", up: true },
  { label: "Active Streams", value: "6", delta: "2 in growth phase", up: true },
  { label: "Goal Progress", value: "72%", delta: "$10k MRR by Apr 30", up: true },
];

const monthlyRevenue = [
  { month: "Oct", amount: 4200 },
  { month: "Nov", amount: 5100 },
  { month: "Dec", amount: 5800 },
  { month: "Jan", amount: 6100 },
  { month: "Feb", amount: 6600 },
  { month: "Mar", amount: 7240 },
];

const topStreams = [
  { name: "Accountability App (SaaS)", amount: 2800, pct: 39, trend: "up" },
  { name: "Coaching / Consulting", amount: 2200, pct: 30, trend: "up" },
  { name: "Digital Products", amount: 1100, pct: 15, trend: "stable" },
  { name: "Affiliate Revenue", amount: 740, pct: 10, trend: "up" },
  { name: "Content / Sponsorships", amount: 400, pct: 6, trend: "down" },
];

const maxBar = Math.max(...monthlyRevenue.map((m) => m.amount));

const trendIcon = (t: string) =>
  t === "up" ? "↑" : t === "down" ? "↓" : "→";
const trendColor = (t: string) =>
  t === "up" ? "#B0E0E6" : t === "down" ? "#e6c87a" : "#9aa5b0";

export default function GrayRevenuePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
          💰 GrayRevenue
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
          Revenue streams, financial progress, and projections.
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

      {/* Goal progress */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>$10k MRR Goal</p>
          <span className="text-xs" style={{ color: "#8ACDD4" }}>$7,240 / $10,000</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#23262A" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: "72.4%", backgroundColor: "#B0E0E6" }}
          />
        </div>
        <p className="text-xs" style={{ color: "#7a8a95" }}>
          $2,760 remaining · Target: April 30, 2026
        </p>
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link
          href="/gray-revenue/streams"
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
        >
          📊 Manage Streams
        </Link>
        <Link
          href="/gray-revenue/projections"
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#36393F", color: "#B0E0E6", border: "1px solid #B0E0E6" }}
        >
          🔮 Projections
        </Link>
      </div>

      {/* Revenue trend chart */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>MRR Trend</p>
        <div className="flex items-end gap-3" style={{ height: "140px" }}>
          {monthlyRevenue.map((m) => {
            const h = Math.round((m.amount / maxBar) * 100);
            const isCurrent = m.month === "Mar";
            return (
              <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-medium" style={{ color: isCurrent ? "#B0E0E6" : "#8ACDD4" }}>
                  ${(m.amount / 1000).toFixed(1)}k
                </span>
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${h}%`,
                    backgroundColor: isCurrent ? "#B0E0E6" : "#4a6a7a",
                    minHeight: "6px",
                  }}
                />
                <span className="text-xs" style={{ color: "#7a8a95" }}>{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top streams breakdown */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#7a8a95" }}>
          Revenue Breakdown
        </h2>
        <div
          className="rounded-xl divide-y overflow-hidden"
          style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
        >
          {topStreams.map((s) => (
            <div key={s.name} className="px-5 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: trendColor(s.trend) }}>
                    {trendIcon(s.trend)}
                  </span>
                  <span className="text-sm" style={{ color: "#B0E0E6" }}>{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: "#7a8a95" }}>{s.pct}%</span>
                  <span className="text-sm font-semibold" style={{ color: "#8ACDD4" }}>
                    ${s.amount.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#23262A" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.pct}%`, backgroundColor: "#B0E0E6" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
