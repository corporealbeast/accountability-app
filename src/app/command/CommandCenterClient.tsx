"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  type TodayAction,
  type Lead,
  type SystemChecklistItem,
  type AssetItem,
  type AgentTask,
  type RoadmapItem,
  type CoachingBusiness,
  defaultData,
  loadData,
  saveData,
  loadDataFromSupabase,
  saveDataToSupabase,
} from "@/lib/coachingBusinessStore";

export default function CommandCenterClient() {
  const [data, setData] = useState<CoachingBusiness>(defaultData);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Loading...");
  const [expandedRoadmapIndex, setExpandedRoadmapIndex] = useState<number | null>(0);

  const [newLead, setNewLead] = useState<Lead>({
    name: "",
    source: "",
    status: "New",
    value: "$250/mo",
    nextFollowUp: "",
  });

  const [newAgentTask, setNewAgentTask] = useState<AgentTask>({
    task: "",
    assignedAgent: "",
    project: "",
    outputNeeded: "",
    status: "Queued",
    saveOutputTo: "",
    nextHumanAction: "",
  });

  const [newAsset, setNewAsset] = useState<AssetItem>({
    title: "",
    category: "",
    relatedRoadmapItem: "",
    content: "",
    link: "",
    status: "Draft",
  });

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const remote = await loadDataFromSupabase();
      if (cancelled) return;
      if (remote) {
        setData(remote);
        saveData(remote); // keep localStorage in sync with Supabase
      } else {
        const local = loadData();
        setData(local);
        saveDataToSupabase(local); // seed Supabase from existing localStorage
      }
      setHasLoaded(true);
    }
    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    saveData(data); // immediate localStorage write
    setSaveStatus("Saving...");

    const timeout = window.setTimeout(() => {
      saveDataToSupabase(data)
        .then(() => setSaveStatus("Saved"))
        .catch(() => setSaveStatus("Saved locally"));
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [data, hasLoaded]);

  function updateMetric(field: keyof CoachingBusiness, value: string) {
    setData((current) => ({ ...current, [field]: value }));
  }

  function updateTodayAction(index: number, value: string) {
    setData((current) => {
      const updated = [...current.todayActions];
      updated[index] = { ...updated[index], action: value };
      return { ...current, todayActions: updated };
    });
  }

  function updateTodayStatus(index: number, status: TodayAction["status"]) {
    setData((current) => {
      const updated = [...current.todayActions];
      updated[index] = { ...updated[index], status };
      return { ...current, todayActions: updated };
    });
  }

  function updateChecklistStatus(index: number, status: SystemChecklistItem["status"]) {
    setData((current) => {
      const updated = [...current.systemChecklist];
      updated[index] = { ...updated[index], status };
      return { ...current, systemChecklist: updated };
    });
  }

  function updateRoadmapStatus(index: number, status: RoadmapItem["status"]) {
    setData((current) => {
      const updated = [...current.roadmap];
      updated[index] = { ...updated[index], status };
      return { ...current, roadmap: updated };
    });
  }

  function updateRoadmapNotes(index: number, notes: string) {
    setData((current) => {
      const updated = [...current.roadmap];
      updated[index] = { ...updated[index], notes };
      return { ...current, roadmap: updated };
    });
  }

  function updateRoadmapAssetLinks(index: number, assetLinks: string) {
    setData((current) => {
      const updated = [...current.roadmap];
      updated[index] = { ...updated[index], assetLinks };
      return { ...current, roadmap: updated };
    });
  }

  function addAgentTask() {
    if (!newAgentTask.task.trim()) return;
    setData((current) => ({ ...current, agentQueue: [...current.agentQueue, newAgentTask] }));
    setNewAgentTask({ task: "", assignedAgent: "", project: "", outputNeeded: "", status: "Queued", saveOutputTo: "", nextHumanAction: "" });
  }

  function removeAgentTask(index: number) {
    setData((current) => ({ ...current, agentQueue: current.agentQueue.filter((_, i) => i !== index) }));
  }

  function updateAgentTaskStatus(index: number, status: AgentTask["status"]) {
    setData((current) => {
      const updated = [...current.agentQueue];
      updated[index] = { ...updated[index], status };
      return { ...current, agentQueue: updated };
    });
  }

  function updateAgentTaskOutputNeeded(index: number, outputNeeded: string) {
    setData((current) => {
      const updated = [...current.agentQueue];
      updated[index] = { ...updated[index], outputNeeded };
      return { ...current, agentQueue: updated };
    });
  }

  function updateAgentTaskNextHumanAction(index: number, nextHumanAction: string) {
    setData((current) => {
      const updated = [...current.agentQueue];
      updated[index] = { ...updated[index], nextHumanAction };
      return { ...current, agentQueue: updated };
    });
  }

  function addAsset() {
    if (!newAsset.title.trim()) return;
    setData((current) => ({ ...current, assets: [...current.assets, newAsset] }));
    setNewAsset({ title: "", category: "", relatedRoadmapItem: "", content: "", link: "", status: "Draft" });
  }

  function removeAsset(index: number) {
    setData((current) => ({ ...current, assets: current.assets.filter((_, i) => i !== index) }));
  }

  function updateAssetStatus(index: number, status: AssetItem["status"]) {
    setData((current) => {
      const updated = [...current.assets];
      updated[index] = { ...updated[index], status };
      return { ...current, assets: updated };
    });
  }

  function updateAssetContent(index: number, content: string) {
    setData((current) => {
      const updated = [...current.assets];
      updated[index] = { ...updated[index], content };
      return { ...current, assets: updated };
    });
  }

  function updateAssetLink(index: number, link: string) {
    setData((current) => {
      const updated = [...current.assets];
      updated[index] = { ...updated[index], link };
      return { ...current, assets: updated };
    });
  }

  function addLead() {
    if (!newLead.name.trim()) return;
    setData((current) => ({
      ...current,
      leads: [...current.leads, newLead],
      leadsNeedingFollowUp: String(Number(current.leadsNeedingFollowUp || 0) + 1),
    }));
    setNewLead({ name: "", source: "", status: "New", value: "$250/mo", nextFollowUp: "" });
  }

  function removeLead(index: number) {
    setData((current) => ({ ...current, leads: current.leads.filter((_, i) => i !== index) }));
  }

  function resetDashboard() {
    const confirmed = window.confirm("Reset the Command Center back to the default starter data?");
    if (!confirmed) return;
    setData(defaultData);
    saveData(defaultData);
  }

  return (
    <main className="min-h-screen bg-[#24292f] text-[#d8faff] px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/70">
              EDEN Command Center
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Private Coaching Mission
            </h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              Daily cockpit — edits here are shared with the Coaching Business Hub.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={resetDashboard}
              className="rounded-xl border border-red-300/30 bg-red-950/30 px-4 py-2 text-sm text-red-100 hover:bg-red-900/40"
            >
              Reset Local Data
            </button>
            <span className="text-xs text-cyan-300/50">{saveStatus}</span>
          </div>
        </section>

        {/* Quick Links to Coaching Hub */}
        <section className="rounded-2xl bg-[#30363d] p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Coaching Business Hub</p>
          <p className="mt-1 text-xs text-slate-400">Full workspace — roadmap, agent queue, assets, leads, revenue</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Overview", "Roadmap", "Agent Queue", "Asset Library", "Leads", "Revenue"].map((section) => (
              <Link
                key={section}
                href="/coaching"
                className="rounded-full border border-cyan-300/20 bg-[#24292f] px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-300/10"
              >
                {section} →
              </Link>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="rounded-2xl border border-cyan-200/40 bg-[#1f252b] p-6 shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
            Primary Mission
          </p>
          <input
            value={data.missionTitle}
            onChange={(event) => updateMetric("missionTitle", event.target.value)}
            className="mt-3 w-full rounded-xl border border-slate-600 bg-[#24292f] p-4 text-2xl font-bold text-white outline-none focus:border-cyan-300"
          />
          <p className="mt-3 text-slate-300">
            Target: 10 clients paying an average of $250–$300/month through a
            simple system: content/ads → GHL form → intro call → Stripe/ForActive
            payment → MyStrengthBook onboarding → weekly check-ins.
          </p>
        </section>

        {/* Today's Actions */}
        <section className="rounded-2xl bg-[#30363d] p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
                Execution
              </p>
              <h2 className="mt-2 text-2xl font-bold">Today's 3 Actions</h2>
              <p className="mt-2 text-slate-300">
                One revenue action, one system action, one visibility action.
              </p>
            </div>
            <p className="rounded-full bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
              Revenue · System · Visibility
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {data.todayActions.map((item, index) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-600/60 bg-[#24292f] p-5"
              >
                <p className="text-sm font-semibold text-cyan-300">{item.label}</p>
                <textarea
                  value={item.action}
                  onChange={(event) => updateTodayAction(index, event.target.value)}
                  className="mt-3 min-h-[110px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300"
                />
                <select
                  value={item.status}
                  onChange={(event) => updateTodayStatus(index, event.target.value as TodayAction["status"])}
                  className="mt-4 w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300"
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Complete</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Money Progress */}
        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
            Money Progress
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-6">
            <MetricInput label="Current Private Clients" value={data.currentClients} onChange={(v) => updateMetric("currentClients", v)} />
            <MetricInput label="Target Private Clients" value={data.targetClients} onChange={(v) => updateMetric("targetClients", v)} />
            <MetricInput label="Current MRR" value={data.currentMRR} onChange={(v) => updateMetric("currentMRR", v)} />
            <MetricInput label="Target MRR" value={data.targetMRR} onChange={(v) => updateMetric("targetMRR", v)} />
            <MetricInput label="Leads Needing Follow-Up" value={data.leadsNeedingFollowUp} onChange={(v) => updateMetric("leadsNeedingFollowUp", v)} />
            <MetricInput label="Calls Booked" value={data.callsBooked} onChange={(v) => updateMetric("callsBooked", v)} />
          </div>
        </section>

        {/* Mission Roadmap */}
        <section className="rounded-2xl bg-[#30363d] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Mission Roadmap</p>
          <h2 className="mt-2 text-2xl font-bold">Current Build Path</h2>
          <p className="mt-2 max-w-3xl text-slate-300">
            This is where EDEN and Claude outputs should live: ad copy, funnel notes,
            onboarding scripts, task details, and asset links.
          </p>

          <div className="mt-6 space-y-4">
            {data.roadmap.map((item, index) => {
              const isExpanded = expandedRoadmapIndex === index;
              return (
                <div key={item.title} className="rounded-xl border border-slate-600 bg-[#24292f] p-5">
                  <button
                    type="button"
                    onClick={() => setExpandedRoadmapIndex(isExpanded ? null : index)}
                    className="w-full text-left"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm text-cyan-300">{item.project} · {item.assignedAgent}</p>
                        <h3 className="mt-1 text-xl font-bold">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-300">Next: {item.nextAction}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">{item.priority}</span>
                        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200">{item.status}</span>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-5 border-t border-slate-700 pt-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-cyan-300">Tasks</p>
                          <ul className="mt-3 space-y-2 text-sm text-slate-300">
                            {item.tasks.map((task) => <li key={task}>• {task}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-cyan-300">Status</p>
                          <select
                            value={item.status}
                            onChange={(e) => updateRoadmapStatus(index, e.target.value as RoadmapItem["status"])}
                            className="mt-3 w-full rounded-lg bg-[#1f252b] p-2 text-sm text-white"
                          >
                            <option>Not Started</option>
                            <option>In Progress</option>
                            <option>Complete</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-5">
                        <p className="text-sm font-semibold text-cyan-300">Agent Output / Notes</p>
                        <textarea
                          value={item.notes}
                          onChange={(e) => updateRoadmapNotes(index, e.target.value)}
                          className="mt-3 min-h-[140px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300"
                        />
                      </div>
                      <div className="mt-5">
                        <p className="text-sm font-semibold text-cyan-300">Asset Links</p>
                        <textarea
                          value={item.assetLinks}
                          onChange={(e) => updateRoadmapAssetLinks(index, e.target.value)}
                          placeholder="Paste Google Drive links, image links, video links, GHL page links, docs, etc."
                          className="mt-3 min-h-[80px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Asset Library */}
        <section className="rounded-2xl bg-[#30363d] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Asset Library</p>
          <h2 className="mt-2 text-2xl font-bold">Claude / EDEN Outputs</h2>
          <p className="mt-2 max-w-3xl text-slate-300">
            Store ad copy, video scripts, landing page copy, testimonial notes, image links, and GHL page links here.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <input placeholder="Asset title" value={newAsset.title} onChange={(e) => setNewAsset((c) => ({ ...c, title: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <input placeholder="Category (e.g. Ad Copy)" value={newAsset.category} onChange={(e) => setNewAsset((c) => ({ ...c, category: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <input placeholder="Related roadmap item" value={newAsset.relatedRoadmapItem} onChange={(e) => setNewAsset((c) => ({ ...c, relatedRoadmapItem: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <button onClick={addAsset} className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200">Add Asset</button>
          </div>

          <div className="mt-5 space-y-4">
            {data.assets.map((asset, index) => (
              <div key={`${asset.title}-${index}`} className="rounded-xl border border-slate-600 bg-[#24292f] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-cyan-300">{asset.category}{asset.relatedRoadmapItem ? ` · ${asset.relatedRoadmapItem}` : ""}</p>
                    <h3 className="mt-1 text-lg font-bold">{asset.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={asset.status} onChange={(e) => updateAssetStatus(index, e.target.value as AssetItem["status"])} className="rounded-lg bg-[#1f252b] p-2 text-sm text-white">
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
        </section>

        {/* Agent Queue */}
        <section className="rounded-2xl bg-[#30363d] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Agent Queue</p>
          <h2 className="mt-2 text-2xl font-bold">Tasks Assigned to Agents</h2>
          <p className="mt-2 max-w-3xl text-slate-300">
            Track what Claude, ChatGPT, and EDEN are working on, where their output should be saved, and what you need to do next.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <input placeholder="Task" value={newAgentTask.task} onChange={(e) => setNewAgentTask((c) => ({ ...c, task: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <input placeholder="Assigned agent" value={newAgentTask.assignedAgent} onChange={(e) => setNewAgentTask((c) => ({ ...c, assignedAgent: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <input placeholder="Project" value={newAgentTask.project} onChange={(e) => setNewAgentTask((c) => ({ ...c, project: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <button onClick={addAgentTask} className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200">Add Task</button>
          </div>

          <div className="mt-5 space-y-4">
            {data.agentQueue.map((item, index) => (
              <div key={`${item.task}-${index}`} className="rounded-xl border border-slate-600 bg-[#24292f] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-cyan-300">{item.project}{item.assignedAgent ? ` · ${item.assignedAgent}` : ""}</p>
                    <h3 className="mt-1 text-lg font-bold">{item.task}</h3>
                    {item.saveOutputTo && <p className="mt-1 text-xs text-slate-400">Save to: {item.saveOutputTo}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={item.status} onChange={(e) => updateAgentTaskStatus(index, e.target.value as AgentTask["status"])} className="rounded-lg bg-[#1f252b] p-2 text-sm text-white">
                      <option>Queued</option>
                      <option>Ready to Send</option>
                      <option>Waiting on Agent</option>
                      <option>Needs Review</option>
                      <option>Complete</option>
                    </select>
                    <button onClick={() => removeAgentTask(index)} className="rounded-lg border border-red-300/30 px-3 py-2 text-xs text-red-100 hover:bg-red-950/40">Remove</button>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-cyan-300">Output Needed</p>
                  <textarea value={item.outputNeeded} onChange={(e) => updateAgentTaskOutputNeeded(index, e.target.value)} placeholder="What should the agent produce?" className="mt-2 min-h-[80px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-cyan-300">Next Human Action</p>
                  <textarea value={item.nextHumanAction} onChange={(e) => updateAgentTaskNextHumanAction(index, e.target.value)} placeholder="What do you need to do once the agent responds?" className="mt-2 min-h-[60px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coaching System Checklist */}
        <section className="rounded-2xl bg-[#30363d] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Coaching System Checklist</p>
          <h2 className="mt-2 text-2xl font-bold">Build the Client Machine</h2>
          <div className="mt-6 space-y-4">
            {data.systemChecklist.map((item, index) => (
              <div key={item.task} className="rounded-xl border border-slate-600 bg-[#24292f] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-cyan-300">{item.area}</p>
                    <h3 className="mt-1 font-bold">{item.task}</h3>
                    <p className="mt-3 text-sm text-slate-300">Next: {item.nextAction}</p>
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) => updateChecklistStatus(index, e.target.value as SystemChecklistItem["status"])}
                    className="h-fit rounded-lg bg-[#1f252b] p-2 text-sm text-white"
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Complete</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Active Leads */}
        <section className="rounded-2xl bg-[#30363d] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Active Leads</p>
          <h2 className="mt-2 text-2xl font-bold">Follow-Up Queue</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            <input placeholder="Lead name" value={newLead.name} onChange={(e) => setNewLead((c) => ({ ...c, name: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <input placeholder="Source" value={newLead.source} onChange={(e) => setNewLead((c) => ({ ...c, source: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <input placeholder="Status" value={newLead.status} onChange={(e) => setNewLead((c) => ({ ...c, status: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <input placeholder="Next follow-up" value={newLead.nextFollowUp} onChange={(e) => setNewLead((c) => ({ ...c, nextFollowUp: e.target.value }))} className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300" />
            <button onClick={addLead} className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200">Add Lead</button>
          </div>
          <div className="mt-5 space-y-3">
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
        </section>

        {/* Blockers */}
        <section className="rounded-2xl border border-red-300/30 bg-red-950/20 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-red-200/80">Blocked / Overthinking</p>
          <h2 className="mt-2 text-2xl font-bold">Simplify the Bottleneck</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {data.blockers.map((item) => (
              <div key={item.blocker} className="rounded-xl border border-red-200/20 bg-[#24292f] p-5">
                <p className="font-semibold text-red-100">{item.blocker}</p>
                <p className="mt-3 text-sm text-slate-300">Simplified action: {item.simplifiedAction}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-cyan-200/20 bg-cyan-300/5 p-5">
            <h3 className="font-bold text-cyan-200">EDEN Rule</h3>
            <p className="mt-2 text-slate-300">
              If a task has been planned twice and still not executed, reduce it
              to the smallest sellable, publishable, or testable version.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}

function MetricInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-xl bg-[#30363d] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-700 bg-[#24292f] p-2 text-xl font-bold text-white outline-none focus:border-cyan-300"
      />
    </div>
  );
}
