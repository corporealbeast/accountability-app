"use client";

import { useState } from "react";

interface PREntry {
  date: string;
  weight: number;
}

interface Lift {
  name: string;
  unit: string;
  current: number;
  goal: number;
  history: PREntry[];
}

const lifts: Lift[] = [
  {
    name: "Bench Press",
    unit: "lbs",
    current: 245,
    goal: 315,
    history: [
      { date: "Jan", weight: 205 },
      { date: "Feb", weight: 215 },
      { date: "Mar", weight: 225 },
      { date: "Now", weight: 245 },
    ],
  },
  {
    name: "Back Squat",
    unit: "lbs",
    current: 335,
    goal: 405,
    history: [
      { date: "Jan", weight: 275 },
      { date: "Feb", weight: 295 },
      { date: "Mar", weight: 315 },
      { date: "Now", weight: 335 },
    ],
  },
  {
    name: "Deadlift",
    unit: "lbs",
    current: 385,
    goal: 500,
    history: [
      { date: "Jan", weight: 315 },
      { date: "Feb", weight: 335 },
      { date: "Mar", weight: 365 },
      { date: "Now", weight: 385 },
    ],
  },
  {
    name: "Overhead Press",
    unit: "lbs",
    current: 155,
    goal: 185,
    history: [
      { date: "Jan", weight: 135 },
      { date: "Feb", weight: 140 },
      { date: "Mar", weight: 150 },
      { date: "Now", weight: 155 },
    ],
  },
];

const bodyMetrics = [
  { label: "Body Weight", values: ["195", "193", "191", "190"], unit: "lbs", dates: ["Jan", "Feb", "Mar", "Now"] },
  { label: "Body Fat %", values: ["18", "17", "16", "15.5"], unit: "%", dates: ["Jan", "Feb", "Mar", "Now"] },
];

const volumeByWeek = [
  { week: "W1", volume: 48200 },
  { week: "W2", volume: 52400 },
  { week: "W3", volume: 49800 },
  { week: "W4", volume: 55100 },
  { week: "W5", volume: 58300 },
  { week: "W6", volume: 61200 },
];

const maxVol = Math.max(...volumeByWeek.map((w) => w.volume));

type Tab = "lifts" | "body" | "volume";

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<Tab>("lifts");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
          📈 Progress
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
          PRs, body composition, and volume trends.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["lifts", "body", "volume"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{
              backgroundColor: activeTab === tab ? "#B0E0E6" : "#36393F",
              color: activeTab === tab ? "#23262A" : "#9aa5b0",
            }}
          >
            {tab === "lifts" ? "🏆 PRs" : tab === "body" ? "⚖️ Body" : "📊 Volume"}
          </button>
        ))}
      </div>

      {/* Lifts tab */}
      {activeTab === "lifts" && (
        <div className="space-y-4">
          {lifts.map((lift) => {
            const pct = Math.round((lift.current / lift.goal) * 100);
            const gained = lift.current - lift.history[0].weight;
            const maxH = Math.max(...lift.history.map((h) => h.weight));

            return (
              <div
                key={lift.name}
                className="rounded-xl p-5 space-y-4"
                style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
              >
                {/* Title row */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold" style={{ color: "#B0E0E6" }}>{lift.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9aa5b0" }}>
                      Goal: {lift.goal} {lift.unit} · +{gained} {lift.unit} gained
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: "#B0E0E6" }}>
                      {lift.current}
                    </p>
                    <p className="text-xs" style={{ color: "#7a8a95" }}>{lift.unit}</p>
                  </div>
                </div>

                {/* Goal progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: "#7a8a95" }}>
                    <span>To goal</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#23262A" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: "#B0E0E6" }}
                    />
                  </div>
                </div>

                {/* Mini bar chart */}
                <div>
                  <p className="text-xs mb-2" style={{ color: "#7a8a95" }}>PR history</p>
                  <div className="flex items-end gap-3 h-16">
                    {lift.history.map((h) => {
                      const barH = Math.round((h.weight / maxH) * 100);
                      const isCurrent = h.date === "Now";
                      return (
                        <div key={h.date} className="flex flex-col items-center gap-1 flex-1">
                          <span className="text-xs" style={{ color: isCurrent ? "#B0E0E6" : "#7a8a95" }}>
                            {h.weight}
                          </span>
                          <div className="w-full rounded-t" style={{
                            height: `${barH}%`,
                            backgroundColor: isCurrent ? "#B0E0E6" : "#4a5568",
                            minHeight: "4px",
                          }} />
                          <span className="text-xs" style={{ color: "#7a8a95" }}>{h.date}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Body tab */}
      {activeTab === "body" && (
        <div className="space-y-4">
          {bodyMetrics.map((metric) => {
            const first = parseFloat(metric.values[0]);
            const last = parseFloat(metric.values[metric.values.length - 1]);
            const delta = (last - first).toFixed(1);
            const isDown = last < first;

            return (
              <div
                key={metric.label}
                className="rounded-xl p-5 space-y-4"
                style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
              >
                <div className="flex items-start justify-between">
                  <p className="font-semibold" style={{ color: "#B0E0E6" }}>{metric.label}</p>
                  <div className="text-right">
                    <span
                      className="text-sm font-medium"
                      style={{ color: isDown ? "#B0E0E6" : "#e6c87a" }}
                    >
                      {isDown ? "▼" : "▲"} {Math.abs(parseFloat(delta))} {metric.unit}
                    </span>
                    <p className="text-xs" style={{ color: "#7a8a95" }}>since Jan</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {metric.dates.map((date, i) => (
                    <div
                      key={date}
                      className="rounded-lg p-3 text-center"
                      style={{
                        backgroundColor: i === metric.dates.length - 1 ? "#23262A" : "transparent",
                        border: i === metric.dates.length - 1 ? "1px solid #B0E0E6" : "1px solid #2C2F33",
                      }}
                    >
                      <p
                        className="text-lg font-bold"
                        style={{ color: i === metric.dates.length - 1 ? "#B0E0E6" : "#9aa5b0" }}
                      >
                        {metric.values[i]}
                      </p>
                      <p className="text-xs" style={{ color: "#7a8a95" }}>{date}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Physique notes */}
          <div
            className="rounded-xl p-5 space-y-2"
            style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
          >
            <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>Notes</p>
            <p className="text-sm" style={{ color: "#9aa5b0" }}>
              Down 5 lbs since January while increasing all major lifts. Recomp is working.
              Target: 185 lbs at 12% body fat by end of Q2.
            </p>
          </div>
        </div>
      )}

      {/* Volume tab */}
      {activeTab === "volume" && (
        <div className="space-y-4">
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
          >
            <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>Weekly Volume (lbs)</p>
            <div className="flex items-end gap-3" style={{ height: "160px" }}>
              {volumeByWeek.map((w) => {
                const barH = Math.round((w.volume / maxVol) * 100);
                return (
                  <div key={w.week} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs" style={{ color: "#8ACDD4" }}>
                      {(w.volume / 1000).toFixed(0)}k
                    </span>
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${barH}%`,
                        backgroundColor: w.week === "W6" ? "#B0E0E6" : "#4a6a7a",
                        minHeight: "8px",
                      }}
                    />
                    <span className="text-xs" style={{ color: "#7a8a95" }}>{w.week}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Best Week", value: "61.2k lbs", sub: "Week 6" },
              { label: "Avg / Week", value: "54.2k lbs", sub: "Last 6 weeks" },
              { label: "Total Volume", value: "325k lbs", sub: "This cycle" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
              >
                <p className="text-xs mb-1 uppercase tracking-widest" style={{ color: "#7a8a95" }}>{s.label}</p>
                <p className="text-xl font-bold" style={{ color: "#B0E0E6" }}>{s.value}</p>
                <p className="text-xs" style={{ color: "#9aa5b0" }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
