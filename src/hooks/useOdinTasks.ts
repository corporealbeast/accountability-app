"use client";

import { useState, useEffect } from "react";

export type TaskStatus   = "planned" | "in-progress" | "done";
export type TaskCategory = "leads" | "appointments" | "campaigns" | "follow-up" | "payments" | "pipeline";
export type TaskPriority = "high" | "medium" | "low";

export interface OdinTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

const STORAGE_KEY = "odin_tasks";

const seed: OdinTask[] = [
  {
    id: "ot1",
    title: "Follow up with unresponsive leads (48h+)",
    description: "Pull contacts with no activity in 48+ hours and send a personalized follow-up message via GHL conversations.",
    category: "follow-up",
    status: "planned",
    priority: "high",
    createdAt: "2026-03-15",
  },
  {
    id: "ot2",
    title: "Send payment links to qualified leads",
    description: "Identify opportunities in 'Proposal Sent' stage and trigger payment link via GHL payments.",
    category: "payments",
    status: "planned",
    priority: "high",
    createdAt: "2026-03-15",
  },
  {
    id: "ot3",
    title: "Book discovery calls from new form submissions",
    description: "Monitor new contact form submissions and auto-book or manually schedule discovery calls using GHL calendar.",
    category: "appointments",
    status: "planned",
    priority: "high",
    createdAt: "2026-03-15",
  },
  {
    id: "ot4",
    title: "Audit stuck pipeline opportunities (7+ days)",
    description: "Find opportunities that haven't moved stages in 7+ days. Flag, re-engage, or close as lost.",
    category: "pipeline",
    status: "planned",
    priority: "medium",
    createdAt: "2026-03-15",
  },
  {
    id: "ot5",
    title: "March re-engagement email campaign",
    description: "Build and schedule a re-engagement campaign for cold leads (no activity in 30+ days) using GHL email marketing.",
    category: "campaigns",
    status: "planned",
    priority: "medium",
    createdAt: "2026-03-15",
  },
  {
    id: "ot6",
    title: "Set up 24h appointment reminder workflow",
    description: "Create an automation in GHL that sends SMS + email reminder 24h before any booked appointment.",
    category: "appointments",
    status: "planned",
    priority: "medium",
    createdAt: "2026-03-15",
  },
  {
    id: "ot7",
    title: "Qualify and tag new inbound leads",
    description: "Review new contacts added this week, apply pipeline stage tags, and move qualified leads to 'Discovery Call' stage.",
    category: "leads",
    status: "planned",
    priority: "medium",
    createdAt: "2026-03-15",
  },
  {
    id: "ot8",
    title: "Monthly newsletter — March 2026",
    description: "Draft, review, and send March newsletter to full contact list. Focus: training updates + product offer.",
    category: "campaigns",
    status: "planned",
    priority: "low",
    createdAt: "2026-03-15",
  },
  {
    id: "ot9",
    title: "Clean up dead opportunities (closed-lost)",
    description: "Archive or tag leads that have gone completely cold. Keep pipeline accurate for real conversion tracking.",
    category: "pipeline",
    status: "planned",
    priority: "low",
    createdAt: "2026-03-15",
  },
];

function uid() {
  return `ot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

export function useOdinTasks() {
  const [tasks,    setTasks]    = useState<OdinTask[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setTasks(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks, hydrated]);

  const moveTask = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  };

  const addTask = (data: Omit<OdinTask, "id" | "createdAt">) => {
    const task: OdinTask = { ...data, id: uid(), createdAt: today() };
    setTasks((prev) => [task, ...prev]);
    return task.id;
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, moveTask, addTask, deleteTask };
}
