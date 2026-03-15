"use client";

import { useState, useEffect } from "react";

export type BlockType = "Hypertrophy" | "Strength" | "Peaking" | "Deload" | "Transition";
export type CheckInStatus = "checked-in" | "missed" | "pending";
export type ProgramBlock = BlockType;

export interface Athlete {
  id: string;
  name: string;
  sport: string;
  currentBlock: ProgramBlock;
  lastCheckIn: string; // ISO date
  checkInStatus: CheckInStatus;
  goal: string;
  program: string;
  notes: string;
  bodyweight: string;
}

export interface MacroBlock {
  id: string;
  athleteId: string;
  type: BlockType;
  startMonth: number; // 0–11
  duration: number;   // months, 1–6
  year: number;
  label: string;
}

export const blockColors: Record<BlockType, string> = {
  Hypertrophy: "#9370DB",
  Strength:    "#4D94FF",
  Peaking:     "#FFD700",
  Deload:      "#7a8a95",
  Transition:  "#FF8C00",
};

export const blockDefaults: Record<BlockType, { duration: number; desc: string }> = {
  Hypertrophy: { duration: 3, desc: "Volume accumulation, muscle building" },
  Strength:    { duration: 3, desc: "Intensity focus, max effort work" },
  Peaking:     { duration: 2, desc: "Competition prep, taper & peak" },
  Deload:      { duration: 1, desc: "Recovery, reduced intensity" },
  Transition:  { duration: 1, desc: "Off-season, general fitness" },
};

const ATHLETES_KEY = "pp_athletes";
const BLOCKS_KEY   = "pp_blocks";

const seedAthletes: Athlete[] = [
  {
    id: "ath1",
    name: "Marcus Webb",
    sport: "Strongman",
    currentBlock: "Peaking",
    lastCheckIn: "2026-03-14",
    checkInStatus: "checked-in",
    goal: "California's Strongest Man — March 28",
    program: "12-Week CSM Peak",
    bodyweight: "265 lbs",
    notes: "Week 11 of peaking block. Adductor strain — cleared for yoke and deadlift at 80%. Opener on log: 290. Atlas stones feeling sharp.",
  },
  {
    id: "ath2",
    name: "Derek Harmon",
    sport: "Powerlifting",
    currentBlock: "Strength",
    lastCheckIn: "2026-03-10",
    checkInStatus: "missed",
    goal: "USPA Nationals — 275 class",
    program: "Conjugate Strength Block",
    bodyweight: "270 lbs",
    notes: "Missed last check-in. Follow up required. Squat velocity dropping — may need to deload week early.",
  },
  {
    id: "ath3",
    name: "Sophia Martinez",
    sport: "Strongman",
    currentBlock: "Hypertrophy",
    lastCheckIn: "2026-03-15",
    checkInStatus: "checked-in",
    goal: "WSM Amateur 2026",
    program: "16-Week Base Build",
    bodyweight: "198 lbs",
    notes: "Excellent compliance. Volume tolerance is high — added extra GPP session. On track for 215 lbs by peaking phase.",
  },
  {
    id: "ath4",
    name: "Jake Rutherford",
    sport: "Weightlifting",
    currentBlock: "Deload",
    lastCheckIn: "2026-03-13",
    checkInStatus: "checked-in",
    goal: "American Open 2026",
    program: "Olympic Peak Prep",
    bodyweight: "231 lbs",
    notes: "Coming off 6-week strength block. Deload week 1 of 2. Snatch technique cleaned up — hit 155kg in training.",
  },
];

const seedBlocks: MacroBlock[] = [
  // Marcus Webb — CSM 2026
  { id: "mb1",  athleteId: "ath1", type: "Hypertrophy", startMonth: 0,  duration: 3, year: 2026, label: "Base Build" },
  { id: "mb2",  athleteId: "ath1", type: "Strength",    startMonth: 3,  duration: 3, year: 2026, label: "Strength" },
  { id: "mb3",  athleteId: "ath1", type: "Peaking",     startMonth: 6,  duration: 2, year: 2026, label: "CSM Peak" },
  { id: "mb4",  athleteId: "ath1", type: "Transition",  startMonth: 8,  duration: 1, year: 2026, label: "Off-Season" },
  { id: "mb5",  athleteId: "ath1", type: "Hypertrophy", startMonth: 9,  duration: 3, year: 2026, label: "Fall Build" },
  // Derek Harmon — USPA Nationals
  { id: "mb6",  athleteId: "ath2", type: "Hypertrophy", startMonth: 0,  duration: 2, year: 2026, label: "Hypertrophy" },
  { id: "mb7",  athleteId: "ath2", type: "Strength",    startMonth: 2,  duration: 4, year: 2026, label: "Conjugate" },
  { id: "mb8",  athleteId: "ath2", type: "Peaking",     startMonth: 6,  duration: 3, year: 2026, label: "USPA Peak" },
  { id: "mb9",  athleteId: "ath2", type: "Deload",      startMonth: 9,  duration: 1, year: 2026, label: "Deload" },
  { id: "mb10", athleteId: "ath2", type: "Transition",  startMonth: 10, duration: 2, year: 2026, label: "Transition" },
  // Sophia Martinez — WSM Amateur
  { id: "mb11", athleteId: "ath3", type: "Hypertrophy", startMonth: 0,  duration: 4, year: 2026, label: "Base Build" },
  { id: "mb12", athleteId: "ath3", type: "Strength",    startMonth: 4,  duration: 3, year: 2026, label: "Strength" },
  { id: "mb13", athleteId: "ath3", type: "Peaking",     startMonth: 7,  duration: 2, year: 2026, label: "WSM Peak" },
  { id: "mb14", athleteId: "ath3", type: "Deload",      startMonth: 9,  duration: 1, year: 2026, label: "Deload" },
  // Jake Rutherford — American Open
  { id: "mb15", athleteId: "ath4", type: "Strength",    startMonth: 0,  duration: 3, year: 2026, label: "Strength" },
  { id: "mb16", athleteId: "ath4", type: "Peaking",     startMonth: 3,  duration: 3, year: 2026, label: "American Open" },
  { id: "mb17", athleteId: "ath4", type: "Deload",      startMonth: 6,  duration: 1, year: 2026, label: "Deload" },
  { id: "mb18", athleteId: "ath4", type: "Hypertrophy", startMonth: 7,  duration: 3, year: 2026, label: "Hypertrophy" },
  { id: "mb19", athleteId: "ath4", type: "Strength",    startMonth: 10, duration: 2, year: 2026, label: "Strength" },
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useAthletes() {
  const [athletes, setAthletes] = useState<Athlete[]>(seedAthletes);
  const [blocks, setBlocks]     = useState<MacroBlock[]>(seedBlocks);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const a = localStorage.getItem(ATHLETES_KEY);
      const b = localStorage.getItem(BLOCKS_KEY);
      if (a) setAthletes(JSON.parse(a));
      if (b) setBlocks(JSON.parse(b));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ATHLETES_KEY, JSON.stringify(athletes));
      localStorage.setItem(BLOCKS_KEY,   JSON.stringify(blocks));
    } catch {}
  }, [athletes, blocks, hydrated]);

  // Athletes CRUD
  const addAthlete = (data: Omit<Athlete, "id">) => {
    const a: Athlete = { ...data, id: uid("ath") };
    setAthletes((prev) => [...prev, a]);
    return a.id;
  };
  const updateAthlete = (id: string, changes: Partial<Omit<Athlete, "id">>) =>
    setAthletes((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
  const deleteAthlete = (id: string) => {
    setAthletes((prev) => prev.filter((a) => a.id !== id));
    setBlocks((prev) => prev.filter((b) => b.athleteId !== id));
  };

  // Blocks CRUD
  const addBlock = (data: Omit<MacroBlock, "id">) => {
    const b: MacroBlock = { ...data, id: uid("mb") };
    setBlocks((prev) => [...prev, b]);
    return b.id;
  };
  const updateBlock = (id: string, changes: Partial<Omit<MacroBlock, "id">>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...changes } : b)));
  const deleteBlock = (id: string) =>
    setBlocks((prev) => prev.filter((b) => b.id !== id));

  return { athletes, blocks, addAthlete, updateAthlete, deleteAthlete, addBlock, updateBlock, deleteBlock };
}
