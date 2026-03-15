"use client";

import { useState, useEffect } from "react";

export type EventStatus = "ready" | "caution" | "hold";

export interface StrongmanEvent {
  id: string;
  name: string;
  status: EventStatus;
  notes: string;
  currentBest: string;
  opener: string;
  goal: string;
  lastTrained: string;
}

export interface PeakDay {
  id: string;
  day: string;
  focus: string;
  load: string;
  isCompDay: boolean;
}

export interface PrepStats {
  competition: string;
  competitionSub: string;
  target: string;
  targetSub: string;
  weight: string;
  weightSub: string;
  injuryStatus: string;
  injurySub: string;
}

export interface InjuryAlert {
  title: string;
  body: string;
}

export interface StrongmanPrepData {
  stats: PrepStats;
  injuryAlert: InjuryAlert;
  events: StrongmanEvent[];
  peakWeek: PeakDay[];
}

const STORAGE_KEY = "strongman_prep";

const defaultData: StrongmanPrepData = {
  stats: {
    competition:    "March 28, 2026",
    competitionSub: "California's Strongest Man",
    target:         "Top 3",
    targetSub:      "California's Strongest",
    weight:         "260–270 lbs",
    weightSub:      "Competition bodyweight",
    injuryStatus:   "Monitoring",
    injurySub:      "Adductor / Gracilis",
  },
  injuryAlert: {
    title: "Adductor / Gracilis Strain — Under Monitoring",
    body:  "Reduce yoke and lateral loading this week. Prioritize recovery: contrast therapy, stretching, sleep. Re-assess Thursday. Competition cleared if no escalation.",
  },
  events: [
    { id: "e1", name: "Log / Frame Carry", status: "ready",   notes: "Strong. No limitations.",                   currentBest: "320 lbs log",  opener: "290 lbs",  goal: "305 lbs",  lastTrained: "2026-03-12" },
    { id: "e2", name: "Atlas Stones",       status: "ready",   notes: "Technique solid. Hit 400+ in training.",    currentBest: "420 lbs",      opener: "380 lbs",  goal: "420 lbs",  lastTrained: "2026-03-11" },
    { id: "e3", name: "Yoke Walk",          status: "caution", notes: "Adductor monitoring — reduce loading.",     currentBest: "700 lbs",      opener: "600 lbs",  goal: "650 lbs",  lastTrained: "2026-03-08" },
    { id: "e4", name: "Deadlift",           status: "ready",   notes: "685 opener planned.",                       currentBest: "725 lbs",      opener: "685 lbs",  goal: "705 lbs",  lastTrained: "2026-03-13" },
    { id: "e5", name: "Overhead Press",     status: "ready",   notes: "Log press — 275 target.",                   currentBest: "285 lbs",      opener: "265 lbs",  goal: "275 lbs",  lastTrained: "2026-03-10" },
  ],
  peakWeek: [
    { id: "pw1", day: "Mon Mar 23", focus: "Light technique work — events only", load: "50%",  isCompDay: false },
    { id: "pw2", day: "Tue Mar 24", focus: "Rest / contrast therapy",            load: "—",    isCompDay: false },
    { id: "pw3", day: "Wed Mar 25", focus: "Activation + openers",               load: "70%",  isCompDay: false },
    { id: "pw4", day: "Thu Mar 26", focus: "Full rest — travel prep",            load: "—",    isCompDay: false },
    { id: "pw5", day: "Fri Mar 27", focus: "Weigh-in + athlete meeting",         load: "—",    isCompDay: false },
    { id: "pw6", day: "Sat Mar 28", focus: "COMPETITION DAY",                    load: "💯",   isCompDay: true  },
  ],
};

function uid() {
  return `sm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useStrongmanPrep() {
  const [data, setData] = useState<StrongmanPrepData>(defaultData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setData(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [data, hydrated]);

  const updateStats = (changes: Partial<PrepStats>) =>
    setData((d) => ({ ...d, stats: { ...d.stats, ...changes } }));

  const updateInjuryAlert = (changes: Partial<InjuryAlert>) =>
    setData((d) => ({ ...d, injuryAlert: { ...d.injuryAlert, ...changes } }));

  const updateEvent = (id: string, changes: Partial<Omit<StrongmanEvent, "id">>) =>
    setData((d) => ({ ...d, events: d.events.map((e) => e.id === id ? { ...e, ...changes } : e) }));

  const addEvent = () => {
    const e: StrongmanEvent = { id: uid(), name: "New Event", status: "ready", notes: "", currentBest: "", opener: "", goal: "", lastTrained: "" };
    setData((d) => ({ ...d, events: [...d.events, e] }));
    return e.id;
  };

  const deleteEvent = (id: string) =>
    setData((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));

  const updatePeakDay = (id: string, changes: Partial<Omit<PeakDay, "id">>) =>
    setData((d) => ({ ...d, peakWeek: d.peakWeek.map((p) => p.id === id ? { ...p, ...changes } : p) }));

  const addPeakDay = () => {
    const p: PeakDay = { id: uid(), day: "New Day", focus: "", load: "—", isCompDay: false };
    setData((d) => ({ ...d, peakWeek: [...d.peakWeek, p] }));
  };

  const deletePeakDay = (id: string) =>
    setData((d) => ({ ...d, peakWeek: d.peakWeek.filter((p) => p.id !== id) }));

  return { data, updateStats, updateInjuryAlert, updateEvent, addEvent, deleteEvent, updatePeakDay, addPeakDay, deletePeakDay };
}
