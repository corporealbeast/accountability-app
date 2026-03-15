"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Status = "active" | "completed" | "paused";

interface Goal {
  id: number;
  title: string;
  category: string;
  status: Status;
  progress: number;
  target: string;
  due: string;
}

const initialGoals: Goal[] = [
  { id: 1, title: "Workout 5x per week", category: "Fitness", status: "active", progress: 60, target: "5 sessions/week", due: "Ongoing" },
  { id: 2, title: "Read 2 books per month", category: "Mind", status: "active", progress: 50, target: "2 books/month", due: "Mar 31" },
  { id: 3, title: "Hit $10k MRR", category: "Revenue", status: "active", progress: 72, target: "$10,000 MRR", due: "Apr 30" },
  { id: 4, title: "Cold shower 30-day challenge", category: "Discipline", status: "completed", progress: 100, target: "30 days", due: "Completed" },
  { id: 5, title: "Meal prep every Sunday", category: "Health", status: "active", progress: 85, target: "Weekly", due: "Ongoing" },
  { id: 6, title: "No alcohol for 90 days", category: "Discipline", status: "paused", progress: 40, target: "90 days", due: "Paused" },
  { id: 7, title: "Launch accountability app", category: "Business", status: "active", progress: 30, target: "MVP live", due: "May 1" },
];

const statusColors: Record<Status, { bg: string; text: string; label: string }> = {
  active:    { bg: "#1e3a2f", text: "#4ade80", label: "Active" },
  completed: { bg: "#1a2e3a", text: "#B0E0E6", label: "Completed" },
  paused:    { bg: "#2e2a1a", text: "#e6c87a", label: "Paused" },
};

export default function GoalsPage() {
  const [goals, setGoals] = useLocalStorage<Goal[]>("hop_goals", initialGoals);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newDue, setNewDue] = useState("");

  const filtered = filter === "all" ? goals : goals.filter((g) => g.status === filter);

  const addGoal = () => {
    if (!newTitle.trim()) return;
    setGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newTitle.trim(),
        category: newCategory.trim() || "General",
        status: "active",
        progress: 0,
        target: newTarget.trim() || "—",
        due: newDue.trim() || "—",
      },
    ]);
    setNewTitle(""); setNewCategory(""); setNewTarget(""); setNewDue("");
    setShowForm(false);
  };

  const updateProgress = (id: number, delta: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, progress: Math.min(100, Math.max(0, g.progress + delta)) } : g
      )
    );
  };

  const cycleStatus = (id: number) => {
    const order: Status[] = ["active", "paused", "completed"];
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const next = order[(order.indexOf(g.status) + 1) % order.length];
        return { ...g, status: next, progress: next === "completed" ? 100 : g.progress };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
            🎯 Goals
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
            {goals.filter((g) => g.status === "active").length} active &middot;{" "}
            {goals.filter((g) => g.status === "completed").length} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
        >
          + Add Goal
        </button>
      </div>

      {/* Add goal form */}
      {showForm && (
        <div
          className="rounded-xl p-5 space-y-3"
          style={{ backgroundColor: "#36393F", border: "1px solid #B0E0E6" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>New Goal</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { placeholder: "Goal title *", value: newTitle, set: setNewTitle },
              { placeholder: "Category (e.g. Fitness)", value: newCategory, set: setNewCategory },
              { placeholder: "Target (e.g. 5x/week)", value: newTarget, set: setNewTarget },
              { placeholder: "Due date (e.g. Apr 30)", value: newDue, set: setNewDue },
            ].map(({ placeholder, value, set }) => (
              <input
                key={placeholder}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #36393F" }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={addGoal}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
              style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
            >
              Save
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

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "active", "paused", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors"
            style={{
              backgroundColor: filter === f ? "#B0E0E6" : "#36393F",
              color: filter === f ? "#23262A" : "#9aa5b0",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Goals list */}
      <div className="space-y-3">
        {filtered.map((goal) => {
          const sc = statusColors[goal.status];
          return (
            <div
              key={goal.id}
              className="rounded-xl p-5 space-y-3"
              style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-semibold text-sm" style={{ color: "#B0E0E6" }}>
                    {goal.title}
                  </p>
                  <p className="text-xs" style={{ color: "#9aa5b0" }}>
                    {goal.category} &middot; Target: {goal.target} &middot; Due: {goal.due}
                  </p>
                </div>
                <button
                  onClick={() => cycleStatus(goal.id)}
                  className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: sc.bg, color: sc.text }}
                >
                  {sc.label}
                </button>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: "#7a8a95" }}>
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#23262A" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${goal.progress}%`,
                      backgroundColor: goal.progress === 100 ? "#B0E0E6" : "#8ACDD4",
                    }}
                  />
                </div>
              </div>

              {/* Progress controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => updateProgress(goal.id, -10)}
                  className="px-3 py-1 rounded text-xs hover:opacity-80"
                  style={{ backgroundColor: "#23262A", color: "#9aa5b0" }}
                >
                  −10%
                </button>
                <button
                  onClick={() => updateProgress(goal.id, 10)}
                  className="px-3 py-1 rounded text-xs hover:opacity-80"
                  style={{ backgroundColor: "#23262A", color: "#B0E0E6" }}
                >
                  +10%
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
