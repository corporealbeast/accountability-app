"use client";

import { useState, useEffect } from "react";

export type PEDStatus = "Active" | "Planned" | "Completed";

export interface PED {
  id: string;
  name: string;
  dose: string;
  duration: string;
  status: PEDStatus;
  notes: string;
  createdAt: string;
  weekChecks: number[];
  sectionId?: string;
}

export interface PEDSection {
  id: string;
  name: string;
  color: string;
  collapsed: boolean;
}

const STORAGE_KEY  = "stack_peds";
const SECTIONS_KEY = "stack_peds_sections";

const seed: PED[] = [
  {
    id: "ped1",
    name: "Testosterone Cypionate",
    dose: "200mg / week · E3.5D · IM",
    duration: "20 weeks",
    status: "Active",
    createdAt: "2026-01-15",
    weekChecks: [],
    notes:
      "Week 1-4: Cruise / feel-out phase at 200mg. Week 5+: Maintain through CSM prep.\n\nBloodwork scheduled: Feb 15, Apr 1.\n\nSide management:\n- Anastrozole 0.25mg E3D if E2 climbs\n- Monitor BP weekly\n- Donate blood at week 10 if hematocrit >52%\n\nGoals: Maintain 260–270 lbs through competition season. Prioritize recovery over mass.",
  },
  {
    id: "ped2",
    name: "HCG",
    dose: "500 IU / 2x week · subq",
    duration: "Alongside TRT",
    status: "Active",
    createdAt: "2026-01-15",
    weekChecks: [],
    notes:
      "Running alongside Test Cyp to maintain testicular function and fertility.\n\nProtocol: 500 IU Monday + Thursday.\nStore refrigerated. Reconstitute with bacteriostatic water.\n\nMonitor: LH/FSH on bloodwork panel.",
  },
];

function uid() {
  return `ped-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

export function usePEDs() {
  const [items,    setItems]    = useState<PED[]>(seed);
  const [sections, setSections] = useState<PEDSection[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const si = localStorage.getItem(STORAGE_KEY);
      if (si) setItems(JSON.parse(si));
      const ss = localStorage.getItem(SECTIONS_KEY);
      if (ss) setSections(JSON.parse(ss));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections)); } catch {}
  }, [sections, hydrated]);

  const addItem = (data: Omit<PED, "id" | "createdAt" | "weekChecks">) => {
    const item: PED = { ...data, id: uid(), createdAt: today(), weekChecks: [] };
    setItems((prev) => [item, ...prev]);
    return item.id;
  };

  const updateItem = (id: string, changes: Partial<Omit<PED, "id">>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addSection = (name: string, color: string): string => {
    const sec: PEDSection = { id: `pedsec-${Date.now()}`, name, color, collapsed: false };
    setSections((prev) => [...prev, sec]);
    return sec.id;
  };

  const updateSection = (id: string, changes: Partial<Omit<PEDSection, "id">>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  };

  const deleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    setItems((prev) => prev.map((i) => i.sectionId === id ? { ...i, sectionId: undefined } : i));
  };

  const moveItemToSection = (itemId: string, sectionId: string | undefined) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, sectionId } : i)));
  };

  return { items, addItem, updateItem, deleteItem, sections, addSection, updateSection, deleteSection, moveItemToSection };
}
