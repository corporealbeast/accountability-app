"use client";

import { useState } from "react";

interface MetricEntry {
  date: string;
  value: number;
}

interface Metric {
  id: string;
  label: string;
  unit: string;
  emoji: string;
  goal: number;
  goalDir: "up" | "down" | "none";
  history: MetricEntry[];
}

const seedMetrics: Metric[] = [
  {
    id: "weight",
    label: "Body Weight",
    unit: "lbs",
    emoji: "⚖️",
    goal: 185,
    goalDir: "down",
    history: [
      { date: "Jan 1",  value: 195 },
      { date: "Jan 15", value: 193 },
      { date: "Feb 1",  value: 192 },
      { date: "Feb 15", value: 191 },
      { date: "Mar 1",  value: 190 },
      { date: "Mar 14", value: 189.5 },
    ],
  },
  {
    id: "bf",
    label: "Body Fat %",
    unit: "%",
    emoji: "📊",
    goal: 12,
    goalDir: "down",
    history: [
      { date: "Jan 1",  value: 18.0 },
      { date: "Jan 15", value: 17.5 },
      { date: "Feb 1",  value: 17.0 },
      { date: "Feb 15", value: 16.2 },
      { date: "Mar 1",  value: 15.8 },
      { date: "Mar 14", value: 15.4 },
    ],
  },
  {
    id: "hr",
    label: "Resting Heart Rate",
    unit: "bpm",
    emoji: "❤️",
    goal: 55,
    goalDir: "down",
    history: [
      { date: "Jan 1",  value: 64 },
      { date: "Jan 15", value: 62 },
      { date: "Feb 1",  value: 61 },
      { date: "Feb 15", value: 59 },
      { date: "Mar 1",  value: 58 },
      { date: "Mar 14", value: 58 },
    ],
  },
  {
    id: "hrv",
    label: "HRV",
    unit: "ms",
    emoji: "💓",
    goal: 70,
    goalDir: "up",
    history: [
      { date: "Jan 1",  value: 48 },
      { date: "Jan 15", value: 52 },
      { date: "Feb 1",  value: 55 },
      { date: "Feb 15", value: 58 },
      { date: "Mar 1",  value: 60 },
      { date: "Mar 14", value: 64 },
    ],
  },
  {
    id: "bp_sys",
    label: "Blood Pressure (Systolic)",
    unit: "mmHg",
    emoji: "🩺",
    goal: 120,
    goalDir: "down",
    history: [
      { date: "Jan 1",  value: 128 },
      { date: "Feb 1",  value: 124 },
      { date: "Mar 1",  value: 120 },
      { date: "Mar 14", value: 118 },
    ],
  },
  {
    id: "vo2",
    label: "VO2 Max (est.)",
    unit: "mL/kg/min",
    emoji: "🫁",
    goal: 55,
    goalDir: "up",
    history: [
      { date: "Jan 1",  value: 42 },
      { date: "Feb 1",  value: 44 },
      { date: "Mar 1",  value: 46 },
      { date: "Mar 14", value: 47 },
    ],
  },
];

const metricIds = seedMetrics.map((m) => m.id);

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>(seedMetrics);
  const [activeMetric, setActiveMetric] = useState<string>("weight");
  const [showLog, setShowLog] = useState(false);
  const [logValue, setLogValue] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);

  const metric = metrics.find((m) => m.id === activeMetric)!;
  const latest = metric.history[metric.history.length - 1];
  const first = metric.history[0];
  const delta = +(latest.value - first.value).toFixed(1);
  const isGood =
    metric.goalDir === "down" ? delta <= 0 :
    metric.goalDir === "up"   ? delta >= 0 : true;
  const atGoal =
    metric.goalDir === "down" ? latest.value <= metric.goal :
    metric.goalDir === "up"   ? latest.value >= metric.goal : true;
  const pctToGoal = metric.goalDir === "none" ? 100 :
    metric.goalDir === "down"
      ? Math.min(100, Math.round(((first.value - latest.value) / (first.value - metric.goal)) * 100))
      : Math.min(100, Math.round(((latest.value - first.value) / (metric.goal - first.value)) * 100));

  const maxVal = Math.max(...metric.history.map((h) => h.value));
  const minVal = Math.min(...metric.history.map((h) => h.value));
  const range = maxVal - minVal || 1;

  const saveLog = () => {
    if (!logValue) return;
    const label = new Date(logDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setMetrics((prev) =>
      prev.map((m) =>
        m.id === activeMetric
          ? { ...m, history: [...m.history, { date: label, value: parseFloat(logValue) }] }
          : m
      )
    );
    setLogValue(""); setShowLog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>📉 Metrics</h1>
        <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
          Long-term health tracking — body composition, cardiovascular, performance.
        </p>
      </div>

      {/* Metric selector */}
      <div className="flex flex-wrap gap-2">
        {metrics.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMetric(m.id)}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeMetric === m.id ? "#B0E0E6" : "#36393F",
              color: activeMetric === m.id ? "#23262A" : "#9aa5b0",
              border: activeMetric === m.id ? "none" : "1px solid #2C2F33",
            }}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {/* Active metric detail */}
      <div className="rounded-xl p-5 space-y-5" style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}>
        {/* Title + latest */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>
              {metric.emoji} {metric.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#9aa5b0" }}>
              Since {first.date} · Goal: {metric.goal} {metric.unit}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color: "#B0E0E6" }}>
              {latest.value}
            </p>
            <p className="text-xs" style={{ color: "#7a8a95" }}>{metric.unit}</p>
          </div>
        </div>

        {/* Delta + goal progress */}
        <div className="flex gap-4">
          <div
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: "#23262A",
              color: isGood ? "#B0E0E6" : "#e6c87a",
            }}
          >
            {delta >= 0 ? "+" : ""}{delta} {metric.unit} since {first.date}
          </div>
          {atGoal && (
            <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: "#1e3a2f", color: "#4ade80" }}>
              ✓ Goal reached
            </div>
          )}
        </div>

        {metric.goalDir !== "none" && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span style={{ color: "#7a8a95" }}>Progress to goal</span>
              <span style={{ color: "#8ACDD4" }}>{Math.max(pctToGoal, 0)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#23262A" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(pctToGoal, 0)}%`, backgroundColor: "#B0E0E6" }}
              />
            </div>
          </div>
        )}

        {/* Trend line chart (bar-based) */}
        <div>
          <p className="text-xs mb-3 uppercase tracking-widest" style={{ color: "#7a8a95" }}>Trend</p>
          <div className="relative" style={{ height: "120px" }}>
            {/* Bars */}
            <div className="flex items-end gap-2 h-full">
              {metric.history.map((h, i) => {
                const isLatest = i === metric.history.length - 1;
                const normH =
                  metric.goalDir === "down"
                    ? 1 - (h.value - minVal) / range
                    : (h.value - minVal) / range;
                const barH = Math.max(Math.round(normH * 100), 8);
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs" style={{ color: isLatest ? "#B0E0E6" : "#7a8a95" }}>
                      {h.value}
                    </span>
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${barH}%`,
                        backgroundColor: isLatest ? "#B0E0E6" : "#4a6a7a",
                      }}
                    />
                    <span className="text-xs text-center leading-tight" style={{ color: "#7a8a95" }}>
                      {h.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Log new reading */}
        <div>
          {!showLog ? (
            <button
              onClick={() => setShowLog(true)}
              className="text-sm hover:opacity-80"
              style={{ color: "#8ACDD4" }}
            >
              + Log new reading
            </button>
          ) : (
            <div className="flex gap-2 items-end flex-wrap">
              <div>
                <p className="text-xs mb-1" style={{ color: "#7a8a95" }}>Date</p>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
                />
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "#7a8a95" }}>Value ({metric.unit})</p>
                <input
                  type="number"
                  value={logValue}
                  onChange={(e) => setLogValue(e.target.value)}
                  placeholder={`e.g. ${latest.value}`}
                  className="px-3 py-2 rounded-lg text-sm outline-none w-28"
                  style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
                />
              </div>
              <button onClick={saveLog} className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}>Save</button>
              <button onClick={() => setShowLog(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ backgroundColor: "#23262A", color: "#9aa5b0" }}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* All metrics snapshot */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#7a8a95" }}>All Metrics Snapshot</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {metrics.map((m) => {
            const cur = m.history[m.history.length - 1];
            const start = m.history[0];
            const d = +(cur.value - start.value).toFixed(1);
            const good =
              m.goalDir === "down" ? d <= 0 :
              m.goalDir === "up"   ? d >= 0 : true;
            const reached =
              m.goalDir === "down" ? cur.value <= m.goal :
              m.goalDir === "up"   ? cur.value >= m.goal : true;

            return (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id)}
                className="rounded-xl p-4 text-left space-y-1 hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: activeMetric === m.id ? "#2C2F33" : "#36393F",
                  border: activeMetric === m.id ? "1px solid #B0E0E6" : "1px solid #2C2F33",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#7a8a95" }}>{m.emoji} {m.label}</span>
                  {reached && (
                    <span className="text-xs" style={{ color: "#4ade80" }}>✓</span>
                  )}
                </div>
                <p className="text-xl font-bold" style={{ color: "#B0E0E6" }}>
                  {cur.value} <span className="text-xs font-normal" style={{ color: "#7a8a95" }}>{m.unit}</span>
                </p>
                <p className="text-xs" style={{ color: good ? "#8ACDD4" : "#e6c87a" }}>
                  {d >= 0 ? "+" : ""}{d} {m.unit}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
