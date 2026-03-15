"use client";

import { useState, useEffect } from "react";

export type PeptideStatus = "In Stock" | "Need to Order";

export interface Peptide {
  id: string;
  name: string;
  brand: string;
  timing: string;
  cost: string;
  purchaseUrl: string;
  studyLinks: string[];
  status: PeptideStatus;
}

const STORAGE_KEY = "stack_peptides";

const seed: Peptide[] = [
  {
    id: "p1",
    name: "BPC-157",
    brand: "Limitless Life",
    timing: "250mcg · 2x daily · subq near injury",
    cost: "$45 / 5mg vial",
    purchaseUrl: "https://www.limitlesslifenootropics.com",
    studyLinks: [
      "https://pubmed.ncbi.nlm.nih.gov/30105375/",
      "https://pubmed.ncbi.nlm.nih.gov/24856298/",
    ],
    status: "In Stock",
  },
  {
    id: "p2",
    name: "TB-500 (Thymosin Beta-4)",
    brand: "Peptide Sciences",
    timing: "2mg · 2x / week · subq",
    cost: "$55 / 5mg vial",
    purchaseUrl: "https://www.peptidesciences.com",
    studyLinks: [
      "https://pubmed.ncbi.nlm.nih.gov/20385578/",
    ],
    status: "In Stock",
  },
  {
    id: "p3",
    name: "CJC-1295 / Ipamorelin",
    brand: "Core Peptides",
    timing: "100mcg / 100mcg · Before bed · subq",
    cost: "$60 / blend vial",
    purchaseUrl: "https://www.corepeptides.com",
    studyLinks: [
      "https://pubmed.ncbi.nlm.nih.gov/16352683/",
    ],
    status: "Need to Order",
  },
  {
    id: "p4",
    name: "GHK-Cu (Copper Peptide)",
    brand: "Limitless Life",
    timing: "2mg · 3x / week · subq or topical",
    cost: "$38 / 50mg",
    purchaseUrl: "https://www.limitlesslifenootropics.com",
    studyLinks: [
      "https://pubmed.ncbi.nlm.nih.gov/25855700/",
      "https://pubmed.ncbi.nlm.nih.gov/29144363/",
    ],
    status: "Need to Order",
  },
];

function uid() {
  return `pep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function usePeptides() {
  const [items, setItems] = useState<Peptide[]>(seed);
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

  const addItem = (data: Omit<Peptide, "id">) => {
    const item: Peptide = { ...data, id: uid() };
    setItems((prev) => [item, ...prev]);
    return item.id;
  };

  const updateItem = (id: string, changes: Partial<Omit<Peptide, "id">>) => {
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
