"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface FoodEntry {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: Meal;
  time: string;
}

type Meal = "Breakfast" | "Lunch" | "Dinner" | "Snack";

const meals: Meal[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

const seedEntries: FoodEntry[] = [
  { id: 1, name: "Eggs (4 whole)", calories: 280, protein: 24, carbs: 2, fat: 20, meal: "Breakfast", time: "7:00 AM" },
  { id: 2, name: "Oats (1 cup cooked)", calories: 150, protein: 5, carbs: 27, fat: 3, meal: "Breakfast", time: "7:05 AM" },
  { id: 3, name: "Greek Yogurt (1 cup)", calories: 130, protein: 17, carbs: 9, fat: 0, meal: "Breakfast", time: "7:10 AM" },
  { id: 4, name: "Chicken Breast (8oz)", calories: 370, protein: 70, carbs: 0, fat: 8, meal: "Lunch", time: "12:30 PM" },
  { id: 5, name: "White Rice (1 cup)", calories: 200, protein: 4, carbs: 44, fat: 0, meal: "Lunch", time: "12:30 PM" },
  { id: 6, name: "Broccoli (2 cups)", calories: 60, protein: 5, carbs: 12, fat: 0, meal: "Lunch", time: "12:35 PM" },
  { id: 7, name: "Protein Shake", calories: 160, protein: 30, carbs: 8, fat: 3, meal: "Snack", time: "3:30 PM" },
  { id: 8, name: "Steak (8oz)", calories: 480, protein: 48, carbs: 0, fat: 30, meal: "Dinner", time: "7:00 PM" },
  { id: 9, name: "Sweet Potato (1 large)", calories: 180, protein: 4, carbs: 41, fat: 0, meal: "Dinner", time: "7:05 PM" },
  { id: 10, name: "Mixed Greens Salad", calories: 80, protein: 3, carbs: 8, fat: 4, meal: "Dinner", time: "7:10 PM" },
];

const goals = { calories: 2900, protein: 220, carbs: 350, fat: 90 };

const mealIcons: Record<Meal, string> = {
  Breakfast: "🌅",
  Lunch: "☀️",
  Dinner: "🌙",
  Snack: "⚡",
};

export default function NutritionPage() {
  const [entries, setEntries] = useLocalStorage<FoodEntry[]>("ps_nutrition", seedEntries);
  const [showForm, setShowForm] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal>("Breakfast");
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const addEntry = () => {
    if (!name.trim() || !calories) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: name.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        meal: selectedMeal,
        time: now,
      },
    ]);
    setName(""); setCalories(""); setProtein(""); setCarbs(""); setFat("");
    setShowForm(false);
  };

  const removeEntry = (id: number) => setEntries((prev) => prev.filter((e) => e.id !== id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
            🥗 Nutrition
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
            Track meals and hit your macro targets.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
        >
          + Add Food
        </button>
      </div>

      {/* Daily totals */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest" style={{ color: "#7a8a95" }}>Today&apos;s Totals</p>
          <p className="text-xs" style={{ color: "#8ACDD4" }}>
            {totals.calories} / {goals.calories} kcal
          </p>
        </div>

        {/* Calorie bar */}
        <div>
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#23262A" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((totals.calories / goals.calories) * 100, 100)}%`,
                backgroundColor: totals.calories > goals.calories ? "#e6c87a" : "#B0E0E6",
              }}
            />
          </div>
        </div>

        {/* Macro bars */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Protein", cur: totals.protein, goal: goals.protein, unit: "g", color: "#B0E0E6" },
            { label: "Carbs", cur: totals.carbs, goal: goals.carbs, unit: "g", color: "#8ACDD4" },
            { label: "Fat", cur: totals.fat, goal: goals.fat, unit: "g", color: "#9aa5b0" },
          ].map((m) => {
            const pct = Math.min(Math.round((m.cur / m.goal) * 100), 100);
            return (
              <div key={m.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#9aa5b0" }}>{m.label}</span>
                  <span style={{ color: m.color }}>{m.cur}g</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#23262A" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                </div>
                <p className="text-xs text-right" style={{ color: "#7a8a95" }}>{m.goal - m.cur > 0 ? `${m.goal - m.cur}g left` : "Done"}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add food form */}
      {showForm && (
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ backgroundColor: "#36393F", border: "1px solid #B0E0E6" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>Log Food</p>

          {/* Meal selector */}
          <div className="flex gap-2 flex-wrap">
            {meals.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMeal(m)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: selectedMeal === m ? "#B0E0E6" : "#23262A",
                  color: selectedMeal === m ? "#23262A" : "#9aa5b0",
                }}
              >
                {mealIcons[m]} {m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Food name *"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
              />
            </div>
            {[
              { placeholder: "Calories *", value: calories, set: setCalories },
              { placeholder: "Protein (g)", value: protein, set: setProtein },
              { placeholder: "Carbs (g)", value: carbs, set: setCarbs },
              { placeholder: "Fat (g)", value: fat, set: setFat },
            ].map(({ placeholder, value, set }) => (
              <input
                key={placeholder}
                type="number"
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={addEntry}
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

      {/* Meals grouped */}
      {meals.map((meal) => {
        const mealEntries = entries.filter((e) => e.meal === meal);
        if (mealEntries.length === 0) return null;
        const mealCals = mealEntries.reduce((a, e) => a + e.calories, 0);
        const mealProtein = mealEntries.reduce((a, e) => a + e.protein, 0);

        return (
          <div key={meal}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>
                {mealIcons[meal]} {meal}
              </h2>
              <span className="text-xs" style={{ color: "#7a8a95" }}>
                {mealCals} kcal · {mealProtein}g protein
              </span>
            </div>
            <div
              className="rounded-xl divide-y overflow-hidden"
              style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
            >
              {mealEntries.map((e) => (
                <div key={e.id} className="flex items-center justify-between px-5 py-3 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm" style={{ color: "#B0E0E6" }}>{e.name}</p>
                    <p className="text-xs" style={{ color: "#9aa5b0" }}>
                      P: {e.protein}g · C: {e.carbs}g · F: {e.fat}g
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium" style={{ color: "#8ACDD4" }}>
                      {e.calories} kcal
                    </span>
                    <button
                      onClick={() => removeEntry(e.id)}
                      className="text-xs hover:opacity-80"
                      style={{ color: "#7a8a95" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
