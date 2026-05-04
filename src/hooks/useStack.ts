"use client";

import { useState, useEffect } from "react";

export type StackStatus = "In Stock" | "Need to Order";

export interface StackItem {
  id: string;
  name: string;
  brand: string;
  timing: string;
  purchaseUrl: string;
  status: StackStatus;
  valdLinked: boolean;
  sectionId?: string;
}

export interface StackSection {
  id: string;
  name: string;
  color: string;
  collapsed: boolean;
}

const STORAGE_KEY   = "stack_items";
const SECTIONS_KEY  = "stack_sections";

const seed: StackItem[] = [
  { id: "s1",  name: "Creatine Monohydrate", brand: "Thorne",            timing: "5g · Post-Workout",         purchaseUrl: "https://www.amazon.com/s?k=thorne+creatine",              status: "In Stock",      valdLinked: false },
  { id: "s2",  name: "Whey Protein Isolate", brand: "Dymatize ISO100",   timing: "50g · Within 30 min post",  purchaseUrl: "https://www.amazon.com/s?k=dymatize+iso100",             status: "In Stock",      valdLinked: false },
  { id: "s3",  name: "Vitamin D3 + K2",      brand: "Thorne",            timing: "5000 IU · Morning w/ food", purchaseUrl: "https://www.amazon.com/s?k=thorne+vitamin+d3+k2",        status: "In Stock",      valdLinked: false },
  { id: "s4",  name: "Magnesium Glycinate",  brand: "Pure Encapsulations",timing: "400mg · Before bed",       purchaseUrl: "https://www.amazon.com/s?k=pure+encapsulations+magnesium",status: "In Stock",      valdLinked: false },
  { id: "s5",  name: "Fish Oil (Omega-3)",   brand: "Nordic Naturals",   timing: "2g EPA/DHA · With meal",    purchaseUrl: "https://www.amazon.com/s?k=nordic+naturals+omega+3",     status: "Need to Order", valdLinked: false },
  { id: "s6",  name: "Beta-Alanine",         brand: "NOW Sports",        timing: "3.2g · Pre-Workout",        purchaseUrl: "https://www.amazon.com/s?k=now+sports+beta+alanine",    status: "In Stock",      valdLinked: false },
  { id: "s7",  name: "Electrolytes",         brand: "LMNT",              timing: "1 packet · Intra-Workout",  purchaseUrl: "https://www.amazon.com/s?k=lmnt+electrolytes",           status: "In Stock",      valdLinked: false },
  { id: "s8",  name: "Ashwagandha (KSM-66)", brand: "Jarrow Formulas",   timing: "600mg · Evening",           purchaseUrl: "https://www.amazon.com/s?k=jarrow+ashwagandha+ksm+66",  status: "Need to Order", valdLinked: false },
  { id: "s9",  name: "Zinc + Copper",        brand: "Thorne",            timing: "15mg Zn / 1mg Cu · Night",  purchaseUrl: "https://www.amazon.com/s?k=thorne+zinc+copper",          status: "In Stock",      valdLinked: false },
  { id: "s10", name: "Pre-Workout (Stim)",   brand: "Gorilla Mode",      timing: "1 scoop · 20 min pre",      purchaseUrl: "https://www.amazon.com/s?k=gorilla+mode+pre+workout",   status: "In Stock",      valdLinked: false },
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useStack() {
  const [items,    setItems]    = useState<StackItem[]>(seed);
  const [sections, setSections] = useState<StackSection[]>([]);
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

  // ── items ──────────────────────────────────────────────
  const addItem = (data: Omit<StackItem, "id" | "valdLinked">) => {
    const item: StackItem = { ...data, id: uid("stack"), valdLinked: false };
    setItems((prev) => [item, ...prev]);
    return item.id;
  };

  const updateItem = (id: string, changes: Partial<Omit<StackItem, "id">>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: i.status === "In Stock" ? "Need to Order" : "In Stock" }
          : i
      )
    );
  };

  // ── sections ───────────────────────────────────────────
  const addSection = (name: string, color: string): string => {
    const sec: StackSection = { id: uid("sec"), name, color, collapsed: false };
    setSections((prev) => [...prev, sec]);
    return sec.id;
  };

  const updateSection = (id: string, changes: Partial<Omit<StackSection, "id">>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  };

  const deleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    setItems((prev) => prev.map((i) => i.sectionId === id ? { ...i, sectionId: undefined } : i));
  };

  const moveItemToSection = (itemId: string, sectionId: string | undefined) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, sectionId } : i)));
  };

  return { items, addItem, updateItem, deleteItem, toggleStatus, sections, addSection, updateSection, deleteSection, moveItemToSection };
}
