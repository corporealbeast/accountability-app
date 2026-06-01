"use client";

import { useEffect, useState } from "react";
import {
  type Lead,
  type AssetItem,
  type AgentTask,
  type RoadmapStatus,
  type AgentTaskStatus,
  type AssetStatus,
  type CoachingBusiness,
  defaultData,
  loadData,
  saveData,
} from "@/lib/coachingBusinessStore";

type Tab =
  | "Overview"
  | "Roadmap"
  | "Agent Queue"
  | "Asset Library"
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
  "Asset Library",
  "Leads",
  "Funnel",
  "Testimonials",
  "Programs",
  "Check-ins",
  "Revenue",
];

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "bg-cyan-300/20 text-cyan-200",
  "Not Started": "bg-slate-700 text-slate-300",
  Queued: "bg-slate-700 text-slate-300",
  "Ready to Send": "bg-yellow-900/40 text-yellow-200",
  "Waiting on Agent": "bg-purple-900/40 text-purple-200",
  "Needs Review": "bg-orange-900/40 text-orange-200",
  Complete: "bg-green-900/40 text-green-200",
  Draft: "bg-slate-700 text-slate-300",
  Ready: "bg-cyan-300/20 text-cyan-200",
  Used: "bg-green-900/40 text-green-200",
  High: "bg-cyan-300/10 text-cyan-200",
  Medium: "bg-slate-700 text-slate-300",
  Low: "bg-slate-800 text-slate-400",
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
  const [data, setData] = useState<CoachingBusiness>(defaultData);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Loading...");
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [expandedRoadmap, setExpandedRoadmap] = useState<number | null>(null);

  const [newLead, setNewLead] = useState<Lead>({
    name: "",
    source: "",
    status: "New",
    value: "$250/mo",
    nextFollowUp: "",
  });

  const [newAsset, setNewAsset] = useState<AssetItem>({
    title: "",
    category: "",
    relatedRoadmapItem: "",
    content: "",
    link: "",
    status: "Draft",
  });

  const [newAgentTask, setNewAgentTask] = useState<AgentTask>({
    task: "",
    assignedAgent: "",
    project: "Personal Coaching",
    outputNeeded: "",
    status: "Queued",
    saveOutputTo: "",
    nextHumanAction: "",
  });

  useEffect(() => {
    setData(loadData());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    saveData(data);
    setSaveStatus("Autosaved");

    const timeout = window.setTimeout(() => {
      setSaveStatus("Saved locally");
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [data, hasLoaded]);

  function updateMetric(field: keyof CoachingBusiness, value: string) {
    setData((c) => ({ ...c, [field]: value }));
  }

  function updateRoadmapStatus(index: number, status: RoadmapStatus) {
    setData((c) => {
      const updated = [...c.roadmap];
      updated[index] = { ...updated[index], status };
      return { ...c, roadmap: updated };
    });
  }

  function updateRoadmapNotes(index: number, notes: string) {
    setData((c) => {
      const updated = [...c.roadmap];
      updated[index] = { ...updated[index], notes };
      return { ...c, roadmap: updated };
    });
  }

  function updateAgentTaskStatus(index: number, status: AgentTaskStatus) {
    setData((c) => {
      const updated = [...c.agentQueue];
      updated[index] = { ...updated[index], status };
      return { ...c, agentQueue: updated };
    });
  }

  function updateAgentTaskOutputNeeded(index: number, outputNeeded: string) {
    setData((c) => {
      const updated = [...c.agentQueue];
      updated[index] = { ...updated[index], outputNeeded };
      return { ...c, agentQueue: updated };
    });
  }

  function updateAgentTaskNextHumanAction(index: number, nextHumanAction: string) {
    setData((c) => {
      const updated = [...c.agentQueue];
      updated[index] = { ...updated[index], nextHumanAction };
      return { ...c, agentQueue: updated };
    });
  }

  function addAgentTask() {
    if (!newAgentTask.task.trim()) return;
    setData((c) => ({ ...c, agentQueue: [...c.agentQueue, newAgentTask] }));
    setNewAgentTask({ task: "", assignedAgent: "", project: "Personal Coaching", outputNeeded: "", status: "Queued", saveOutputTo: "", nextHumanAction: "" });
  }

  function removeAgentTask(index: number) {
    setData((c) => ({ ...c, agentQueue: c.agentQueue.filter((_, i) => i !== index) }));
  }

  function updateAssetContent(index: number, content: string) {
    setData((c) => {
      const updated = [...c.assets];
      updated[index] = { ...updated[index], content };
      return { ...c, assets: updated };
    });
  }

  function updateAssetLink(index: number, link: string) {
    setData((c) => {
      const updated = [...c.assets];
      updated[index] = { ...updated[index], link };
      return { ...c, assets: updated };
    });
  }

  function updateAssetStatus(index: number, status: AssetStatus) {
    setData((c) => {
      const updated = [...c.assets];
      updated[index] = { ...updated[index], status };
      return { ...c, assets: updated };
    });
  }

  function addAsset() {
    if (!newAsset.title.trim()) return;
    setData((c) => ({ ...c, assets: [...c.assets, newAsset] }));
    setNewAsset({ title: "", category: "", relatedRoadmapItem: "", content: "", link: "", status: "Draft" });
  }

  function removeAsset(index: number) {
    setData((c) => ({ ...c, assets: c.assets.filter((_, i) => i !== index) }));
  }

  function addLead() {
    if (!newLead.name.trim()) return;
    setData((c) => ({
      ...c,
      leads: [...c.leads, newLead],
      leadsNeedingFollowUp: String(Number(c.leadsNeedingFollowUp || 0) + 1),
    }));
    setNewLead({ name: "", source: "", status: "New", value: "$250/mo", nextFollowUp: "" });
  }

  function removeLead(index: number) {
    setData((c) => ({ ...c, leads: c.leads.filter((_, i) => i !== index) }));
  }

  function resetHub() {
    const confirmed = window.confirm("Reset the Coaching Hub back to the default starter data?");
    if (!confirmed) return;
    setData(defaultData);
    saveData(defaultData);
  }

  const metricFields = [
    { field: "currentClients" as const, label: "Current Clients" },
    { field: "targetClients" as const, label: "Target Clients" },
    { field: "currentMRR" as const, label: "Current MRR" },
    { field: "targetMRR" as const, label: "Target MRR" },
    { field: "leadsNeedingFollowUp" as const, label: "Leads to Follow Up" },
    { field: "callsBooked" as const, label: "Calls Booked" },
  ];

  return (
    <main className="min-h-screen bg-[#24292f] text-[#d8faff] px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/70">EDEN Command Center</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Coaching Business Hub</h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              Full workspace — shared data with the Command Center cockpit.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={resetHub}
              className="rounded-xl border border-red-300/30 bg-red-950/30 px-4 py-2 text-sm text-red-100 hover:bg-red-900/40"
            >
              Reset Local Data
            </button>
            <span className="text-xs text-cyan-300/50">{saveStatus}</span>
          </div>
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

          {/* OVERVIEW */}
          {activeTab === "Overview" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-cyan-200/40 bg-[#1f252b] p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Primary Mission</p>
                <input
                  value={data.missionTitle}
                  onChange={(e) => updateMetric("missionTitle", e.target.value)}
                  className="mt-3 w-full rounded-xl border border-slate-600 bg-[#24292f] p-4 text-2xl font-bold text-white outline-none focus:border-cyan-300"
                />
                <p className="mt-3 text-slate-300">
                  10 clients at $250–$300/month through content/ads → GHL form → intro call → Stripe/ForActive → MyStrengthBook → weekly check-ins.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {metricFields.map(({ field, label }) => (
                  <div key={field} className="rounded-xl bg-[#30363d] p-5">
                    <p className="text-sm text-slate-400">{label}</p>
                    <input
                      value={data[field]}
                      onChange={(e) => updateMetric(field, e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-[#24292f] p-2 text-xl font-bold text-white outline-none focus:border-cyan-300"
                    />
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

              <div className="rounded-2xl bg-[#30363d] p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Roadmap Summary</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {data.roadmap.map((item) => (
                    <div key={item.title} className="rounded-xl bg-[#24292f] p-4">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[item.status] ?? "bg-slate-700 text-slate-300"}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ROADMAP */}
          {activeTab === "Roadmap" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">{data.roadmap.length} build items. Click a card to expand.</p>
              {data.roadmap.map((item, index) => {
                const isExpanded = expandedRoadmap === index;
                return (
                  <div key={item.title} className="rounded-xl border border-slate-600 bg-[#24292f] p-5">
                    <button
                      type="button"
                      onClick={() => setExpandedRoadmap(isExpanded ? null : index)}
                      className="w-full text-left"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm text-cyan-300">{item.project} · {item.assignedAgent}</p>
                          <h3 className="mt-1 text-xl font-bold">{item.title}</h3>
                          <p className="mt-2 text-sm text-slate-300">Next: {item.nextAction}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`self-start rounded-full px-3 py-1 text-xs ${STATUS_COLORS[item.priority] ?? "bg-slate-700 text-slate-300"}`}>{item.priority}</span>
                          <span className={`self-start rounded-full px-3 py-1 text-xs ${STATUS_COLORS[item.status] ?? "bg-slate-700 text-slate-300"}`}>{item.status}</span>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-5 space-y-4 border-t border-slate-700 pt-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-semibold text-cyan-300">Tasks</p>
                            <ul className="mt-3 space-y-1 text-sm text-slate-300">
                              {item.tasks.map((t) => <li key={t}>• {t}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-cyan-300">Status</p>
                            <select
                              value={item.status}
                              onChange={(e) => updateRoadmapStatus(index, e.target.value as RoadmapStatus)}
                              className="mt-3 w-full rounded-lg bg-[#1f252b] p-2 text-sm text-white"
                            >
                              <option>Not Started</option>
                              <option>In Progress</option>
                              <option>Complete</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-cyan-300">Notes</p>
                          <textarea
                            value={item.notes}
                            onChange={(e) => updateRoadmapNotes(index, e.target.value)}
                            className="mt-2 min-h-[100px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* AGENT QUEUE */}
          {activeTab === "Agent Queue" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <input placeholder="Task" value={newAgentTask.task} onChange={(e) => setNewAgentTask((c) => ({ ...c, task: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                <input placeholder="Assigned agent" value={newAgentTask.assignedAgent} onChange={(e) => setNewAgentTask((c) => ({ ...c, assignedAgent: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                <input placeholder="Save output to" value={newAgentTask.saveOutputTo} onChange={(e) => setNewAgentTask((c) => ({ ...c, saveOutputTo: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                <button onClick={addAgentTask} className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200">Add Task</button>
              </div>

              {data.agentQueue.map((item, index) => (
                <div key={`${item.task}-${index}`} className="rounded-xl border border-slate-600 bg-[#24292f] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-cyan-300">{item.project} · {item.assignedAgent}</p>
                      <h3 className="mt-1 text-lg font-bold">{item.task}</h3>
                      {item.saveOutputTo && <p className="mt-1 text-xs text-slate-400">Save to: {item.saveOutputTo}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <select value={item.status} onChange={(e) => updateAgentTaskStatus(index, e.target.value as AgentTaskStatus)} className="rounded-lg bg-[#1f252b] p-2 text-sm text-white">
                        <option>Queued</option>
                        <option>Ready to Send</option>
                        <option>Waiting on Agent</option>
                        <option>Needs Review</option>
                        <option>Complete</option>
                      </select>
                      <button onClick={() => removeAgentTask(index)} className="rounded-lg border border-red-300/30 px-3 py-2 text-xs text-red-100 hover:bg-red-950/40">Remove</button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold text-cyan-300">Output Needed</p>
                      <textarea value={item.outputNeeded} onChange={(e) => updateAgentTaskOutputNeeded(index, e.target.value)} placeholder="What should the agent produce?" className="mt-2 min-h-[80px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-cyan-300">Next Human Action</p>
                      <textarea value={item.nextHumanAction} onChange={(e) => updateAgentTaskNextHumanAction(index, e.target.value)} placeholder="What do you need to do once the agent responds?" className="mt-2 min-h-[80px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ASSET LIBRARY */}
          {activeTab === "Asset Library" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <input placeholder="Asset title" value={newAsset.title} onChange={(e) => setNewAsset((c) => ({ ...c, title: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                <input placeholder="Category" value={newAsset.category} onChange={(e) => setNewAsset((c) => ({ ...c, category: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                <input placeholder="Related roadmap item" value={newAsset.relatedRoadmapItem} onChange={(e) => setNewAsset((c) => ({ ...c, relatedRoadmapItem: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                <button onClick={addAsset} className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200">Add Asset</button>
              </div>

              {data.assets.map((asset, index) => (
                <div key={`${asset.title}-${index}`} className="rounded-xl border border-slate-600 bg-[#24292f] p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-cyan-300">{asset.category}{asset.relatedRoadmapItem ? ` · ${asset.relatedRoadmapItem}` : ""}</p>
                      <h3 className="mt-1 text-lg font-bold">{asset.title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <select value={asset.status} onChange={(e) => updateAssetStatus(index, e.target.value as AssetStatus)} className="rounded-lg bg-[#1f252b] p-2 text-sm text-white">
                        <option>Draft</option>
                        <option>Ready</option>
                        <option>Used</option>
                      </select>
                      <button onClick={() => removeAsset(index)} className="rounded-lg border border-red-300/30 px-3 py-2 text-xs text-red-100 hover:bg-red-950/40">Remove</button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-cyan-300">Content</p>
                    <textarea value={asset.content} onChange={(e) => updateAssetContent(index, e.target.value)} placeholder="Paste Claude/EDEN output, copy, notes, or scripts here." className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-cyan-300">Link</p>
                    <input value={asset.link} onChange={(e) => updateAssetLink(index, e.target.value)} placeholder="Google Drive, GHL page, image, or video link" className="mt-2 w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LEADS */}
          {activeTab === "Leads" && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-5">
                <input placeholder="Name" value={newLead.name} onChange={(e) => setNewLead((c) => ({ ...c, name: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                <input placeholder="Source" value={newLead.source} onChange={(e) => setNewLead((c) => ({ ...c, source: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                <input placeholder="Status" value={newLead.status} onChange={(e) => setNewLead((c) => ({ ...c, status: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                <input placeholder="Next follow-up" value={newLead.nextFollowUp} onChange={(e) => setNewLead((c) => ({ ...c, nextFollowUp: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                <button onClick={addLead} className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200">Add Lead</button>
              </div>

              {data.leads.map((lead, index) => (
                <div key={`${lead.name}-${index}`} className="rounded-xl border border-slate-600/60 bg-[#24292f] p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <h3 className="font-bold">{lead.name}</h3>
                      <p className="mt-2 text-sm text-slate-400">Source: {lead.source || "—"} · Status: {lead.status}</p>
                      <p className="mt-2 text-sm text-slate-300">Next follow-up: {lead.nextFollowUp || "—"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-cyan-300">{lead.value}</span>
                      <button onClick={() => removeLead(index)} className="rounded-lg border border-red-300/30 px-3 py-2 text-xs text-red-100 hover:bg-red-950/40">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* REVENUE */}
          {activeTab === "Revenue" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                {(["currentClients", "targetClients", "currentMRR", "targetMRR"] as const).map((field) => {
                  const labels: Record<string, string> = { currentClients: "Current Clients", targetClients: "Target Clients", currentMRR: "Current MRR", targetMRR: "Target MRR" };
                  return (
                    <div key={field} className="rounded-xl bg-[#30363d] p-5">
                      <p className="text-sm text-slate-400">{labels[field]}</p>
                      <input value={data[field]} onChange={(e) => updateMetric(field, e.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-[#24292f] p-2 text-xl font-bold text-white outline-none focus:border-cyan-300" />
                    </div>
                  );
                })}
              </div>
              <div className="rounded-2xl bg-[#30363d] p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Revenue Path</p>
                <p className="mt-3 text-slate-300">
                  Target: 10 clients × $250–$300/month = $2,500–$3,000 MRR. Each client added moves the number. Track payment confirmations here once clients start.
                </p>
              </div>
            </div>
          )}

          {activeTab === "Funnel" && <PlaceholderTab name="Funnel" />}
          {activeTab === "Testimonials" && <PlaceholderTab name="Testimonials" />}
          {activeTab === "Programs" && <PlaceholderTab name="Programs" />}
          {activeTab === "Check-ins" && <PlaceholderTab name="Check-ins" />}

        </div>
      </div>
    </main>
  );
}
