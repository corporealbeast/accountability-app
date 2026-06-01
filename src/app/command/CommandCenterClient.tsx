"use client";

import { useEffect, useState } from "react";

type TodayAction = {
  label: string;
  action: string;
  status: "Not Started" | "In Progress" | "Complete";
};

type Lead = {
  name: string;
  source: string;
  status: string;
  value: string;
  nextFollowUp: string;
};

type SystemChecklistItem = {
  area: string;
  task: string;
  status: "Not Started" | "In Progress" | "Complete";
  nextAction: string;
};

type AssetItem = {
  title: string;
  category: string;
  relatedRoadmapItem: string;
  content: string;
  link: string;
  status: "Draft" | "Ready" | "Used";
};

type RoadmapItem = {
  title: string;
  project: string;
  status: "Not Started" | "In Progress" | "Complete";
  priority: "Low" | "Medium" | "High";
  assignedAgent: string;
  nextAction: string;
  tasks: string[];
  notes: string;
  assetLinks: string;
};

type CommandData = {
  missionTitle: string;
  currentMRR: string;
  targetMRR: string;
  currentClients: string;
  targetClients: string;
  leadsNeedingFollowUp: string;
  callsBooked: string;
  todayActions: TodayAction[];
  leads: Lead[];
  systemChecklist: SystemChecklistItem[];
  roadmap: RoadmapItem[];
  assets: AssetItem[];
  blockers: {
    blocker: string;
    simplifiedAction: string;
  }[];
};

const defaultData: CommandData = {
  missionTitle: "Add $3,000/month recurring from private coaching clients.",
  currentMRR: "$0",
  targetMRR: "$3,000",
  currentClients: "0",
  targetClients: "10",
  leadsNeedingFollowUp: "0",
  callsBooked: "0",
  todayActions: [
    {
      label: "Revenue Action",
      action: "Create a list of 20 old clients/leads and message the first 10.",
      status: "Not Started",
    },
    {
      label: "System Action",
      action: "Finish Day 1 only of the MyStrengthBook 3-day strength template.",
      status: "Not Started",
    },
    {
      label: "Visibility Action",
      action: "Post one story: “I’m opening 5 online strength coaching spots.”",
      status: "Not Started",
    },
  ],
  leads: [
  {
    name: "Old Client Reactivation List",
    source: "Previous clients",
    status: "Needs Outreach",
    value: "$250–$300/mo each",
    nextFollowUp: "Today",
  },
],

systemChecklist: [
  {
    area: "Offer",
    task: "Define founding client offer",
    status: "Not Started",
    nextAction: "Set the offer at $250–$300/month with weekly programming, check-ins, and adjustments.",
  },
  {
    area: "Funnel",
    task: "Finish GHL mobile page",
    status: "Not Started",
    nextAction: "Build one page with headline, proof, offer, and form.",
  },
  {
    area: "Programming",
    task: "Finish 3-day MyStrengthBook template",
    status: "In Progress",
    nextAction: "Finish Day 1 first. Do not build the full library yet.",
  },
  {
    area: "Onboarding",
    task: "Create new client onboarding checklist",
    status: "Not Started",
    nextAction: "Map payment → intake → app invite → first program → first check-in.",
  },
],

roadmap: [
  {
    title: "Build Coaching Offer",
    project: "Personal Coaching",
    status: "In Progress",
    priority: "High",
    assignedAgent: "EDEN / Claude Ads Agent",
    nextAction: "Finalize the founding client offer and price.",
    tasks: [
      "Define offer",
      "Pick price",
      "Write sales call outline",
      "Write reactivation message",
    ],
    notes:
      "This is the core offer for getting 10 clients at $250–$300/month.",
    assetLinks: "",
  },
  {
    title: "Create First Coaching Ad Campaign",
    project: "Personal Coaching",
    status: "Not Started",
    priority: "High",
    assignedAgent: "Claude Ads Agent",
    nextAction: "Generate 3 ad angles, hooks, captions, and one short video script.",
    tasks: [
      "Write 3 campaign angles",
      "Write hooks",
      "Write boosted post caption",
      "Write video script",
      "Choose CTA",
      "Launch or boost post",
    ],
    notes:
      "This is where Claude ad copy, hooks, and video scripts should be pasted.",
    assetLinks: "",
  },
  {
    title: "Build GHL Coaching Funnel",
    project: "Personal Coaching",
    status: "Not Started",
    priority: "High",
    assignedAgent: "Claude Funnel/Ops Agent",
    nextAction: "Create one mobile GHL page with headline, proof, offer, and form.",
    tasks: [
      "Write headline",
      "Write proof section",
      "Write offer section",
      "Add form",
      "Add calendar or intro call CTA",
      "Test submission",
    ],
    notes:
      "This card should hold funnel copy, form links, calendar links, and follow-up sequence ideas.",
    assetLinks: "",
  },
  {
    title: "Build Client Onboarding System",
    project: "Personal Coaching",
    status: "Not Started",
    priority: "High",
    assignedAgent: "Claude Funnel/Ops Agent",
    nextAction: "Map payment → intake → MSB invite → first program → first check-in.",
    tasks: [
      "Confirm payment link",
      "Create intake form",
      "Create welcome message",
      "Create MSB invite process",
      "Create first check-in instructions",
    ],
    notes:
      "This card should hold onboarding scripts, checklists, and automation notes.",
    assetLinks: "",
  },
  {
    title: "Testimonial / Transformation Library",
    project: "Personal Coaching",
    status: "Not Started",
    priority: "High",
    assignedAgent: "EDEN / Claude Funnel-Ops Agent",
    nextAction: "Create a place to store client proof, quotes, screenshots, PRs, and transformation notes.",
    tasks: [
      "Define testimonial fields",
      "Collect old client proof",
      "Add permission status",
      "Mark testimonials usable for landing page or ads",
      "Save asset links",
    ],
    notes:
      "This card will hold client proof, transformation screenshots, quotes, PRs, and permission notes. Eventually this should become a testimonial database that can feed the landing page proof section.",
    assetLinks: "",
  },
  {
    title: "Landing Page Proof Section",
    project: "Personal Coaching",
    status: "Not Started",
    priority: "High",
    assignedAgent: "Claude Funnel/Ops Agent",
    nextAction: "Draft the landing page proof section using testimonials, credibility, and client outcomes.",
    tasks: [
      "Write proof section headline",
      "Add personal credibility",
      "Add testimonials",
      "Add transformation/result examples",
      "Add CTA under proof section",
    ],
    notes:
      "This card should hold the copy for the GHL landing page proof section. It should eventually pull from the Testimonial / Transformation Library.",
    assetLinks: "",
  },
],

assets: [
  {
    title: "First Coaching Ad Copy",
    category: "Ad Copy",
    relatedRoadmapItem: "Create First Coaching Ad Campaign",
    content: "",
    link: "",
    status: "Draft",
  },
  {
    title: "GHL Landing Page Copy",
    category: "Funnel Copy",
    relatedRoadmapItem: "Build GHL Coaching Funnel",
    content: "",
    link: "",
    status: "Draft",
  },
  {
    title: "Testimonial / Proof Notes",
    category: "Proof",
    relatedRoadmapItem: "Testimonial / Transformation Library",
    content: "",
    link: "",
    status: "Draft",
  },
],

blockers: [
    {
      blocker: "MyStrengthBook setup",
      simplifiedAction:
        "Build one 3-day template only. Do not build the whole library yet.",
    },
    {
      blocker: "GHL mobile funnel",
      simplifiedAction:
        "Create one page: headline, proof, offer, form.",
    },
    {
      blocker: "Ads hesitation",
      simplifiedAction:
        "Boost one simple coaching post for $5/day with a DM CTA.",
    },
    {
      blocker: "Claude setup time sink",
      simplifiedAction:
        "Use EDEN for routing. Use ChatGPT for code execution.",
    },
  ],
};

const storageKey = "eden-command-center-v1";

export default function CommandCenterClient() {
  const [data, setData] = useState<CommandData>(defaultData);
  const [expandedRoadmapIndex, setExpandedRoadmapIndex] = useState<number | null>(0);

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

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);

    if (saved) {
      const parsed = JSON.parse(saved);
      setData({
        ...parsed,
        assets: parsed.assets ?? defaultData.assets,
      });
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  function updateMetric(field: keyof CommandData, value: string) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateTodayAction(index: number, value: string) {
    setData((current) => {
      const updated = [...current.todayActions];
      updated[index] = {
        ...updated[index],
        action: value,
      };

      return {
        ...current,
        todayActions: updated,
      };
    });
  }

  function updateTodayStatus(index: number, status: TodayAction["status"]) {
    setData((current) => {
      const updated = [...current.todayActions];
      updated[index] = {
        ...updated[index],
        status,
      };

      return {
        ...current,
        todayActions: updated,
      };
    });
  }
  function updateChecklistStatus(
  index: number,
  status: SystemChecklistItem["status"]
) {
  setData((current) => {
    const updated = [...current.systemChecklist];

    updated[index] = {
      ...updated[index],
      status,
    };

    return {
      ...current,
      systemChecklist: updated,
    };
  });
}
function updateRoadmapStatus(index: number, status: RoadmapItem["status"]) {
  setData((current) => {
    const updated = [...current.roadmap];

    updated[index] = {
      ...updated[index],
      status,
    };

    return {
      ...current,
      roadmap: updated,
    };
  });
}

function updateRoadmapNotes(index: number, notes: string) {
  setData((current) => {
    const updated = [...current.roadmap];

    updated[index] = {
      ...updated[index],
      notes,
    };

    return {
      ...current,
      roadmap: updated,
    };
  });
}

function updateRoadmapAssetLinks(index: number, assetLinks: string) {
  setData((current) => {
    const updated = [...current.roadmap];

    updated[index] = {
      ...updated[index],
      assetLinks,
    };

    return {
      ...current,
      roadmap: updated,
    };
  });
}

  function addAsset() {
    if (!newAsset.title.trim()) return;

    setData((current) => ({
      ...current,
      assets: [...current.assets, newAsset],
    }));

    setNewAsset({
      title: "",
      category: "",
      relatedRoadmapItem: "",
      content: "",
      link: "",
      status: "Draft",
    });
  }

  function removeAsset(index: number) {
    setData((current) => ({
      ...current,
      assets: current.assets.filter((_, i) => i !== index),
    }));
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

    setNewLead({
      name: "",
      source: "",
      status: "New",
      value: "$250/mo",
      nextFollowUp: "",
    });
  }

  function removeLead(index: number) {
    setData((current) => ({
      ...current,
      leads: current.leads.filter((_, i) => i !== index),
    }));
  }

  function resetDashboard() {
    const confirmed = window.confirm(
      "Reset the Command Center back to the default starter data?"
    );

    if (!confirmed) return;

    setData(defaultData);
    window.localStorage.setItem(storageKey, JSON.stringify(defaultData));
  }

  return (
    <main className="min-h-screen bg-[#24292f] text-[#d8faff] px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/70">
              EDEN Command Center
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Private Coaching Mission
            </h1>

            <p className="mt-3 max-w-3xl text-slate-300">
              This is now editable. It saves in your browser for now. Later we
              can connect this to Supabase, GHL, Stripe, Google Sheets, and
              MyStrengthBook where possible.
            </p>
          </div>

          <button
            onClick={resetDashboard}
            className="rounded-xl border border-red-300/30 bg-red-950/30 px-4 py-2 text-sm text-red-100 hover:bg-red-900/40"
          >
            Reset Local Data
          </button>
        </section>

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

        <section className="rounded-2xl bg-[#30363d] p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
                Execution
              </p>
              <h2 className="mt-2 text-2xl font-bold">Today’s 3 Actions</h2>
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
                <p className="text-sm font-semibold text-cyan-300">
                  {item.label}
                </p>

                <textarea
                  value={item.action}
                  onChange={(event) =>
                    updateTodayAction(index, event.target.value)
                  }
                  className="mt-3 min-h-[110px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300"
                />

                <select
                  value={item.status}
                  onChange={(event) =>
                    updateTodayStatus(
                      index,
                      event.target.value as TodayAction["status"]
                    )
                  }
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

        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
            Money Progress
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-6">
            <MetricInput
              label="Current Private Clients"
              value={data.currentClients}
              onChange={(value) => updateMetric("currentClients", value)}
            />
            <MetricInput
              label="Target Private Clients"
              value={data.targetClients}
              onChange={(value) => updateMetric("targetClients", value)}
            />
            <MetricInput
              label="Current MRR"
              value={data.currentMRR}
              onChange={(value) => updateMetric("currentMRR", value)}
            />
            <MetricInput
              label="Target MRR"
              value={data.targetMRR}
              onChange={(value) => updateMetric("targetMRR", value)}
            />
            <MetricInput
              label="Leads Needing Follow-Up"
              value={data.leadsNeedingFollowUp}
              onChange={(value) => updateMetric("leadsNeedingFollowUp", value)}
            />
            <MetricInput
              label="Calls Booked"
              value={data.callsBooked}
              onChange={(value) => updateMetric("callsBooked", value)}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-[#30363d] p-6">
  <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
    Mission Roadmap
  </p>

  <h2 className="mt-2 text-2xl font-bold">
    Current Build Path
  </h2>

  <p className="mt-2 max-w-3xl text-slate-300">
    This is where EDEN and Claude outputs should live: ad copy, funnel notes,
    onboarding scripts, task details, and asset links.
  </p>

  <div className="mt-6 space-y-4">
    {data.roadmap.map((item, index) => {
      const isExpanded = expandedRoadmapIndex === index;

      return (
        <div
          key={item.title}
          className="rounded-xl border border-slate-600 bg-[#24292f] p-5"
        >
          <button
            type="button"
            onClick={() =>
              setExpandedRoadmapIndex(isExpanded ? null : index)
            }
            className="w-full text-left"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm text-cyan-300">
                  {item.project} · {item.assignedAgent}
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  Next: {item.nextAction}
                </p>
              </div>

              <div className="flex gap-2">
                <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                  {item.priority}
                </span>

                <span className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200">
                  {item.status}
                </span>
              </div>
            </div>
          </button>

          {isExpanded ? (
            <div className="mt-5 border-t border-slate-700 pt-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-cyan-300">
                    Tasks
                  </p>

                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {item.tasks.map((task) => (
                      <li key={task}>• {task}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-cyan-300">
                    Status
                  </p>

                  <select
                    value={item.status}
                    onChange={(event) =>
                      updateRoadmapStatus(
                        index,
                        event.target.value as RoadmapItem["status"]
                      )
                    }
                    className="mt-3 w-full rounded-lg bg-[#1f252b] p-2 text-sm text-white"
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Complete</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-cyan-300">
                  Agent Output / Notes
                </p>

                <textarea
                  value={item.notes}
                  onChange={(event) =>
                    updateRoadmapNotes(index, event.target.value)
                  }
                  className="mt-3 min-h-[140px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300"
                />
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-cyan-300">
                  Asset Links
                </p>

                <textarea
                  value={item.assetLinks}
                  onChange={(event) =>
                    updateRoadmapAssetLinks(index, event.target.value)
                  }
                  placeholder="Paste Google Drive links, image links, video links, GHL page links, docs, etc."
                  className="mt-3 min-h-[80px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300"
                />
              </div>
            </div>
          ) : null}
        </div>
      );
    })}
  </div>
</section>
        <section className="rounded-2xl bg-[#30363d] p-6">
  <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
    Asset Library
  </p>

  <h2 className="mt-2 text-2xl font-bold">Claude / EDEN Outputs</h2>

  <p className="mt-2 max-w-3xl text-slate-300">
    Store ad copy, video scripts, landing page copy, testimonial notes, image links, and GHL page links here.
  </p>

  <div className="mt-5 grid gap-3 md:grid-cols-4">
    <input
      placeholder="Asset title"
      value={newAsset.title}
      onChange={(e) => setNewAsset((c) => ({ ...c, title: e.target.value }))}
      className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300"
    />
    <input
      placeholder="Category (e.g. Ad Copy)"
      value={newAsset.category}
      onChange={(e) => setNewAsset((c) => ({ ...c, category: e.target.value }))}
      className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300"
    />
    <input
      placeholder="Related roadmap item"
      value={newAsset.relatedRoadmapItem}
      onChange={(e) => setNewAsset((c) => ({ ...c, relatedRoadmapItem: e.target.value }))}
      className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300"
    />
    <button
      onClick={addAsset}
      className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200"
    >
      Add Asset
    </button>
  </div>

  <div className="mt-5 space-y-4">
    {data.assets.map((asset, index) => (
      <div
        key={`${asset.title}-${index}`}
        className="rounded-xl border border-slate-600 bg-[#24292f] p-5"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-cyan-300">
              {asset.category}{asset.relatedRoadmapItem ? ` · ${asset.relatedRoadmapItem}` : ""}
            </p>
            <h3 className="mt-1 text-lg font-bold">{asset.title}</h3>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={asset.status}
              onChange={(e) => updateAssetStatus(index, e.target.value as AssetItem["status"])}
              className="rounded-lg bg-[#1f252b] p-2 text-sm text-white"
            >
              <option>Draft</option>
              <option>Ready</option>
              <option>Used</option>
            </select>
            <button
              onClick={() => removeAsset(index)}
              className="rounded-lg border border-red-300/30 px-3 py-2 text-xs text-red-100 hover:bg-red-950/40"
            >
              Remove
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-cyan-300">Content</p>
          <textarea
            value={asset.content}
            onChange={(e) => updateAssetContent(index, e.target.value)}
            placeholder="Paste Claude/EDEN output, copy, notes, or scripts here."
            className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300"
          />
        </div>

        <div className="mt-3">
          <p className="text-sm font-semibold text-cyan-300">Link</p>
          <input
            value={asset.link}
            onChange={(e) => updateAssetLink(index, e.target.value)}
            placeholder="Google Drive, GHL page, image, or video link"
            className="mt-2 w-full rounded-xl border border-slate-700 bg-[#1f252b] p-3 text-sm text-white outline-none focus:border-cyan-300"
          />
        </div>
      </div>
    ))}
  </div>
</section>

        <section className="rounded-2xl bg-[#30363d] p-6">
  <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
    Coaching System Checklist
  </p>

  <h2 className="mt-2 text-2xl font-bold">Build the Client Machine</h2>

  <div className="mt-6 space-y-4">
    {data.systemChecklist.map((item, index) => (
      <div
        key={item.task}
        className="rounded-xl border border-slate-600 bg-[#24292f] p-5"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-cyan-300">{item.area}</p>
            <h3 className="mt-1 font-bold">{item.task}</h3>
            <p className="mt-3 text-sm text-slate-300">
              Next: {item.nextAction}
            </p>
          </div>

          <select
            value={item.status}
            onChange={(event) =>
              updateChecklistStatus(
                index,
                event.target.value as SystemChecklistItem["status"]
              )
            }
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

<section className="rounded-2xl bg-[#30363d] p-6">
  <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">
    Active Leads
  </p>

  <h2 className="mt-2 text-2xl font-bold">Follow-Up Queue</h2>

  <div className="mt-5 grid gap-3 md:grid-cols-5">
    <input
      placeholder="Lead name"
      value={newLead.name}
      onChange={(event) =>
        setNewLead((current) => ({
          ...current,
          name: event.target.value,
        }))
      }
      className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300"
    />

    <input
      placeholder="Source"
      value={newLead.source}
      onChange={(event) =>
        setNewLead((current) => ({
          ...current,
          source: event.target.value,
        }))
      }
      className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300"
    />

    <input
      placeholder="Status"
      value={newLead.status}
      onChange={(event) =>
        setNewLead((current) => ({
          ...current,
          status: event.target.value,
        }))
      }
      className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300"
    />

    <input
      placeholder="Next follow-up"
      value={newLead.nextFollowUp}
      onChange={(event) =>
        setNewLead((current) => ({
          ...current,
          nextFollowUp: event.target.value,
        }))
      }
      className="rounded-xl border border-slate-700 bg-[#24292f] p-3 text-sm text-white outline-none focus:border-cyan-300"
    />

    <button
      onClick={addLead}
      className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200"
    >
      Add Lead
    </button>
  </div>

  <div className="mt-5 space-y-3">
    {data.leads.map((lead, index) => (
      <div
        key={`${lead.name}-${index}`}
        className="rounded-xl border border-slate-600/60 bg-[#24292f] p-4"
      >
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h3 className="font-bold">{lead.name}</h3>
            <p className="mt-2 text-sm text-slate-400">
              Source: {lead.source || "—"} · Status: {lead.status}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Next follow-up: {lead.nextFollowUp || "—"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-cyan-300">{lead.value}</span>
            <button
              onClick={() => removeLead(index)}
              className="rounded-lg border border-red-300/30 px-3 py-2 text-xs text-red-100 hover:bg-red-950/40"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

        <section className="rounded-2xl border border-red-300/30 bg-red-950/20 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-red-200/80">
            Blocked / Overthinking
          </p>

          <h2 className="mt-2 text-2xl font-bold">Simplify the Bottleneck</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {data.blockers.map((item) => (
              <div
                key={item.blocker}
                className="rounded-xl border border-red-200/20 bg-[#24292f] p-5"
              >
                <p className="font-semibold text-red-100">{item.blocker}</p>

                <p className="mt-3 text-sm text-slate-300">
                  Simplified action: {item.simplifiedAction}
                </p>
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

function MetricInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
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