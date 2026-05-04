"use client";

import { useState, useEffect } from "react";

export interface BloodworkEntry {
  id: string;
  title: string;
  date: string;
  lab: string;
  nextDate: string;
  notes: string;
  fileName: string;
  fileType: string;
  fileData: string; // base64
  createdAt: string;
}

const STORAGE_KEY = "stack_bloodwork";

function uid() {
  return `bw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

export function useBloodwork() {
  const [items, setItems] = useState<BloodworkEntry[]>([]);
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
    } catch (e) {
      console.warn("Bloodwork storage error (file may be too large):", e);
    }
  }, [items, hydrated]);

  const addItem = (data: Omit<BloodworkEntry, "id" | "createdAt">) => {
    const item: BloodworkEntry = { ...data, id: uid(), createdAt: today() };
    setItems((prev) => [item, ...prev]);
    return item.id;
  };

  const updateItem = (id: string, changes: Partial<Omit<BloodworkEntry, "id">>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return { items, addItem, updateItem, deleteItem };
}
