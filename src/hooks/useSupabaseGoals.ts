"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export type GoalStatus = "active" | "paused" | "completed";

export interface Goal {
  id: string;
  title: string;
  category: string;
  status: GoalStatus;
  progress: number;
  target?: string;
  due?: string;
  createdAt: string;
}

export function useSupabaseGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const fetchGoals = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setGoals(
        data.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category ?? "",
          status: r.status as GoalStatus,
          progress: r.progress ?? 0,
          target: r.target ?? undefined,
          due: r.due ?? undefined,
          createdAt: r.created_at?.split("T")[0] ?? "",
        }))
      );
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    fetchGoals();

    const channel = supabase
      .channel("goals_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "goals" }, () => fetchGoals())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchGoals, supabase]);

  const addGoal = async (data: Omit<Goal, "id" | "createdAt">) => {
    if (!supabase) return "";
    const { data: row } = await supabase
      .from("goals")
      .insert({ title: data.title, category: data.category, status: data.status, progress: data.progress, target: data.target, due: data.due })
      .select()
      .single();
    return row?.id ?? "";
  };

  const updateGoal = async (id: string, changes: Partial<Omit<Goal, "id" | "createdAt">>) => {
    if (!supabase) return;
    await supabase
      .from("goals")
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq("id", id);
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...changes } : g)));
  };

  const deleteGoal = async (id: string) => {
    if (!supabase) return;
    await supabase.from("goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const cycleStatus = async (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const next: GoalStatus = goal.status === "active" ? "paused" : goal.status === "paused" ? "completed" : "active";
    await updateGoal(id, { status: next });
  };

  return { goals, loading, addGoal, updateGoal, deleteGoal, cycleStatus };
}
