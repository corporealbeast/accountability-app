"use client";

import { useState } from "react";
import { FolderKanban, ChevronDown, ChevronUp, Circle, CheckCircle2, Clock, Pause } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────

type ProjectStatus = "in-progress" | "on-hold" | "planned" | "completed";

interface BulletItem {
  text: string;
  done: boolean;
}

interface ProjectData {
  id: string;
  title: string;
  status: ProjectStatus;
  description: string;
  bullets: BulletItem[];
}

// ── Project Data ──────────────────────────────────────────────

const PROJECTS: ProjectData[] = [
  {
    id: "hop-website",
    title: "HOP Website Redesign",
    status: "in-progress",
    description:
      "Full redesign of House of Power gym website — two-audience structure (open gym + sports performance), dual lead funnels, GHL form embeds. Interactive planner lives at /webdev/house-of-power.",
    bullets: [
      { text: "Map all pages, sections, headlines, and CTAs in the interactive planner", done: false },
      { text: "Provide GHL embed codes for all 4 built forms (trial, assessment, contact, membership)", done: false },
      { text: "Supply visual assets — hero video, facility photos, logo/brand kit", done: false },
      { text: "Fill in gym details — name, tagline, address, phone, hours, brand colors", done: false },
      { text: "Build website pages — homepage, free trial funnel, assessment funnel, memberships", done: false },
      { text: "Build supporting pages — about, sports performance, coaching, gallery, events, contact", done: false },
      { text: "Wire all GHL forms and checkout links", done: false },
      { text: "Test all funnel pathways end-to-end", done: false },
      { text: "Launch", done: false },
    ],
  },
  {
    id: "eden-jarvis",
    title: "Project Eden — Jarvis Upgrade",
    status: "on-hold",
    description:
      "Upgrade Eden from a basic AI chat to a full Jarvis-level co-pilot: internet access, persistent cross-session memory, and all missing action tools.",
    bullets: [
      { text: "Extract Eden agentic loop to shared module (eden-agent.ts) with date injection", done: true },
      { text: "Fix Telegram bot — direct import replaces HTTP self-call, works on Vercel", done: true },
      { text: "Add web search + webpage reader tools via Tavily API", done: true },
      { text: "Add persistent cross-session memory (remember_fact / recall_facts / forget_fact) backed by Supabase", done: true },
      { text: "Add complete_task and update_task tools", done: true },
      { text: "Add update_calendar_event and delete_calendar_event tools", done: true },
      { text: "Add get_email_inbox tool", done: true },
      { text: "Upgrade system prompt — Section 8 Jarvis Protocol + Section 9 full capabilities list", done: true },
      { text: "Run eden_memory table SQL in Supabase dashboard", done: false },
      { text: "Add TAVILY_API_KEY to Vercel env vars (get from tavily.com — free tier)", done: false },
      { text: "Confirm NEXT_PUBLIC_APP_URL is set in Vercel to production URL", done: false },
      { text: "Deploy to Vercel + re-register Telegram webhook at /api/telegram/setup", done: false },
      { text: "Connect Google OAuth — add GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET, authorize at /api/auth/google", done: false },
      { text: "Add GYMMASTER_API_KEY to Vercel", done: false },
      { text: "Add ZAPIER_WEBHOOK_SECRET to Vercel", done: false },
      { text: "Train Eden on GHL workflows — teach her the pipeline stages, lead categories, typical follow-up patterns", done: false },
      { text: "Train Eden on text agent capabilities — build out SMS outreach flows, lead qualification scripts", done: false },
      { text: "Test full Telegram flow: free-text → Eden response, date awareness, web search, memory recall", done: false },
    ],
  },
  {
    id: "dashboard-roadmap",
    title: "Dashboard Roadmap",
    status: "planned",
    description:
      "Define a clear, written roadmap for the complete dashboard — what every section does, what it should contain when fully built, and the build order.",
    bullets: [
      { text: "Map every current section and its intended purpose", done: false },
      { text: "Define what 'done' looks like for each section (features, data, tools)", done: false },
      { text: "Prioritize sections by impact on daily life and income goals", done: false },
      { text: "Identify which sections need integrations vs. just UI", done: false },
      { text: "Set a rough timeline for each section tied to the August baby deadline", done: false },
      { text: "Write the roadmap as a living document inside this Projects page", done: false },
    ],
  },
  {
    id: "dashboard-reorg",
    title: "Dashboard Reorganization",
    status: "planned",
    description:
      "Reorganize the sidebar, navigation, and page structure so the dashboard is intuitive and not confusing. Everything in the right place with clear labels.",
    bullets: [
      { text: "Audit every existing page — what's useful, what's unfinished, what can be cut", done: false },
      { text: "Redesign sidebar groups to match how you actually think about your business", done: false },
      { text: "Consolidate or remove pages that overlap or have no content", done: false },
      { text: "Make the main dashboard / home page a true command center (today's brief, top tasks, quick actions)", done: false },
      { text: "Ensure consistent naming — no more 'Odin' and 'Eden' mixed, no confusing labels", done: false },
      { text: "Mobile-test the layout for Telegram / on-the-go use cases", done: false },
    ],
  },
  {
    id: "building-income",
    title: "Building Income — Live Planning Section",
    status: "planned",
    description:
      "A dedicated section for planning and building monthly income. Brainstorm space, income stream tracker, system builder, and progress toward $10k/month before August.",
    bullets: [
      { text: "Design the page layout — brainstorm board, income streams, monthly target tracker", done: false },
      { text: "Build income stream cards — each stream with: name, current MRR, target MRR, status, next action", done: false },
      { text: "Integrate the Hormozi offer-building framework as a guided flow inside the page", done: false },
      { text: "Add a $10k/month progress bar tied to actual revenue data", done: false },
      { text: "Brainstorm section — free-form space for ideas with Eden integration (ask Eden to evaluate any idea)", done: false },
      { text: "Connect GHL pipeline data — show leads → offers → closed revenue flow", done: false },
      { text: "Build 'Current Offer' card — walk through Grand Slam Offer framework for active offers", done: false },
      { text: "Add weekly revenue review checklist (Hormozi's questions: revenue in, people talked to, content out, next action)", done: false },
      { text: "August countdown — visible deadline, weeks remaining, what needs to happen by when", done: false },
    ],
  },
];

// ── Status Config ─────────────────────────────────────────────

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  "in-progress": {
    label: "In Progress",
    color: "#B0E0E6",
    bg: "rgba(176,224,230,0.12)",
    icon: <Clock size={12} />,
  },
  "on-hold": {
    label: "On Hold",
    color: "#e6c87a",
    bg: "rgba(230,200,122,0.12)",
    icon: <Pause size={12} />,
  },
  planned: {
    label: "Planned",
    color: "#7a8a95",
    bg: "rgba(122,138,149,0.12)",
    icon: <Circle size={12} />,
  },
  completed: {
    label: "Completed",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.12)",
    icon: <CheckCircle2 size={12} />,
  },
};

// ── Project Card ──────────────────────────────────────────────

function ProjectCard({ project }: { project: ProjectData }) {
  const [expanded, setExpanded] = useState(true);
  const sc = statusConfig[project.status];
  const done = project.bullets.filter((b) => b.done).length;
  const total = project.bullets.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div
      style={{
        backgroundColor: "#36393F",
        border: "1px solid #3e4147",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          padding: "18px 20px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1 }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#B0E0E6" }}>
              {project.title}
            </span>
            {/* Status badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 600,
                color: sc.color,
                backgroundColor: sc.bg,
                border: `1px solid ${sc.color}30`,
              }}
            >
              {sc.icon}
              {sc.label}
            </span>
          </div>

          {/* Description */}
          <p style={{ fontSize: "13px", color: "#9aa5b0", marginTop: "6px", lineHeight: 1.5 }}>
            {project.description}
          </p>

          {/* Progress bar */}
          {total > 0 && (
            <div style={{ marginTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "11px", color: "#7a8a95" }}>Progress</span>
                <span style={{ fontSize: "11px", color: "#9aa5b0" }}>
                  {done}/{total} · {pct}%
                </span>
              </div>
              <div
                style={{
                  height: "4px",
                  backgroundColor: "#2C2F33",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    backgroundColor: sc.color,
                    borderRadius: "999px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Expand toggle */}
        <span style={{ color: "#7a8a95", flexShrink: 0, paddingTop: "2px" }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Bullet list */}
      {expanded && (
        <div
          style={{
            padding: "0 20px 18px",
            borderTop: "1px solid #3e4147",
          }}
        >
          <div style={{ paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {project.bullets.map((b, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    marginTop: "2px",
                    color: b.done ? "#4ade80" : "#3e4147",
                  }}
                >
                  <CheckCircle2 size={15} fill={b.done ? "#4ade80" : "none"} />
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: b.done ? "#7a8a95" : "#9aa5b0",
                    textDecoration: b.done ? "line-through" : "none",
                    lineHeight: 1.5,
                  }}
                >
                  {b.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function ProjectsPage() {
  const totalDone = PROJECTS.flatMap((p) => p.bullets).filter((b) => b.done).length;
  const totalItems = PROJECTS.flatMap((p) => p.bullets).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#2C2F33",
        padding: "32px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <FolderKanban size={22} style={{ color: "#B0E0E6" }} />
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#B0E0E6", margin: 0 }}>
            Projects
          </h1>
        </div>
        <p style={{ fontSize: "14px", color: "#7a8a95", margin: 0 }}>
          Everything being built. {totalDone} of {totalItems} total tasks complete across {PROJECTS.length} projects.
        </p>
      </div>

      {/* Project cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
