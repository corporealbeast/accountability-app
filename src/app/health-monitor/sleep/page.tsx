"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type SleepPhase = "deep" | "light" | "rem" | "awake";

interface SleepNight {
  id: number;
  date: string;
  totalHours: number;
  bedtime: string;
  wakeTime: string;
  deep: number;
  light: number;
  rem: number;
  awake: number;
  hrAvg: number;
  hrv: number;
  notes: string;
}

const phaseConfig: Record<SleepPhase, { label: string; color: string }> = {
  deep:  { label: "Deep",  color: "#B0E0E6" },
  light: { label: "Light", color: "#4a6a7a" },
  rem:   { label: "REM",   color: "#8ACDD4" },
  awake: { label: "Awake", color: "#36393F" },
};

const seedNights: SleepNight[] = [
  { id: 1, date: "2026-03-14", totalHours: 7.2, bedtime: "10:31 PM", wakeTime: "5:43 AM", deep: 22, light: 47, rem: 24, awake: 7, hrAvg: 54, hrv: 64, notes: "Woke briefly at 3am. Back to sleep fast." },
  { id: 2, date: "2026-03-13", totalHours: 8.0, bedtime: "10:00 PM", wakeTime: "6:00 AM", deep: 28, light: 41, rem: 27, awake: 4, hrAvg: 51, hrv: 71, notes: "Best sleep in weeks. No interruptions." },
  { id: 3, date: "2026-03-12", totalHours: 6.5, bedtime: "11:28 PM", wakeTime: "5:58 AM", deep: 15, light: 52, rem: 21, awake: 12, hrAvg: 58, hrv: 52, notes: "Up late coding. Felt groggy all morning." },
  { id: 4, date: "2026-03-11", totalHours: 7.8, bedtime: "10:14 PM", wakeTime: "6:01 AM", deep: 25, light: 45, rem: 25, awake: 5, hrAvg: 53, hrv: 68, notes: "Solid night. Minor restlessness." },
  { id: 5, date: "2026-03-10", totalHours: 7.5, bedtime: "10:45 PM", wakeTime: "6:15 AM", deep: 20, light: 50, rem: 23, awake: 7, hrAvg: 55, hrv: 60, notes: "Standard. Good energy next day." },
  { id: 6, date: "2026-03-09", totalHours: 6.8, bedtime: "11:00 PM", wakeTime: "5:48 AM", deep: 18, light: 53, rem: 20, awake: 9, hrAvg: 57, hrv: 55, notes: "Social event ran late. Decent considering." },
  { id: 7, date: "2026-03-08", totalHours: 8.3, bedtime: "9:45 PM", wakeTime: "6:03 AM", deep: 30, light: 40, rem: 26, awake: 4, hrAvg: 50, hrv: 74, notes: "Sunday recovery sleep. Excellent." },
];

const goals = { totalHours: 8, deep: 20, rem: 20, hrv: 60 };

export default function SleepDetailPage() {
  const [nights, setNights] = useLocalStorage<SleepNight[]>("hm_sleep", seedNights);
  const [selected, setSelected] = useState<number>(1);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [totalHours, setTotalHours] = useState("");
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [deep, setDeep] = useState("");
  const [light, setLight] = useState("");
  const [rem, setRem] = useState("");
  const [awake, setAwake] = useState("");
  const [hrAvg, setHrAvg] = useState("");
  const [hrv, setHrv] = useState("");
  const [notes, setNotes] = useState("");

  const selectedNight = nights.find((n) => n.id === selected) ?? nights[0];
  const avg7 = (nights.slice(0, 7).reduce((a, n) => a + n.totalHours, 0) / Math.min(nights.length, 7)).toFixed(1);
  const avgHRV7 = Math.round(nights.slice(0, 7).reduce((a, n) => a + n.hrv, 0) / Math.min(nights.length, 7));

  const saveNight = () => {
    if (!totalHours) return;
    setNights((prev) => [
      {
        id: Date.now(),
        date,
        totalHours: parseFloat(totalHours) || 0,
        bedtime, wakeTime,
        deep: parseInt(deep) || 0,
        light: parseInt(light) || 0,
        rem: parseInt(rem) || 0,
        awake: parseInt(awake) || 0,
        hrAvg: parseInt(hrAvg) || 0,
        hrv: parseInt(hrv) || 0,
        notes,
      },
      ...prev,
    ]);
    setTotalHours(""); setBedtime(""); setWakeTime(""); setDeep(""); setLight("");
    setRem(""); setAwake(""); setHrAvg(""); setHrv(""); setNotes("");
    setShowForm(false);
  };

  const phases: SleepPhase[] = ["deep", "rem", "light", "awake"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>😴 Sleep</h1>
          <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
            7-day avg: <span style={{ color: "#B0E0E6" }}>{avg7}h</span> ·
            Avg HRV: <span style={{ color: "#B0E0E6" }}>{avgHRV7}ms</span>
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
        >
          + Log Night
        </button>
      </div>

      {/* Log form */}
      {showForm && (
        <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: "#36393F", border: "1px solid #B0E0E6" }}>
          <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>Log Sleep</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Date", value: date, set: setDate, type: "date" },
              { label: "Total Hours *", value: totalHours, set: setTotalHours, type: "number" },
              { label: "Bedtime", value: bedtime, set: setBedtime, type: "text" },
              { label: "Wake Time", value: wakeTime, set: setWakeTime, type: "text" },
              { label: "Deep Sleep %", value: deep, set: setDeep, type: "number" },
              { label: "Light Sleep %", value: light, set: setLight, type: "number" },
              { label: "REM %", value: rem, set: setRem, type: "number" },
              { label: "Awake %", value: awake, set: setAwake, type: "number" },
              { label: "Avg HR (bpm)", value: hrAvg, set: setHrAvg, type: "number" },
              { label: "HRV (ms)", value: hrv, set: setHrv, type: "number" },
            ].map(({ label, value, set, type }) => (
              <div key={label}>
                <p className="text-xs mb-1" style={{ color: "#7a8a95" }}>{label}</p>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
                />
              </div>
            ))}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
          />
          <div className="flex gap-2">
            <button onClick={saveNight} className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}>Save</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ backgroundColor: "#23262A", color: "#9aa5b0" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* 7-day trend bar chart */}
      <div className="rounded-xl p-5 space-y-3" style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}>
        <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>7-Day Sleep</p>
        <div className="flex items-end gap-2" style={{ height: "100px" }}>
          {[...nights].slice(0, 7).reverse().map((n) => {
            const h = Math.round((n.totalHours / 9) * 100);
            const color = n.totalHours >= 7.5 ? "#B0E0E6" : n.totalHours >= 6.5 ? "#8ACDD4" : "#4a6a7a";
            const isSelected = n.id === selected;
            return (
              <button
                key={n.id}
                onClick={() => setSelected(n.id)}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <span className="text-xs" style={{ color }}>{n.totalHours}h</span>
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${h}%`,
                    backgroundColor: color,
                    minHeight: "6px",
                    opacity: isSelected ? 1 : 0.6,
                    outline: isSelected ? `2px solid #B0E0E6` : "none",
                  }}
                />
                <span className="text-xs" style={{ color: isSelected ? "#B0E0E6" : "#7a8a95" }}>
                  {n.date.slice(5)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs" style={{ color: "#7a8a95" }}>Click a bar to inspect that night</p>
      </div>

      {/* Selected night detail */}
      {selectedNight && (
        <div className="rounded-xl p-5 space-y-5" style={{ backgroundColor: "#36393F", border: "1px solid #B0E0E6" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>{selectedNight.date}</p>
              <p className="text-xs" style={{ color: "#9aa5b0" }}>
                {selectedNight.bedtime} → {selectedNight.wakeTime}
              </p>
            </div>
            <p className="text-3xl font-bold" style={{ color: "#B0E0E6" }}>
              {selectedNight.totalHours}h
            </p>
          </div>

          {/* Sleep stage stacked bar */}
          <div>
            <p className="text-xs mb-2 uppercase tracking-widest" style={{ color: "#7a8a95" }}>Sleep Stages</p>
            <div className="flex rounded-full overflow-hidden h-4">
              {phases.map((phase) => {
                const pct = selectedNight[phase];
                if (pct === 0) return null;
                return (
                  <div
                    key={phase}
                    style={{ width: `${pct}%`, backgroundColor: phaseConfig[phase].color }}
                    title={`${phaseConfig[phase].label}: ${pct}%`}
                  />
                );
              })}
            </div>
            <div className="flex gap-4 mt-2 flex-wrap">
              {phases.map((phase) => (
                <div key={phase} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: phaseConfig[phase].color, display: "inline-block" }} />
                  <span className="text-xs" style={{ color: "#9aa5b0" }}>
                    {phaseConfig[phase].label} {selectedNight[phase]}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Goal comparisons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Deep Sleep", val: selectedNight.deep, goal: goals.deep, unit: "%" },
              { label: "REM Sleep", val: selectedNight.rem, goal: goals.rem, unit: "%" },
              { label: "HRV", val: selectedNight.hrv, goal: goals.hrv, unit: "ms" },
              { label: "Avg HR", val: selectedNight.hrAvg, goal: 0, unit: "bpm" },
            ].map((m) => {
              const met = m.goal > 0 ? m.val >= m.goal : true;
              return (
                <div
                  key={m.label}
                  className="rounded-lg p-3 text-center"
                  style={{ backgroundColor: "#23262A" }}
                >
                  <p className="text-xs mb-1" style={{ color: "#7a8a95" }}>{m.label}</p>
                  <p className="text-xl font-bold" style={{ color: met ? "#B0E0E6" : "#e6c87a" }}>
                    {m.val}{m.unit}
                  </p>
                  {m.goal > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: "#7a8a95" }}>Goal: {m.goal}{m.unit}</p>
                  )}
                </div>
              );
            })}
          </div>

          {selectedNight.notes && (
            <p className="text-sm" style={{ color: "#9aa5b0" }}>{selectedNight.notes}</p>
          )}
        </div>
      )}

      {/* Full night log list */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#7a8a95" }}>All Nights</p>
        <div className="rounded-xl divide-y overflow-hidden" style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}>
          {nights.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelected(n.id)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:opacity-80"
            >
              <div>
                <p className="text-sm" style={{ color: n.id === selected ? "#B0E0E6" : "#9aa5b0" }}>{n.date}</p>
                <p className="text-xs" style={{ color: "#7a8a95" }}>Deep {n.deep}% · REM {n.rem}% · HRV {n.hrv}ms</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: n.totalHours >= 7.5 ? "#B0E0E6" : "#e6c87a" }}>
                  {n.totalHours}h
                </span>
                {n.id === selected && <span style={{ color: "#B0E0E6" }}>●</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
