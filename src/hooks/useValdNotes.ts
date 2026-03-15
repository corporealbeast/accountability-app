"use client";

import { useState, useEffect } from "react";

export type Category =
  | "Strongman"
  | "Personal Life"
  | "Learning"
  | "Ethics"
  | "Development"
  | "Health"
  | "Firefighter"
  | "Business";

export const categoryColors: Record<Category, string> = {
  Strongman:      "#FFD700",
  "Personal Life":"#FF8C00",
  Learning:       "#9370DB",
  Ethics:         "#F0E68C",
  Development:    "#32CD32",
  Health:         "#20B2AA",
  Firefighter:    "#FF4D4D",
  Business:       "#4D94FF",
};

export const categories = Object.keys(categoryColors) as Category[];

export interface ValdNote {
  id: string;
  title: string;
  content: string;
  category: Category;
  parentId: string | null;
  links: string[];
}

const STORAGE_KEY = "vald_notes";

const seed: ValdNote[] = [
  { id: "v1",  title: "Strongman Foundation",    category: "Strongman",      parentId: null, links: ["v2", "v7"],  content: "Core principles of strongman training.\n\n- Max strength is king\n- Events skill is 30% of the equation\n- [[Recovery Protocol]] is non-negotiable at this level\n- Competition mindset: [[California's Strongest Man]]" },
  { id: "v2",  title: "California's Strongest Man", category: "Strongman",   parentId: null, links: ["v1"],        content: "March 28, 2026\nWeight: 260–270 lbs\nStatus: Monitoring Adductor/Gracilis Strain\n\nEvents:\n- Log/Frame Carry\n- Atlas Stones\n- Yoke Walk ← monitor adductor\n- Deadlift (685 opener)\n- Overhead Press (275 target)\n\nRelated: [[Strongman Foundation]]" },
  { id: "v3",  title: "Recovery Protocol",        category: "Health",         parentId: null, links: ["v1", "v8"],  content: "Daily recovery stack:\n- 8h sleep minimum\n- Contrast therapy (hot/cold)\n- [[Nutrition Timing]] around training\n- HRV tracking — target 60+ ms\n\nInjury management: [[Adductor Rehab]]" },
  { id: "v4",  title: "Adductor Rehab",           category: "Health",         parentId: null, links: ["v3"],        content: "Gracilis/Adductor strain — Grade 1\n\nProtocol:\n- No lateral loading for 1 week\n- Contrast therapy 2x daily\n- Light stretching only\n- Re-assess Thursday March 20\n\nClearance criteria: pain-free through full ROM under load" },
  { id: "v5",  title: "GrayRevenue Strategy",     category: "Business",       parentId: null, links: ["v6", "v12"], content: "Current MRR: $7,240\nGoal: $10,000 by April 30\n\nPrimary levers:\n1. SaaS growth (~$400/mo)\n2. Raise coaching rates\n3. [[Digital Products Launch]]\n\nRelated: [[Accountability App]]" },
  { id: "v6",  title: "Accountability App",        category: "Business",       parentId: null, links: ["v5"],        content: "SaaS product — core revenue driver.\nMRR: $2,800 | Goal: $5,000\n\nPriorities:\n- Reduce churn\n- Improve onboarding\n- Referral program\n- Annual pricing\n\nBuilt with: [[Development Stack]]" },
  { id: "v7",  title: "Firefighter Training",      category: "Firefighter",    parentId: null, links: ["v1", "v3"],  content: "Integration with strongman training:\n- Cardiovascular base must stay high\n- Grip endurance critical for both\n- [[Recovery Protocol]] shared principles\n\nCurrent certifications: FF1, EMT-B\nNext: Hazmat Operations" },
  { id: "v8",  title: "Nutrition Timing",          category: "Health",         parentId: null, links: ["v3"],        content: "Peri-workout nutrition:\n- Pre: 50g carbs + 30g protein (90 min out)\n- Intra: 60g carbs for sessions >60 min\n- Post: 50g protein + 80g carbs within 30 min\n\nCalorie target: 4,200–4,800 on training days\nBody weight: 260–270 lbs" },
  { id: "v9",  title: "Deep Work System",          category: "Learning",       parentId: null, links: ["v10", "v6"], content: "90-minute focused blocks — no phone, no interruptions.\n\nSchedule:\n- 6am–7:30am: Block 1 (highest leverage task)\n- 10am–11:30am: Block 2 (building/coding)\n- Evening: Light review only\n\nCurrent reading: [[Atomic Habits Notes]]" },
  { id: "v10", title: "Atomic Habits Notes",       category: "Learning",       parentId: null, links: ["v9"],        content: "Key takeaways:\n- Identity-based habits > outcome-based\n- 1% better every day = 37x better in a year\n- Habit stacking: After [current habit] I will [new habit]\n\nApplications:\n- Morning routine locked in\n- [[Deep Work System]] scheduled daily" },
  { id: "v11", title: "Core Values",               category: "Ethics",         parentId: null, links: ["v7", "v1"],  content: "1. Integrity — do what you said you'd do\n2. Discipline — show up regardless of feeling\n3. Service — firefighter ethos, community first\n4. Growth — never stop learning\n5. Accountability — own outcomes\n\nThese guide [[GrayRevenue Strategy]] and [[Strongman Foundation]]" },
  { id: "v12", title: "Digital Products Launch",   category: "Business",       parentId: null, links: ["v5"],        content: "Q2 2026 launch plan:\n\n- Strength Training Template Pack ($49)\n- Accountability System Workbook ($29)\n- Strongman Programming PDF ($79)\n\nRevenue target: $500 launch week\nPlatform: Gumroad + email list" },
  { id: "v13", title: "Development Stack",         category: "Development",    parentId: null, links: ["v6"],        content: "Current stack:\n- Next.js 15 (App Router)\n- TypeScript\n- Tailwind CSS v4\n- Vercel (deployment)\n- localStorage (persistence — migrating to DB)\n\nNext: [[Accountability App]] needs Postgres + auth" },
  { id: "v14", title: "Family & Relationships",    category: "Personal Life",  parentId: null, links: ["v11"],       content: "Non-negotiables:\n- Family dinners — phones away\n- Weekly date night\n- Present, not perfect\n\nBalance with training and business through [[Core Values]] framework" },
];

function uid() {
  return `vald-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useValdNotes() {
  const [notes, setNotes] = useState<ValdNote[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setNotes(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {}
  }, [notes, hydrated]);

  const addNote = (category: Category = "Personal Life") => {
    const n: ValdNote = {
      id: uid(),
      title: "Untitled",
      content: "",
      category,
      parentId: null,
      links: [],
    };
    setNotes((prev) => [...prev, n]);
    return n.id;
  };

  const updateNote = (id: string, changes: Partial<Omit<ValdNote, "id">>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...changes } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes((prev) =>
      prev
        .filter((n) => n.id !== id)
        .map((n) => ({ ...n, links: n.links.filter((l) => l !== id) }))
    );
  };

  // Parse [[Title]] mentions from content → link ids
  const getWikiLinks = (note: ValdNote): string[] => {
    const matches = [...note.content.matchAll(/\[\[([^\]]+)\]\]/g)];
    return matches
      .map((m) => notes.find((n) => n.title === m[1])?.id)
      .filter(Boolean) as string[];
  };

  return { notes, addNote, updateNote, deleteNote, getWikiLinks };
}
