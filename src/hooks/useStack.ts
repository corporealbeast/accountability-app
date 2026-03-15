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
}

const STORAGE_KEY = "stack_items";

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

function uid() {
  return `stack-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useStack() {
  const [items, setItems] = useState<StackItem[]>(seed);
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

  const addItem = (data: Omit<StackItem, "id" | "valdLinked">) => {
    const item: StackItem = { ...data, id: uid(), valdLinked: false };
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

  return { items, addItem, updateItem, deleteItem, toggleStatus };
}
