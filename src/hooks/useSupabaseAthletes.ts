"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type {
  Athlete, MacroBlock, PhaseDetail, ExerciseRow, BlockType, CheckInStatus,
  blockColors, blockDefaults,
} from "./useAthletes";

export type { Athlete, MacroBlock, PhaseDetail, ExerciseRow, BlockType, CheckInStatus };
export { blockColors, blockDefaults };

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// Supabase-backed replacement for useAthletes.
// Identical public interface — pages require no changes.
export function useAthletesDB() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [blocks, setBlocks]     = useState<MacroBlock[]>([]);
  const [phases, setPhases]     = useState<Record<string, PhaseDetail>>({});
  const [loading, setLoading]   = useState(true);

  const supabase = getSupabaseBrowserClient();

  const fetchAll = useCallback(async () => {
    const [{ data: aths }, { data: blks }] = await Promise.all([
      supabase.from("athletes").select("*").order("created_at"),
      supabase.from("macro_blocks").select("*").order("start_month"),
    ]);

    if (aths) {
      setAthletes(
        aths.map((r) => ({
          id: r.id,
          name: r.name,
          sport: r.sport ?? "",
          currentBlock: (r.current_block ?? "Hypertrophy") as BlockType,
          lastCheckIn: r.last_check_in ?? "",
          checkInStatus: (r.check_in_status ?? "pending") as CheckInStatus,
          goal: r.goal ?? "",
          program: r.program ?? "",
          notes: r.notes ?? "",
          bodyweight: r.bodyweight ?? "",
        }))
      );
    }

    if (blks) {
      setBlocks(
        blks.map((r) => ({
          id: r.id,
          athleteId: r.athlete_id,
          type: r.type as BlockType,
          startMonth: r.start_month,
          duration: r.duration,
          year: r.year ?? new Date().getFullYear(),
          label: r.label ?? "",
        }))
      );
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("athletes_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "athletes" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "macro_blocks" }, () => fetchAll())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll, supabase]);

  // Athletes CRUD
  const addAthlete = async (data: Omit<Athlete, "id">) => {
    const { data: row } = await supabase
      .from("athletes")
      .insert({
        name: data.name, sport: data.sport, current_block: data.currentBlock,
        last_check_in: data.lastCheckIn || null, check_in_status: data.checkInStatus,
        goal: data.goal, program: data.program, notes: data.notes, bodyweight: data.bodyweight,
      })
      .select()
      .single();
    return row?.id ?? uid("ath");
  };

  const updateAthlete = async (id: string, changes: Partial<Omit<Athlete, "id">>) => {
    const dbChanges: Record<string, unknown> = {};
    if (changes.name !== undefined)          dbChanges.name = changes.name;
    if (changes.sport !== undefined)         dbChanges.sport = changes.sport;
    if (changes.currentBlock !== undefined)  dbChanges.current_block = changes.currentBlock;
    if (changes.lastCheckIn !== undefined)   dbChanges.last_check_in = changes.lastCheckIn || null;
    if (changes.checkInStatus !== undefined) dbChanges.check_in_status = changes.checkInStatus;
    if (changes.goal !== undefined)          dbChanges.goal = changes.goal;
    if (changes.program !== undefined)       dbChanges.program = changes.program;
    if (changes.notes !== undefined)         dbChanges.notes = changes.notes;
    if (changes.bodyweight !== undefined)    dbChanges.bodyweight = changes.bodyweight;
    await supabase.from("athletes").update({ ...dbChanges, updated_at: new Date().toISOString() }).eq("id", id);
    setAthletes((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  };

  const deleteAthlete = async (id: string) => {
    await supabase.from("athletes").delete().eq("id", id);
    setAthletes((prev) => prev.filter((a) => a.id !== id));
    setBlocks((prev) => prev.filter((b) => b.athleteId !== id));
  };

  // Blocks CRUD
  const addBlock = async (data: Omit<MacroBlock, "id">) => {
    const { data: row } = await supabase
      .from("macro_blocks")
      .insert({ athlete_id: data.athleteId, type: data.type, start_month: data.startMonth, duration: data.duration, year: data.year, label: data.label })
      .select()
      .single();
    return row?.id ?? uid("mb");
  };

  const updateBlock = async (id: string, changes: Partial<Omit<MacroBlock, "id">>) => {
    const dbChanges: Record<string, unknown> = {};
    if (changes.type !== undefined)        dbChanges.type = changes.type;
    if (changes.startMonth !== undefined)  dbChanges.start_month = changes.startMonth;
    if (changes.duration !== undefined)    dbChanges.duration = changes.duration;
    if (changes.year !== undefined)        dbChanges.year = changes.year;
    if (changes.label !== undefined)       dbChanges.label = changes.label;
    await supabase.from("macro_blocks").update(dbChanges).eq("id", id);
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...changes } : b)));
  };

  const deleteBlock = async (id: string) => {
    await supabase.from("macro_blocks").delete().eq("id", id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setPhases((prev) => { const next = { ...prev }; delete next[id]; return next; });
  };

  // Phase detail (still client-side for now — can move to Supabase later)
  const getPhase = (blockId: string): PhaseDetail =>
    phases[blockId] ?? { blockId, notes: "", exercises: [] };

  const updatePhaseNotes = (blockId: string, notes: string) =>
    setPhases((prev) => ({ ...prev, [blockId]: { ...getPhase(blockId), notes } }));

  const addExercise = (blockId: string, week: number) => {
    const row: ExerciseRow = {
      id: uid("ex"), week, day: "Day 1", exercise: "", sets: "4", reps: "5", percentRM: "75%", notes: "",
    };
    setPhases((prev) => ({
      ...prev,
      [blockId]: { ...getPhase(blockId), exercises: [...getPhase(blockId).exercises, row] },
    }));
    return row.id;
  };

  const updateExercise = (blockId: string, rowId: string, changes: Partial<Omit<ExerciseRow, "id">>) =>
    setPhases((prev) => ({
      ...prev,
      [blockId]: {
        ...getPhase(blockId),
        exercises: getPhase(blockId).exercises.map((e) => (e.id === rowId ? { ...e, ...changes } : e)),
      },
    }));

  const deleteExercise = (blockId: string, rowId: string) =>
    setPhases((prev) => ({
      ...prev,
      [blockId]: {
        ...getPhase(blockId),
        exercises: getPhase(blockId).exercises.filter((e) => e.id !== rowId),
      },
    }));

  return {
    athletes, blocks, phases, loading,
    addAthlete, updateAthlete, deleteAthlete,
    addBlock, updateBlock, deleteBlock,
    getPhase, updatePhaseNotes, addExercise, updateExercise, deleteExercise,
  };
}
