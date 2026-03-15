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
}

const STORAGE_KEY = "stack_peds";

const seed: PED[] = [
  {
    id: "ped1",
    name: "Testosterone Cypionate",
    dose: "200mg / week · E3.5D · IM",
    duration: "20 weeks",
    status: "Active",
    createdAt: "2026-01-15",
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
  const [items, setItems] = useState<PED[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const addItem = (data: Omit<PED, "id" | "createdAt">) => {
    const item: PED = { ...data, id: uid(), createdAt: today() };
    setItems((prev) => [item, ...prev]);
    return item.id;
  };

  const updateItem = (id: string, changes: Partial<Omit<PED, "id">>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return { items, addItem, updateItem, deleteItem };
}
