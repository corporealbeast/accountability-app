"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type SleepQuality = "great" | "good" | "poor";
type RecoveryMethod = "stretching" | "cold" | "sauna" | "massage" | "rest" | "walk";

interface SleepEntry {
  id: number;
  date: string;
  hoursSlept: number;
  quality: SleepQuality;
  bedtime: string;
  wakeTime: string;
  notes: string;
}

interface RecoveryEntry {
  id: number;
  date: string;
  methods: RecoveryMethod[];
  soreness: number;
  notes: string;
}

const qualityConfig: Record<SleepQuality, { label: string; emoji: string; color: string }> = {
  great: { label: "Great", emoji: "🌙", color: "#B0E0E6" },
  good:  { label: "Good",  emoji: "😴", color: "#8ACDD4" },
  poor:  { label: "Poor",  emoji: "😵", color: "#9aa5b0" },
};

const recoveryMethodConfig: Record<RecoveryMethod, { label: string; emoji: string }> = {
  stretching: { label: "Stretching", emoji: "🧘" },
  cold:       { label: "Cold Therapy", emoji: "🧊" },
  sauna:      { label: "Sauna", emoji: "🔥" },
  massage:    { label: "Massage", emoji: "💆" },
  rest:       { label: "Full Rest", emoji: "🛋️" },
  walk:       { label: "Easy Walk", emoji: "🚶" },
};

const seedSleep: SleepEntry[] = [
  { id: 1, date: "2026-03-14", hoursSlept: 7.2, quality: "good", bedtime: "10:30 PM", wakeTime: "5:42 AM", notes: "Fell asleep fast. Woke once around 3am." },
  { id: 2, date: "2026-03-13", hoursSlept: 8.0, quality: "great", bedtime: "10:00 PM", wakeTime: "6:00 AM", notes: "Best sleep in weeks. No interruptions." },
  { id: 3, date: "2026-03-12", hoursSlept: 6.5, quality: "poor", bedtime: "11:30 PM", wakeTime: "6:00 AM", notes: "Up late coding. Felt groggy all morning." },
  { id: 4, date: "2026-03-11", hoursSlept: 7.8, quality: "good", bedtime: "10:15 PM", wakeTime: "6:03 AM", notes: "Solid. Minor restlessness." },
];

const seedRecovery: RecoveryEntry[] = [
  { id: 1, date: "2026-03-14", methods: ["stretching", "cold"], soreness: 4, notes: "Legs tight from squats. 10 min stretch + cold shower." },
  { id: 2, date: "2026-03-13", methods: ["sauna", "rest"], soreness: 6, notes: "Heavy training day. 20 min sauna post-workout." },
  { id: 3, date: "2026-03-12", methods: ["walk", "stretching"], soreness: 3, notes: "Active recovery. 30 min walk. Light stretch." },
];

const avgSleep = (entries: SleepEntry[]) =>
  entries.length ? (entries.reduce((a, e) => a + e.hoursSlept, 0) / entries.length).toFixed(1) : "—";

type Tab = "sleep" | "recovery";

export default function RecoveryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("sleep");
  const [sleepLog, setSleepLog] = useLocalStorage<SleepEntry[]>("ps_sleep", seedSleep);
  const [recoveryLog, setRecoveryLog] = useLocalStorage<RecoveryEntry[]>("ps_recovery", seedRecovery);

  // Sleep form
  const [showSleepForm, setShowSleepForm] = useState(false);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>("good");
  const [hoursSlept, setHoursSlept] = useState("");
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [sleepNotes, setSleepNotes] = useState("");

  // Recovery form
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<RecoveryMethod[]>([]);
  const [soreness, setSoreness] = useState(5);
  const [recoveryNotes, setRecoveryNotes] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const toggleMethod = (m: RecoveryMethod) =>
    setSelectedMethods((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );

  const saveSleep = () => {
    if (!hoursSlept) return;
    setSleepLog((prev) => [
      { id: Date.now(), date: today, hoursSlept: parseFloat(hoursSlept), quality: sleepQuality, bedtime, wakeTime, notes: sleepNotes },
      ...prev,
    ]);
    setHoursSlept(""); setBedtime(""); setWakeTime(""); setSleepNotes("");
    setShowSleepForm(false);
  };

  const saveRecovery = () => {
    if (selectedMethods.length === 0) return;
    setRecoveryLog((prev) => [
      { id: Date.now(), date: today, methods: selectedMethods, soreness, notes: recoveryNotes },
      ...prev,
    ]);
    setSelectedMethods([]); setSoreness(5); setRecoveryNotes("");
    setShowRecoveryForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
          🔄 Recovery
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
          Sleep tracking and active recovery log.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Sleep (7d)", value: `${avgSleep(sleepLog.slice(0, 7))}h`, delta: "Goal: 8h" },
          { label: "Last Night", value: `${sleepLog[0]?.hoursSlept ?? "—"}h`, delta: qualityConfig[sleepLog[0]?.quality ?? "good"].label },
          { label: "Recovery Sessions", value: `${recoveryLog.length}`, delta: "This week" },
          { label: "Avg Soreness", value: `${(recoveryLog.reduce((a, r) => a + r.soreness, 0) / (recoveryLog.length || 1)).toFixed(1)}`, delta: "/ 10" },
        ].map((s) => (
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

      {/* Tabs */}
      <div className="flex gap-2">
        {(["sleep", "recovery"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{
              backgroundColor: activeTab === tab ? "#B0E0E6" : "#36393F",
              color: activeTab === tab ? "#23262A" : "#9aa5b0",
            }}
          >
            {tab === "sleep" ? "🌙 Sleep" : "⚡ Recovery"}
          </button>
        ))}
      </div>

      {/* Sleep tab */}
      {activeTab === "sleep" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowSleepForm((v) => !v)}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
              style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
            >
              + Log Sleep
            </button>
          </div>

          {/* Sleep form */}
          {showSleepForm && (
            <div
              className="rounded-xl p-5 space-y-4"
              style={{ backgroundColor: "#36393F", border: "1px solid #B0E0E6" }}
            >
              <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>Last Night&apos;s Sleep</p>

              {/* Quality */}
              <div>
                <p className="text-xs mb-2" style={{ color: "#7a8a95" }}>Quality</p>
                <div className="flex gap-2">
                  {(Object.keys(qualityConfig) as SleepQuality[]).map((q) => {
                    const qc = qualityConfig[q];
                    return (
                      <button
                        key={q}
                        onClick={() => setSleepQuality(q)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: sleepQuality === q ? "#23262A" : "transparent",
                          color: sleepQuality === q ? qc.color : "#7a8a95",
                          border: sleepQuality === q ? `1px solid ${qc.color}` : "1px solid #2C2F33",
                        }}
                      >
                        <span>{qc.emoji}</span><span>{qc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { placeholder: "Hours slept *", value: hoursSlept, set: setHoursSlept, type: "number" },
                  { placeholder: "Bedtime (e.g. 10:30 PM)", value: bedtime, set: setBedtime, type: "text" },
                  { placeholder: "Wake time (e.g. 6:00 AM)", value: wakeTime, set: setWakeTime, type: "text" },
                ].map(({ placeholder, value, set, type }) => (
                  <input
                    key={placeholder}
                    type={type}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
                  />
                ))}
              </div>

              <textarea
                value={sleepNotes}
                onChange={(e) => setSleepNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
              />

              <div className="flex gap-2">
                <button onClick={saveSleep} className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}>Save</button>
                <button onClick={() => setShowSleepForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ backgroundColor: "#23262A", color: "#9aa5b0" }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Sleep trend bar chart */}
          <div className="rounded-xl p-5 space-y-3" style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>Sleep History</p>
            <div className="flex items-end gap-3" style={{ height: "100px" }}>
              {[...sleepLog].reverse().map((e) => {
                const h = Math.round((e.hoursSlept / 9) * 100);
                const color = e.hoursSlept >= 7.5 ? "#B0E0E6" : e.hoursSlept >= 6.5 ? "#8ACDD4" : "#4a6a7a";
                return (
                  <div key={e.id} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs" style={{ color }}>{e.hoursSlept}h</span>
                    <div className="w-full rounded-t" style={{ height: `${h}%`, backgroundColor: color, minHeight: "4px" }} />
                    <span className="text-xs" style={{ color: "#7a8a95" }}>{e.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
            {/* 8h goal line label */}
            <p className="text-xs" style={{ color: "#7a8a95" }}>Goal: 8h · Dashed line at 89% height</p>
          </div>

          {/* Sleep log list */}
          <div className="space-y-3">
            {sleepLog.map((e) => {
              const qc = qualityConfig[e.quality];
              return (
                <div key={e.id} className="rounded-xl p-5" style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>{e.date}</p>
                      <p className="text-xs" style={{ color: "#9aa5b0" }}>
                        {e.bedtime && `${e.bedtime} → ${e.wakeTime}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold" style={{ color: "#B0E0E6" }}>{e.hoursSlept}h</span>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#23262A", color: qc.color }}>
                        {qc.emoji} {qc.label}
                      </span>
                    </div>
                  </div>
                  {e.notes && <p className="text-xs" style={{ color: "#9aa5b0" }}>{e.notes}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recovery tab */}
      {activeTab === "recovery" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowRecoveryForm((v) => !v)}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
              style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
            >
              + Log Recovery
            </button>
          </div>

          {/* Recovery form */}
          {showRecoveryForm && (
            <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: "#36393F", border: "1px solid #B0E0E6" }}>
              <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>Recovery Session</p>

              {/* Methods */}
              <div>
                <p className="text-xs mb-2" style={{ color: "#7a8a95" }}>Methods used *</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(recoveryMethodConfig) as RecoveryMethod[]).map((m) => {
                    const mc = recoveryMethodConfig[m];
                    const sel = selectedMethods.includes(m);
                    return (
                      <button
                        key={m}
                        onClick={() => toggleMethod(m)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: sel ? "#B0E0E6" : "#23262A",
                          color: sel ? "#23262A" : "#9aa5b0",
                        }}
                      >
                        <span>{mc.emoji}</span><span>{mc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Soreness slider */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span style={{ color: "#7a8a95" }}>Muscle soreness</span>
                  <span style={{ color: "#B0E0E6" }}>{soreness} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={soreness}
                  onChange={(e) => setSoreness(Number(e.target.value))}
                  className="w-full accent-powder-blue"
                  style={{ accentColor: "#B0E0E6" }}
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: "#7a8a95" }}>
                  <span>Fresh</span><span>Destroyed</span>
                </div>
              </div>

              <textarea
                value={recoveryNotes}
                onChange={(e) => setRecoveryNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
              />

              <div className="flex gap-2">
                <button onClick={saveRecovery} className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}>Save</button>
                <button onClick={() => setShowRecoveryForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ backgroundColor: "#23262A", color: "#9aa5b0" }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Recovery log */}
          <div className="space-y-3">
            {recoveryLog.map((r) => (
              <div key={r.id} className="rounded-xl p-5 space-y-3" style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>{r.date}</p>
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#23262A", color: r.soreness >= 7 ? "#e6c87a" : "#B0E0E6" }}>
                    Soreness: {r.soreness}/10
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {r.methods.map((m) => {
                    const mc = recoveryMethodConfig[m];
                    return (
                      <span
                        key={m}
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{ backgroundColor: "#23262A", color: "#9aa5b0" }}
                      >
                        {mc.emoji} {mc.label}
                      </span>
                    );
                  })}
                </div>

                {r.notes && <p className="text-xs" style={{ color: "#9aa5b0" }}>{r.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
