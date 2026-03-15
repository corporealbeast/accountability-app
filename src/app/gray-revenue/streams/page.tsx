"use client";

import { useState } from "react";

type StreamStatus = "active" | "growing" | "paused" | "idea";
type StreamType = "saas" | "service" | "digital" | "affiliate" | "content" | "other";

interface RevenueStream {
  id: number;
  name: string;
  type: StreamType;
  status: StreamStatus;
  mrr: number;
  goal: number;
  startedDate: string;
  notes: string;
  actions: string[];
}

const statusConfig: Record<StreamStatus, { label: string; bg: string; color: string }> = {
  active:  { label: "Active",   bg: "#1e3a2f", color: "#4ade80" },
  growing: { label: "Growing",  bg: "#1a2e3a", color: "#B0E0E6" },
  paused:  { label: "Paused",   bg: "#2e2a1a", color: "#e6c87a" },
  idea:    { label: "Idea",     bg: "#2a2a2e", color: "#9aa5b0" },
};

const typeIcons: Record<StreamType, string> = {
  saas:      "🖥️",
  service:   "🤝",
  digital:   "📦",
  affiliate: "🔗",
  content:   "📢",
  other:     "💡",
};

const seedStreams: RevenueStream[] = [
  {
    id: 1,
    name: "Accountability App (SaaS)",
    type: "saas",
    status: "growing",
    mrr: 2800,
    goal: 5000,
    startedDate: "2025-11",
    notes: "Main product. Growing ~$400/mo. Focus on onboarding and reducing churn.",
    actions: ["Improve onboarding flow", "Launch referral program", "Add annual plan"],
  },
  {
    id: 2,
    name: "Coaching / Consulting",
    type: "service",
    status: "active",
    mrr: 2200,
    goal: 3000,
    startedDate: "2025-06",
    notes: "4 active clients at $550/mo. Capped at 5 clients to protect time.",
    actions: ["Raise rate to $650 for new clients", "Create group coaching offer"],
  },
  {
    id: 3,
    name: "Digital Products",
    type: "digital",
    status: "active",
    mrr: 1100,
    goal: 2000,
    startedDate: "2025-08",
    notes: "Templates and guides. Passive income. Needs new product launch to grow.",
    actions: ["Launch strength training template pack", "Create email sequence for upsell"],
  },
  {
    id: 4,
    name: "Affiliate Revenue",
    type: "affiliate",
    status: "growing",
    mrr: 740,
    goal: 1500,
    startedDate: "2025-09",
    notes: "Gym equipment and supplements. Growing with content output.",
    actions: ["Add 2 more affiliate partners", "Create dedicated resource page"],
  },
  {
    id: 5,
    name: "Content / Sponsorships",
    type: "content",
    status: "paused",
    mrr: 400,
    goal: 1000,
    startedDate: "2026-01",
    notes: "Paused outreach. Will revisit when audience hits 10k.",
    actions: ["Resume at 10k followers", "Build media kit"],
  },
  {
    id: 6,
    name: "Online Course",
    type: "digital",
    status: "idea",
    mrr: 0,
    goal: 2000,
    startedDate: "—",
    notes: "Accountability + discipline course. Waiting until app reaches $5k MRR.",
    actions: ["Outline curriculum", "Survey existing audience"],
  },
];

const streamTypes: StreamType[] = ["saas", "service", "digital", "affiliate", "content", "other"];
const streamStatuses: StreamStatus[] = ["active", "growing", "paused", "idea"];

export default function StreamsPage() {
  const [streams, setStreams] = useState<RevenueStream[]>(seedStreams);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | StreamStatus>("all");

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<StreamType>("saas");
  const [status, setStatus] = useState<StreamStatus>("idea");
  const [mrr, setMrr] = useState("");
  const [goal, setGoal] = useState("");
  const [notes, setNotes] = useState("");

  const totalMRR = streams.reduce((a, s) => a + s.mrr, 0);

  const filtered = filterStatus === "all" ? streams : streams.filter((s) => s.status === filterStatus);

  const addStream = () => {
    if (!name.trim()) return;
    setStreams((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: name.trim(),
        type,
        status,
        mrr: Number(mrr) || 0,
        goal: Number(goal) || 0,
        startedDate: new Date().toISOString().slice(0, 7),
        notes: notes.trim(),
        actions: [],
      },
    ]);
    setName(""); setMrr(""); setGoal(""); setNotes("");
    setShowForm(false);
  };

  const cycleStatus = (id: number) => {
    const order: StreamStatus[] = ["idea", "active", "growing", "paused"];
    setStreams((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: order[(order.indexOf(s.status) + 1) % order.length] }
          : s
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#B0E0E6" }}>
            📊 Revenue Streams
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#9aa5b0" }}>
            {streams.filter((s) => s.status !== "idea").length} active streams ·{" "}
            <span style={{ color: "#B0E0E6" }}>${totalMRR.toLocaleString()}/mo</span>
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80"
          style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}
        >
          + Add Stream
        </button>
      </div>

      {/* Add stream form */}
      {showForm && (
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ backgroundColor: "#36393F", border: "1px solid #B0E0E6" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#B0E0E6" }}>New Revenue Stream</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Stream name *"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
              />
            </div>

            {/* Type */}
            <div>
              <p className="text-xs mb-2" style={{ color: "#7a8a95" }}>Type</p>
              <div className="flex flex-wrap gap-1.5">
                {streamTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className="px-2.5 py-1 rounded text-xs capitalize"
                    style={{
                      backgroundColor: type === t ? "#B0E0E6" : "#23262A",
                      color: type === t ? "#23262A" : "#9aa5b0",
                    }}
                  >
                    {typeIcons[t]} {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs mb-2" style={{ color: "#7a8a95" }}>Status</p>
              <div className="flex flex-wrap gap-1.5">
                {streamStatuses.map((s) => {
                  const sc = statusConfig[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className="px-2.5 py-1 rounded text-xs"
                      style={{
                        backgroundColor: status === s ? sc.bg : "#23262A",
                        color: status === s ? sc.color : "#9aa5b0",
                        border: status === s ? `1px solid ${sc.color}` : "1px solid transparent",
                      }}
                    >
                      {sc.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              type="number"
              value={mrr}
              onChange={(e) => setMrr(e.target.value)}
              placeholder="Current MRR ($)"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
            />
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="MRR Goal ($)"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
            />
            <div className="sm:col-span-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes"
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: "#23262A", color: "#B0E0E6", border: "1px solid #2C2F33" }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={addStream} className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ backgroundColor: "#B0E0E6", color: "#23262A" }}>Save</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80" style={{ backgroundColor: "#23262A", color: "#9aa5b0" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", ...streamStatuses] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className="px-3 py-1.5 rounded-md text-xs font-medium capitalize"
            style={{
              backgroundColor: filterStatus === f ? "#B0E0E6" : "#36393F",
              color: filterStatus === f ? "#23262A" : "#9aa5b0",
            }}
          >
            {f === "all" ? `All (${streams.length})` : `${statusConfig[f].label} (${streams.filter((s) => s.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Streams list */}
      <div className="space-y-3">
        {filtered.map((stream) => {
          const sc = statusConfig[stream.status];
          const pct = stream.goal > 0 ? Math.min(Math.round((stream.mrr / stream.goal) * 100), 100) : 0;
          const isOpen = expanded === stream.id;

          return (
            <div
              key={stream.id}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33" }}
            >
              {/* Header */}
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setExpanded(isOpen ? null : stream.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">{typeIcons[stream.type]}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#B0E0E6" }}>{stream.name}</p>
                    <p className="text-xs" style={{ color: "#9aa5b0" }}>
                      Since {stream.startedDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "#B0E0E6" }}>
                      {stream.mrr > 0 ? `$${stream.mrr.toLocaleString()}` : "—"}
                    </p>
                    <p className="text-xs" style={{ color: "#7a8a95" }}>/ mo</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); cycleStatus(stream.id); }}
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: sc.bg, color: sc.color }}
                  >
                    {sc.label}
                  </button>
                  <span
                    className="text-lg transition-transform duration-200"
                    style={{ color: "#7a8a95", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    ›
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: "#2C2F33" }}>
                  {/* Goal progress */}
                  {stream.goal > 0 && (
                    <div className="pt-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span style={{ color: "#7a8a95" }}>MRR Goal: ${stream.goal.toLocaleString()}</span>
                        <span style={{ color: "#8ACDD4" }}>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#23262A" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#B0E0E6" }} />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {stream.notes && (
                    <p className="text-sm" style={{ color: "#9aa5b0" }}>{stream.notes}</p>
                  )}

                  {/* Next actions */}
                  {stream.actions.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#7a8a95" }}>Next Actions</p>
                      <ul className="space-y-1.5">
                        {stream.actions.map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#9aa5b0" }}>
                            <span style={{ color: "#B0E0E6" }}>→</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
