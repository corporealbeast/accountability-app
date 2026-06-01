"use client";

import { useState } from "react";

type Tab =
  | "Overview"
  | "Roadmap"
  | "Agent Queue"
  | "Assets"
  | "Leads"
  | "Funnel"
  | "Testimonials"
  | "Programs"
  | "Check-ins"
  | "Revenue";

const TABS: Tab[] = [
  "Overview",
  "Roadmap",
  "Agent Queue",
  "Assets",
  "Leads",
  "Funnel",
  "Testimonials",
  "Programs",
  "Check-ins",
  "Revenue",
];

const roadmapCards = [
  {
    title: "Build Coaching Offer",
    status: "In Progress",
    agent: "EDEN / Claude Ads Agent",
    next: "Finalize the founding client offer and price.",
  },
  {
    title: "First Coaching Ad Campaign",
    status: "Not Started",
    agent: "Claude Ads Agent",
    next: "Generate 3 ad angles, hooks, captions, and one short video script.",
  },
  {
    title: "GHL Coaching Funnel",
    status: "Not Started",
    agent: "Claude Funnel/Ops Agent",
    next: "Create one mobile GHL page with headline, proof, offer, and form.",
  },
  {
    title: "Client Onboarding",
    status: "Not Started",
    agent: "Claude Funnel/Ops Agent",
    next: "Map payment → intake → MSB invite → first program → first check-in.",
  },
  {
    title: "Testimonial Library",
    status: "Not Started",
    agent: "EDEN / Claude Funnel-Ops Agent",
    next: "Create a place to store client proof, quotes, screenshots, PRs, and transformation notes.",
  },
  {
    title: "Landing Page Proof Section",
    status: "Not Started",
    agent: "Claude Funnel/Ops Agent",
    next: "Draft the landing page proof section using testimonials, credibility, and client outcomes.",
  },
];

const agentQueueCards = [
  {
    task: "Create first coaching ad campaign",
    agent: "Claude Ads Agent",
    status: "Queued",
    outputNeeded: "3 ad angles, hooks, captions, and one short video script",
    saveTo: "Assets → First Coaching Ad Copy",
    nextAction: "Send roadmap card brief to Claude and paste output into Asset Library",
  },
  {
    task: "Build GHL coaching funnel copy",
    agent: "Claude Funnel/Ops Agent",
    status: "Queued",
    outputNeeded: "Headline, proof section, offer section, CTA, and form instructions",
    saveTo: "Assets → GHL Landing Page Copy",
    nextAction: "Send funnel card brief to Claude and paste output into Asset Library",
  },
  {
    task: "Create testimonial collection system",
    agent: "EDEN / Claude Funnel-Ops Agent",
    status: "Queued",
    outputNeeded: "Testimonial fields list, permission message template, and asset tagging guide",
    saveTo: "Assets → Testimonial / Proof Notes",
    nextAction: "Send testimonial card brief to Claude and paste output into Asset Library",
  },
];

const statusColors: Record<string, string> = {
  "In Progress": "bg-cyan-300/20 text-cyan-200",
  "Not Started": "bg-slate-700 text-slate-300",
  Queued: "bg-slate-700 text-slate-300",
  "Ready to Send": "bg-yellow-900/40 text-yellow-200",
  "Waiting on Agent": "bg-purple-900/40 text-purple-200",
  "Needs Review": "bg-orange-900/40 text-orange-200",
  Complete: "bg-green-900/40 text-green-200",
};

function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-slate-600/40 bg-[#24292f] p-10 text-center">
      <p className="text-sm uppercase tracking-widest text-cyan-300/60">{name}</p>
      <h2 className="mt-3 text-2xl font-bold text-white">Coming Soon</h2>
      <p className="mt-3 max-w-md mx-auto text-slate-400">
        This section will be built out as the coaching system grows. Check back after the core offer, funnel, and onboarding are live.
      </p>
    </div>
  );
}

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <main className="min-h-screen bg-[#24292f] text-[#d8faff] px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <section>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/70">
            EDEN Command Center
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Coaching Business Hub
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            The operating system for the private coaching business — offer, funnel, leads, programming, check-ins, and revenue in one place.
          </p>
        </section>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-cyan-300 text-slate-950"
                  : "bg-[#30363d] text-slate-300 hover:bg-[#3d444d] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>

          {/* Overview */}
          {activeTab === "Overview" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-cyan-200/40 bg-[#1f252b] p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Primary Goal</p>
                <p className="mt-3 text-2xl font-bold">Add $3,000/month recurring from private coaching clients.</p>
                <p className="mt-3 text-slate-300">
                  10 clients at $250–$300/month through content/ads → GHL form → intro call → Stripe/ForActive → MyStrengthBook → weekly check-ins.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Current Clients", value: "0" },
                  { label: "Target Clients", value: "10" },
                  { label: "Current MRR", value: "$0" },
                  { label: "Target MRR", value: "$3,000" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-[#30363d] p-5">
                    <p className="text-sm text-slate-400">{m.label}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-red-300/30 bg-red-950/20 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-red-200/80">Main Bottleneck</p>
                <h2 className="mt-2 text-xl font-bold">No clients yet — outreach not started.</h2>
                <p className="mt-3 text-slate-300">
                  The fastest path is a list of 20 old clients and leads, message the first 10, and book one intro call. Everything else (funnel, ads, programs) is secondary until the first client pays.
                </p>
              </div>
            </div>
          )}

          {/* Roadmap */}
          {activeTab === "Roadmap" && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">6 active build items. Expand each to see details.</p>
              {roadmapCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-slate-600 bg-[#24292f] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-cyan-300">Personal Coaching · {card.agent}</p>
                      <h3 className="mt-1 text-xl font-bold">{card.title}</h3>
                      <p className="mt-2 text-sm text-slate-300">Next: {card.next}</p>
                    </div>
                    <span className={`self-start rounded-full px-3 py-1 text-xs ${statusColors[card.status] ?? "bg-slate-700 text-slate-300"}`}>
                      {card.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Agent Queue */}
          {activeTab === "Agent Queue" && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">Tasks queued for Claude, ChatGPT, and EDEN agents.</p>
              {agentQueueCards.map((item) => (
                <div
                  key={item.task}
                  className="rounded-xl border border-slate-600 bg-[#24292f] p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-cyan-300">{item.agent}</p>
                      <h3 className="mt-1 text-lg font-bold">{item.task}</h3>
                      <p className="mt-1 text-xs text-slate-400">Save to: {item.saveTo}</p>
                    </div>
                    <span className={`self-start rounded-full px-3 py-1 text-xs ${statusColors[item.status] ?? "bg-slate-700 text-slate-300"}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold text-cyan-300">Output Needed</p>
                      <p className="mt-1 text-sm text-slate-300">{item.outputNeeded}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-cyan-300">Next Human Action</p>
                      <p className="mt-1 text-sm text-slate-300">{item.nextAction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assets */}
          {activeTab === "Assets" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-cyan-200/20 bg-[#1f252b] p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Asset Library</p>
                <h2 className="mt-2 text-2xl font-bold">Where Claude / EDEN Outputs Live</h2>
                <p className="mt-3 text-slate-300">
                  This section will hold all agent-generated outputs organized by type. Use the Command Center Asset Library in the meantime, then this tab will replace it once the coaching hub is fully wired.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Ad Copy", desc: "Hooks, angles, captions, and video scripts from Claude Ads Agent." },
                  { label: "Funnel Copy", desc: "GHL landing page headlines, proof, offer, and CTA copy." },
                  { label: "Testimonial / Proof Notes", desc: "Client quotes, transformation screenshots, PRs, and permission status." },
                ].map((a) => (
                  <div key={a.label} className="rounded-xl border border-slate-600 bg-[#24292f] p-5">
                    <p className="font-semibold text-cyan-200">{a.label}</p>
                    <p className="mt-2 text-sm text-slate-400">{a.desc}</p>
                    <p className="mt-3 text-xs text-slate-500">No content yet — send agent task to populate.</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Leads" && <PlaceholderTab name="Leads" />}
          {activeTab === "Funnel" && <PlaceholderTab name="Funnel" />}
          {activeTab === "Testimonials" && <PlaceholderTab name="Testimonials" />}
          {activeTab === "Programs" && <PlaceholderTab name="Programs" />}
          {activeTab === "Check-ins" && <PlaceholderTab name="Check-ins" />}
          {activeTab === "Revenue" && <PlaceholderTab name="Revenue" />}

        </div>
      </div>
    </main>
  );
}
