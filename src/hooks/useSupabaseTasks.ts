"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { OdinTask, TaskStatus, TaskCategory, TaskPriority } from "./useOdinTasks";

export type { OdinTask, TaskStatus, TaskCategory, TaskPriority };

// Supabase-backed replacement for useOdinTasks.
// Identical public interface — pages require no changes.
export function useOdinTasksDB() {
  const [tasks, setTasks] = useState<OdinTask[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from("odin_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setTasks(
        data.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description ?? "",
          category: r.category as TaskCategory,
          status: r.status as TaskStatus,
          priority: r.priority as TaskPriority,
          createdAt: r.created_at?.split("T")[0] ?? "",
        }))
      );
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel("odin_tasks_rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "odin_tasks" },
        () => fetchTasks()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchTasks, supabase]);

  const moveTask = async (id: string, status: TaskStatus) => {
    await supabase
      .from("odin_tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const addTask = async (data: Omit<OdinTask, "id" | "createdAt">) => {
    const { data: row } = await supabase
      .from("odin_tasks")
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        priority: data.priority,
        source: "manual",
      })
      .select()
      .single();
    return row?.id ?? "";
  };

  const deleteTask = async (id: string) => {
    await supabase.from("odin_tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, loading, moveTask, addTask, deleteTask };
}
