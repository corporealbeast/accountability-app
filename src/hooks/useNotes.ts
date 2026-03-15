"use client";

import { useState, useEffect } from "react";

export interface Note {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  isFolder: boolean;
  lastModified: string;
}

const STORAGE_KEY = "gr_notes";

const seedNotes: Note[] = [
  { id: "folder-revenue",     title: "Revenue",           content: "",                                                                                           parentId: null,             isFolder: true,  lastModified: "2026-03-15" },
  { id: "folder-streams",     title: "Streams",            content: "",                                                                                           parentId: null,             isFolder: true,  lastModified: "2026-03-15" },
  { id: "folder-projections", title: "Projections",        content: "",                                                                                           parentId: null,             isFolder: true,  lastModified: "2026-03-15" },
  { id: "folder-ops",         title: "Operations",         content: "",                                                                                           parentId: null,             isFolder: true,  lastModified: "2026-03-15" },

  { id: "note-mrr",           title: "MRR Overview",       content: "## MRR Overview\n\nCurrent MRR: **$7,240**\nGoal: $10,000 by April 30\n\n### Month over Month\n- Oct: $4,200\n- Nov: $5,100\n- Dec: $5,800\n- Jan: $6,100\n- Feb: $6,600\n- Mar: $7,240\n\n### Notes\nGrowing ~$640/mo average. Need to accelerate to hit April goal.",                              parentId: "folder-revenue",     isFolder: false, lastModified: "2026-03-15" },
  { id: "note-ytd",           title: "YTD Revenue",        content: "## Year to Date\n\nYTD Total: **$19,880**\nAnnual Pace: ~$87,000\n\nTarget annual: $120,000\n\n### Action Items\n- [ ] Launch referral program\n- [ ] Add annual pricing tier\n- [ ] Reduce churn below 3%",                                                                                         parentId: "folder-revenue",     isFolder: false, lastModified: "2026-03-14" },

  { id: "note-saas",          title: "SaaS — Accountability App", content: "## Accountability App (SaaS)\n\nMRR: **$2,800** | Goal: $5,000\nGrowth: ~$400/mo\n\n### Status\nGrowing. Focus on onboarding and churn reduction.\n\n### Next Actions\n- [ ] Improve onboarding flow\n- [ ] Launch referral program\n- [ ] Add annual plan discount",                      parentId: "folder-streams",     isFolder: false, lastModified: "2026-03-15" },
  { id: "note-coaching",      title: "Coaching / Consulting",     content: "## Coaching & Consulting\n\nMRR: **$2,200** | Goal: $3,000\n4 active clients @ $550/mo\nCapped at 5 to protect time.\n\n### Next Actions\n- [ ] Raise new client rate to $650\n- [ ] Create group coaching offer",                                                                          parentId: "folder-streams",     isFolder: false, lastModified: "2026-03-13" },
  { id: "note-digital",       title: "Digital Products",          content: "## Digital Products\n\nMRR: **$1,100** | Goal: $2,000\nPassive income. Templates + guides.\n\n### Next Actions\n- [ ] Launch strength training template pack\n- [ ] Email upsell sequence",                                                                                                   parentId: "folder-streams",     isFolder: false, lastModified: "2026-03-12" },
  { id: "note-affiliate",     title: "Affiliate Revenue",         content: "## Affiliate Revenue\n\nMRR: **$740** | Goal: $1,500\nGym equipment + supplements.\n\n### Next Actions\n- [ ] Add 2 more affiliate partners\n- [ ] Build dedicated resource page",                                                                                                            parentId: "folder-streams",     isFolder: false, lastModified: "2026-03-10" },
  { id: "note-content",       title: "Content / Sponsorships",    content: "## Content & Sponsorships\n\nMRR: **$400** | Goal: $1,000\nPaused outreach. Resume at 10k followers.\n\n### Status\nPaused — focus elsewhere until audience grows.",                                                                                                                          parentId: "folder-streams",     isFolder: false, lastModified: "2026-03-01" },

  { id: "note-q1",            title: "Q1 2026 Projections",       content: "## Q1 2026\n\nBase case (10%/mo growth):\n- Apr: $7,964\n- May: $8,760\n- Jun: $9,636\n\nAggressive (18%/mo):\n- Apr: $8,543\n- May: $10,081 ← $10k milestone\n- Jun: $11,896",                                                                                                             parentId: "folder-projections", isFolder: false, lastModified: "2026-03-15" },
  { id: "note-annual",        title: "Annual Goals",              content: "## 2026 Annual Goals\n\n- [ ] Hit $10k MRR by April 30\n- [ ] $120k annual revenue\n- [ ] Launch accountability app course\n- [ ] 5 active coaching clients\n- [ ] 10k social following",                                                                                                     parentId: "folder-projections", isFolder: false, lastModified: "2026-03-14" },

  { id: "note-expenses",      title: "Monthly Expenses",          content: "## Monthly Expenses\n\n| Item | Cost |\n|---|---|\n| Software / tools | $340 |\n| Hosting / infra | $120 |\n| Marketing | $200 |\n| Misc | $150 |\n| **Total** | **$810** |\n\nNet MRR after expenses: ~$6,430",                                                                         parentId: "folder-ops",         isFolder: false, lastModified: "2026-03-10" },
  { id: "note-ideas",         title: "New Ideas",                 content: "## Revenue Ideas\n\n- Online course: Accountability + Discipline ($997)\n- Mastermind group: $500/mo x 10 members\n- Done-for-you accountability system for teams\n- Strongman training programming ($49/mo)\n- YouTube monetization",                                                       parentId: "folder-ops",         isFolder: false, lastModified: "2026-03-08" },
];

function now() {
  return new Date().toISOString().split("T")[0];
}

function uid() {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(seedNotes);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setNotes(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist on every change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {}
  }, [notes, hydrated]);

  const addNote = (parentId: string | null, isFolder = false) => {
    const newNote: Note = {
      id: uid(),
      title: isFolder ? "New Folder" : "Untitled",
      content: "",
      parentId,
      isFolder,
      lastModified: now(),
    };
    setNotes((prev) => [...prev, newNote]);
    return newNote.id;
  };

  const updateNote = (id: string, changes: Partial<Pick<Note, "title" | "content">>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...changes, lastModified: now() } : n
      )
    );
  };

  const deleteNote = (id: string) => {
    // Delete note and all descendants
    const toDelete = new Set<string>();
    const collect = (nid: string) => {
      toDelete.add(nid);
      notes.filter((n) => n.parentId === nid).forEach((n) => collect(n.id));
    };
    collect(id);
    setNotes((prev) => prev.filter((n) => !toDelete.has(n.id)));
  };

  return { notes, addNote, updateNote, deleteNote };
}
