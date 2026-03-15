"use client";

import { useState } from "react";

interface Scenario {
  label: string;
  monthlyGrowth: number;
  color: string;
}

const currentMRR = 7240;
const mrrGoal = 10000;

const scenarios: Scenario[] = [
  { label: "Conservative (5%/mo)", monthlyGrowth: 0.05, color: "#7a8a95" },
  { label: "Base (10%/mo)",        monthlyGrowth: 0.10, color: "#8ACDD4" },
  { label: "Aggressive (18%/mo)",  monthlyGrowth: 0.18, color: "#B0E0E6" },
];

function projectMRR(start: number, growthRate: number, months: number): number[] {
  const result = [start];
  for (let i = 1; i <= months; i++) {
    result.push(Math.round(result[i - 1] * (1 + growthRate)));
  }
  return result;
}

const MONTHS = 12;
const monthLabels = ["Now", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

interface Milestone {
  label: string;
  amount: number;
  emoji: string;
}

const milestones: Milestone[] = [
  { label: "$10k MRR",  amount: 10000,  emoji: "🎯" },
  { label: "$15k MRR",  amount: 15000,  emoji: "🔥" },
  { label: "$25k MRR",  amount: 25000,  emoji: "💪" },
  { label: "$50k MRR",  amount: 50000,  emoji: "🚀" },
  { label: "$100k MRR", amount: 100000, emoji: "👑" },
];

function monthsToTarget(start: number, growth: number, target: number): string {
  if (start >= target) return "Already there";
  let cur = start;
  let m = 0;
  while (cur < target && m < 120) {
    cur = cur * (1 + growth);
    m++;
  }
  if (m >= 120) return "120+ months";
  const d = new Date();
  d.setMonth(d.getMonth() + m);
  return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()} (${m}mo)`;
}

interface StreamInput {
  id: number;
  name: string;
  currentMRR: number;
  growthRate: number;
}

const defaultStreams: StreamInput[] = [
  { id: 1, name: "SaaS", currentMRR: 2800, growthRate: 15 },
  { id: 2, name: "Coaching", currentMRR: 2200, growthRate: 5 },
  { id: 3, name: "Digital Products", currentMRR: 1100, growthRate: 10 },
  { id: 4, name: "Affiliate", currentMRR: 740, growthRate: 12 },
  { id: 5, name: "Content", currentMRR: 400, growthRate: 8 },
];

export default function ProjectionsPage() {
  const [activeScenario, setActiveScenario] = useState(1); // base
  const [customGrowth, setCustomGrowth] = useState(10);
  const [useCustom, setUseCustom] = useState(false);
  const [streams, setStreams] = useState<StreamInput[]>(defaultStreams);

  const growthRate = useCustom ? customGrowth / 100 : scenarios[activeScenario].monthlyGrowth;
  const projection = projectMRR(currentMRR, growthRate, MONTHS);
  const maxProj = Math.max(...projection);

  const streamProjections = streams.map((s) => ({
    ...s,
    projected12: Math.round(s.currentMRR * Math.pow(1 + s.growthRate / 100, 12)),
  }));
  const totalProjected12 = streamProjections.reduce((a, s) => a + s.projected12, 0);

  const updateStream = (id: number, field: keyof StreamInput, val: string) => {
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: field === "name" ? val : Number(val) || 0 } : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
          🔮 Projections
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
          Model your growth scenarios and milestone timeline.
        </p>
      </div>

      {/* Scenario selector */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>Growth Scenario</p>
        <div className="flex flex-wrap gap-2">
          {scenarios.map((s, i) => (
            <button
              key={s.label}
              onClick={() => { setActiveScenario(i); setUseCustom(false); }}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: !useCustom && activeScenario === i ? "#B0E0E6" : "#23262A",
                color: !useCustom && activeScenario === i ? "#23262A" : "#9aa5b0",
              }}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setUseCustom(true)}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: useCustom ? "#B0E0E6" : "#23262A",
              color: useCustom ? "#23262A" : "#9aa5b0",
            }}
          >
            Custom
          </button>
        </div>

        {useCustom && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span style={{ color: "#7a8a95" }}>Monthly growth rate</span>
              <span style={{ color: "#B0E0E6" }}>{customGrowth}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={customGrowth}
              onChange={(e) => setCustomGrowth(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "#B0E0E6" }}
            />
            <div className="flex justify-between text-xs" style={{ color: "#7a8a95" }}>
              <span>1%</span><span>50%</span>
            </div>
          </div>
        )}
      </div>

      {/* 12-month projection chart */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>12-Month MRR Projection</p>
          <span className="text-sm font-bold" style={{ color: "#B0E0E6" }}>
            → ${projection[MONTHS].toLocaleString()}/mo
          </span>
        </div>

        <div className="flex items-end gap-1.5" style={{ height: "160px" }}>
          {projection.map((val, i) => {
            const h = Math.round((val / maxProj) * 100);
            const hitGoal = val >= mrrGoal && projection[i - 1] < mrrGoal;
            const pastGoal = val >= mrrGoal;
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1 relative">
                {hitGoal && (
                  <span className="absolute -top-5 text-xs" style={{ color: "#B0E0E6" }}>🎯</span>
                )}
                {i % 3 === 0 && (
                  <span className="text-xs" style={{ color: pastGoal ? "#B0E0E6" : "#8ACDD4" }}>
                    ${(val / 1000).toFixed(1)}k
                  </span>
                )}
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${h}%`,
                    backgroundColor: pastGoal ? "#B0E0E6" : "#4a6a7a",
                    minHeight: "4px",
                  }}
                />
                <span className="text-xs" style={{ color: "#7a8a95" }}>{monthLabels[i]}</span>
              </div>
            );
          })}
        </div>

        {/* $10k goal line note */}
        <p className="text-xs" style={{ color: "#7a8a95" }}>
          Bars highlighted in Powder Blue = above $10k MRR goal ·
          Starting MRR: <span style={{ color: "#8ACDD4" }}>${currentMRR.toLocaleString()}</span>
        </p>
      </div>

      {/* Milestone timeline */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#7a8a95" }}>
          Milestone Timeline — at {Math.round(growthRate * 100)}%/mo growth
        </p>
        {milestones.map((m) => {
          const reached = currentMRR >= m.amount;
          const eta = monthsToTarget(currentMRR, growthRate, m.amount);
          return (
            <div
              key={m.label}
              className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: "#2C2F33" }}
            >
              <div className="flex items-center gap-2">
                <span>{m.emoji}</span>
                <span className="text-sm" style={{ color: reached ? "#B0E0E6" : "#9aa5b0" }}>
                  {m.label}
                </span>
                {reached && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#1e3a2f", color: "#4ade80" }}>
                    Achieved
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: reached ? "#4ade80" : "#8ACDD4" }}>
                {reached ? "✓ Now" : eta}
              </span>
            </div>
          );
        })}
      </div>

      {/* Per-stream projector */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>Stream-by-Stream Projector</p>
          <span className="text-sm font-bold" style={{ color: "#B0E0E6" }}>
            12-mo total: ${totalProjected12.toLocaleString()}
          </span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs px-1" style={{ color: "#7a8a95" }}>
            <span className="col-span-4">Stream</span>
            <span className="col-span-3 text-right">Current</span>
            <span className="col-span-2 text-center">Growth/mo</span>
            <span className="col-span-3 text-right">12-mo proj</span>
          </div>

          {streamProjections.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-12 gap-2 items-center rounded-lg px-3 py-2"
              style={{ backgroundColor: "#23262A" }}
            >
              <input
                value={s.name}
                onChange={(e) => updateStream(s.id, "name", e.target.value)}
                className="col-span-4 bg-transparent text-sm outline-none"
                style={{ color: "#B0E0E6" }}
              />
              <div className="col-span-3 flex items-center justify-end gap-1">
                <span className="text-xs" style={{ color: "#7a8a95" }}>$</span>
                <input
                  type="number"
                  value={s.currentMRR}
                  onChange={(e) => updateStream(s.id, "currentMRR", e.target.value)}
                  className="w-16 bg-transparent text-sm text-right outline-none"
                  style={{ color: "#9aa5b0" }}
                />
              </div>
              <div className="col-span-2 flex items-center justify-center gap-0.5">
                <input
                  type="number"
                  value={s.growthRate}
                  onChange={(e) => updateStream(s.id, "growthRate", e.target.value)}
                  className="w-10 bg-transparent text-sm text-center outline-none"
                  style={{ color: "#8ACDD4" }}
                />
                <span className="text-xs" style={{ color: "#7a8a95" }}>%</span>
              </div>
              <p className="col-span-3 text-sm font-semibold text-right" style={{ color: "#B0E0E6" }}>
                ${s.projected12.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: "#7a8a95" }}>
          Click any field to edit. Projections update live.
        </p>
      </div>
    </div>
  );
}
