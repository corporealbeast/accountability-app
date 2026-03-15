"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Set {
  weight: string;
  reps: string;
}

interface Exercise {
  id: number;
  name: string;
  sets: Set[];
}

interface Workout {
  id: number;
  name: string;
  date: string;
  duration: string;
  exercises: Exercise[];
}

const seedWorkouts: Workout[] = [
  {
    id: 1,
    name: "Push Day — Chest & Tris",
    date: "2026-03-14",
    duration: "58 min",
    exercises: [
      { id: 1, name: "Bench Press", sets: [{ weight: "225", reps: "5" }, { weight: "225", reps: "5" }, { weight: "205", reps: "8" }] },
      { id: 2, name: "Incline DB Press", sets: [{ weight: "80", reps: "10" }, { weight: "80", reps: "9" }, { weight: "75", reps: "10" }] },
      { id: 3, name: "Tricep Pushdown", sets: [{ weight: "60", reps: "12" }, { weight: "60", reps: "12" }, { weight: "55", reps: "15" }] },
    ],
  },
  {
    id: 2,
    name: "Legs — Squat Focus",
    date: "2026-03-13",
    duration: "61 min",
    exercises: [
      { id: 1, name: "Back Squat", sets: [{ weight: "315", reps: "5" }, { weight: "315", reps: "5" }, { weight: "295", reps: "8" }] },
      { id: 2, name: "Romanian Deadlift", sets: [{ weight: "225", reps: "10" }, { weight: "225", reps: "10" }, { weight: "225", reps: "10" }] },
      { id: 3, name: "Leg Press", sets: [{ weight: "450", reps: "12" }, { weight: "450", reps: "12" }] },
    ],
  },
  {
    id: 3,
    name: "Pull Day — Back & Bis",
    date: "2026-03-12",
    duration: "49 min",
    exercises: [
      { id: 1, name: "Deadlift", sets: [{ weight: "365", reps: "5" }, { weight: "365", reps: "3" }] },
      { id: 2, name: "Pull-ups", sets: [{ weight: "BW", reps: "10" }, { weight: "BW", reps: "8" }, { weight: "BW", reps: "7" }] },
      { id: 3, name: "Barbell Row", sets: [{ weight: "185", reps: "8" }, { weight: "185", reps: "8" }, { weight: "175", reps: "10" }] },
    ],
  },
];

const templates = ["Push Day", "Pull Day", "Leg Day", "Upper Power", "Lower Power", "Full Body"];

function blankExercise(id: number): Exercise {
  return { id, name: "", sets: [{ weight: "", reps: "" }] };
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>("sc_workouts", seedWorkouts);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [showLogger, setShowLogger] = useState(false);

  // Logger state
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([blankExercise(1)]);

  const toggleExpand = (id: number) => setExpanded((v) => (v === id ? null : id));

  const addExercise = () =>
    setExercises((prev) => [...prev, blankExercise(Date.now())]);

  const updateExerciseName = (id: number, name: string) =>
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, name } : e)));

  const addSet = (exId: number) =>
    setExercises((prev) =>
      prev.map((e) => (e.id === exId ? { ...e, sets: [...e.sets, { weight: "", reps: "" }] } : e))
    );

  const updateSet = (exId: number, si: number, field: keyof Set, val: string) =>
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exId
          ? { ...e, sets: e.sets.map((s, i) => (i === si ? { ...s, [field]: val } : s)) }
          : e
      )
    );

  const removeExercise = (id: number) =>
    setExercises((prev) => prev.filter((e) => e.id !== id));

  const saveWorkout = () => {
    if (!workoutName.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    setWorkouts((prev) => [
      {
        id: Date.now(),
        name: workoutName.trim(),
        date: today,
        duration: duration.trim() || "—",
        exercises: exercises.filter((e) => e.name.trim()),
      },
      ...prev,
    ]);
    setWorkoutName(""); setDuration("");
    setExercises([blankExercise(1)]);
    setShowLogger(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
            🏋️ Workouts
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
            {workouts.length} sessions logged
          </p>
        </div>
        <button
          onClick={() => setShowLogger((v) => !v)}
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
        >
          + Log Workout
        </button>
      </div>

      {/* Workout logger */}
      {showLogger && (
        <div
          className="rounded-xl p-6 space-y-5"
          style={{ backgroundColor: "#36393F", border: "1px solid #B0E0E6" }}
        >
          <p className="font-semibold" style={{ color: "#B0E0E6" }}>New Workout</p>

          {/* Templates */}
          <div>
            <p className="text-xs mb-2" style={{ color: "#7a8a95" }}>Quick template</p>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <button
                  key={t}
                  onClick={() => setWorkoutName(t)}
                  className="px-3 py-1 rounded text-xs hover:opacity-80"
                  style={{ backgroundColor: "#23262A", color: "#9aa5b0" }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs mb-1" style={{ color: "#7a8a95" }}>Workout name *</p>
              <input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g. Push Day"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
              />
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: "#7a8a95" }}>Duration</p>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 55 min"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
              />
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>Exercises</p>
            {exercises.map((ex, ei) => (
              <div
                key={ex.id}
                className="rounded-lg p-4 space-y-3"
                style={{ backgroundColor: "#23262A" }}
              >
                <div className="flex gap-2 items-center">
                  <input
                    value={ex.name}
                    onChange={(e) => updateExerciseName(ex.id, e.target.value)}
                    placeholder={`Exercise ${ei + 1} name`}
                    className="flex-1 px-3 py-2 rounded text-sm outline-none"
                    style={{ backgroundColor: "#36393F", color: "#B0E0E6", border: "1px solid #2C2F33" }}
                  />
                  {exercises.length > 1 && (
                    <button
                      onClick={() => removeExercise(ex.id)}
                      className="text-xs px-2 py-1 rounded hover:opacity-80"
                      style={{ color: "#9aa5b0", backgroundColor: "#36393F" }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Sets */}
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs" style={{ color: "#7a8a95" }}>
                    <span>Set</span><span>Weight</span><span>Reps</span>
                  </div>
                  {ex.sets.map((s, si) => (
                    <div key={si} className="grid grid-cols-3 gap-2 items-center">
                      <span className="text-xs" style={{ color: "#7a8a95" }}>{si + 1}</span>
                      <input
                        value={s.weight}
                        onChange={(e) => updateSet(ex.id, si, "weight", e.target.value)}
                        placeholder="lbs"
                        className="px-2 py-1.5 rounded text-sm outline-none"
                        style={{ backgroundColor: "#36393F", color: "#B0E0E6", border: "1px solid #2C2F33" }}
                      />
                      <input
                        value={s.reps}
                        onChange={(e) => updateSet(ex.id, si, "reps", e.target.value)}
                        placeholder="reps"
                        className="px-2 py-1.5 rounded text-sm outline-none"
                        style={{ backgroundColor: "#36393F", color: "#B0E0E6", border: "1px solid #2C2F33" }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addSet(ex.id)}
                    className="text-xs hover:opacity-80"
                    style={{ color: "#8ACDD4" }}
                  >
                    + Add set
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addExercise}
              className="text-sm hover:opacity-80"
              style={{ color: "#8ACDD4" }}
            >
              + Add exercise
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={saveWorkout}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
              style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
            >
              Save Workout
            </button>
            <button
              onClick={() => setShowLogger(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
              style={{ backgroundColor: "#23262A", color: "#9aa5b0" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Workout history */}
      <div className="space-y-3">
        {workouts.map((w) => (
          <div
            key={w.id}
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
          >
            {/* Header row */}
            <button
              onClick={() => toggleExpand(w.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>{w.name}</p>
                <p className="text-xs" style={{ color: "#9aa5b0" }}>
                  {w.date} · {w.duration} · {w.exercises.length} exercises
                </p>
              </div>
              <span
                className="text-lg transition-transform duration-200"
                style={{
                  color: "#7a8a95",
                  display: "inline-block",
                  transform: expanded === w.id ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                ›
              </span>
            </button>

            {/* Expanded exercise detail */}
            {expanded === w.id && (
              <div
                className="px-5 pb-5 space-y-4 border-t"
                style={{ borderColor: "#2C2F33" }}
              >
                {w.exercises.map((ex) => {
                  const totalVol = ex.sets.reduce((acc, s) => {
                    const w = parseFloat(s.weight) || 0;
                    const r = parseFloat(s.reps) || 0;
                    return acc + w * r;
                  }, 0);
                  return (
                    <div key={ex.id} className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium" style={{ color: "#B0E0E6" }}>{ex.name}</p>
                        {totalVol > 0 && (
                          <span className="text-xs" style={{ color: "#8ACDD4" }}>
                            {totalVol.toLocaleString()} lbs vol
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="grid grid-cols-3 gap-2 text-xs mb-1" style={{ color: "#7a8a95" }}>
                          <span>Set</span><span>Weight</span><span>Reps</span>
                        </div>
                        {ex.sets.map((s, si) => (
                          <div key={si} className="grid grid-cols-3 gap-2 text-sm">
                            <span style={{ color: "#7a8a95" }}>{si + 1}</span>
                            <span style={{ color: "#9aa5b0" }}>{s.weight} lbs</span>
                            <span style={{ color: "#9aa5b0" }}>{s.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
