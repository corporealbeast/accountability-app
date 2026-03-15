"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Mood = "strong" | "solid" | "off";

interface CheckIn {
  id: number;
  date: string;
  mood: Mood;
  wins: string;
  struggles: string;
  tomorrow: string;
}

const moodConfig: Record<Mood, { emoji: string; label: string; color: string }> = {
  strong: { emoji: "🔥", label: "Strong",  color: "#B0E0E6" },
  solid:  { emoji: "✅", label: "Solid",   color: "#8ACDD4" },
  off:    { emoji: "😓", label: "Off day", color: "#9aa5b0" },
};

const initialLogs: CheckIn[] = [
  {
    id: 1,
    date: "2026-03-13",
    mood: "strong",
    wins: "Finished the accountability app sidebar. Hit workout goal.",
    struggles: "Distracted by social media mid-morning.",
    tomorrow: "Start House of Power backend. Meal prep.",
  },
  {
    id: 2,
    date: "2026-03-12",
    mood: "solid",
    wins: "Cold shower streak continued. Read 30 pages.",
    struggles: "Low energy in the afternoon.",
    tomorrow: "Code for 4 focused hours. Gym at 6am.",
  },
  {
    id: 3,
    date: "2026-03-11",
    mood: "off",
    wins: "Still showed up. Got the minimum done.",
    struggles: "Poor sleep. Skipped gym.",
    tomorrow: "Sleep by 10pm. Back on track.",
  },
];

const today = new Date().toISOString().split("T")[0];

export default function AccountabilityPage() {
  const [logs, setLogs] = useLocalStorage<CheckIn[]>("hop_checkins", initialLogs);
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState<Mood>("solid");
  const [wins, setWins] = useState("");
  const [struggles, setStruggles] = useState("");
  const [tomorrow, setTomorrow] = useState("");

  const submitCheckIn = () => {
    if (!wins.trim()) return;
    setLogs((prev) => [
      {
        id: Date.now(),
        date: today,
        mood,
        wins: wins.trim(),
        struggles: struggles.trim(),
        tomorrow: tomorrow.trim(),
      },
      ...prev,
    ]);
    setWins(""); setStruggles(""); setTomorrow("");
    setShowForm(false);
  };

  const alreadyCheckedIn = logs.some((l) => l.date === today);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
            📋 Accountability Log
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
            Daily check-ins — wins, struggles, intentions.
          </p>
        </div>
        {!alreadyCheckedIn && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
            style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
          >
            + Check In
          </button>
        )}
        {alreadyCheckedIn && (
          <span className="text-xs px-3 py-1.5 rounded-full" style={{ backgroundColor: "#1e3a2f", color: "#4ade80" }}>
            ✓ Checked in today
          </span>
        )}
      </div>

      {/* Check-in form */}
      {showForm && (
        <div
          className="rounded-xl p-6 space-y-4"
          style={{ backgroundColor: "#36393F", border: "1px solid #B0E0E6" }}
        >
          <p className="font-semibold text-sm" style={{ color: "#B0E0E6" }}>
            Today&apos;s Check-In — {today}
          </p>

          {/* Mood */}
          <div>
            <p className="text-xs mb-2" style={{ color: "#7a8a95" }}>How was your day?</p>
            <div className="flex gap-2">
              {(Object.keys(moodConfig) as Mood[]).map((m) => {
                const mc = moodConfig[m];
                return (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: mood === m ? "#23262A" : "transparent",
                      color: mood === m ? mc.color : "#7a8a95",
                      border: mood === m ? `1px solid ${mc.color}` : "1px solid #2C2F33",
                    }}
                  >
                    <span>{mc.emoji}</span>
                    <span>{mc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fields */}
          {[
            { label: "Wins *", placeholder: "What did you accomplish today?", value: wins, set: setWins },
            { label: "Struggles", placeholder: "What got in your way?", value: struggles, set: setStruggles },
            { label: "Tomorrow's intention", placeholder: "What's the plan for tomorrow?", value: tomorrow, set: setTomorrow },
          ].map(({ label, placeholder, value, set }) => (
            <div key={label}>
              <p className="text-xs mb-1" style={{ color: "#7a8a95" }}>{label}</p>
              <textarea
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
              />
            </div>
          ))}

          <div className="flex gap-2">
            <button
              onClick={submitCheckIn}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
              style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
            >
              Submit
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
              style={{ backgroundColor: "#23262A", color: "#9aa5b0" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Streak banner */}
      <div
        className="rounded-xl px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#7a8a95" }}>Current Streak</p>
          <p className="text-2xl font-bold" style={{ color: "#B0E0E6" }}>14 days 🔥</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#7a8a95" }}>This Month</p>
          <p className="text-2xl font-bold" style={{ color: "#B0E0E6" }}>{logs.length} check-ins</p>
        </div>
      </div>

      {/* Log entries */}
      <div className="space-y-4">
        {logs.map((log) => {
          const mc = moodConfig[log.mood];
          return (
            <div
              key={log.id}
              className="rounded-xl p-5 space-y-3"
              style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>
                  {log.date}
                </p>
                <span
                  className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: "#23262A", color: mc.color }}
                >
                  {mc.emoji} {mc.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: "#7a8a95" }}>Wins</p>
                  <p className="text-sm" style={{ color: "#9aa5b0" }}>{log.wins}</p>
                </div>
                <div>
                  <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: "#7a8a95" }}>Struggles</p>
                  <p className="text-sm" style={{ color: "#9aa5b0" }}>{log.struggles || "—"}</p>
                </div>
                <div>
                  <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: "#7a8a95" }}>Tomorrow</p>
                  <p className="text-sm" style={{ color: "#9aa5b0" }}>{log.tomorrow || "—"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
