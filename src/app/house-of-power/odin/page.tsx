"use client";

import { useState, useEffect, useRef } from "react";
import { useOdinTasks, OdinTask, TaskStatus, TaskCategory, TaskPriority } from "@/hooks/useOdinTasks";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Activity {
  id: string;
  type: "appointment" | "lead" | "opportunity";
  title: string;
  subtitle: string;
  timestamp: string;
  status?: string;
  value?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const activityConfig = {
  appointment: { icon: "📅", color: "#B0E0E6", label: "Appointment booked" },
  lead:        { icon: "👤", color: "#4ade80", label: "New lead added"     },
  opportunity: { icon: "💰", color: "#e6c87a", label: "Opportunity updated"},
};

const categoryConfig: Record<TaskCategory, { icon: string; color: string }> = {
  leads:        { icon: "👤", color: "#4ade80" },
  appointments: { icon: "📅", color: "#B0E0E6" },
  campaigns:    { icon: "📧", color: "#c084fc" },
  "follow-up":  { icon: "🔄", color: "#fb923c" },
  payments:     { icon: "💳", color: "#e6c87a" },
  pipeline:     { icon: "🔀", color: "#60a5fa" },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  high:   { label: "High",   color: "#e05252", bg: "rgba(224,82,82,0.15)"   },
  medium: { label: "Medium", color: "#e6c87a", bg: "rgba(230,200,122,0.15)" },
  low:    { label: "Low",    color: "#7a8a95", bg: "rgba(122,138,149,0.15)" },
};

const columns: { key: TaskStatus; label: string; color: string }[] = [
  { key: "planned",     label: "Planned",     color: "#7a8a95" },
  { key: "in-progress", label: "In Progress", color: "#e6c87a" },
  { key: "done",        label: "Done",        color: "#4ade80" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function buildContext(activities: Activity[], tasks: OdinTask[]): string {
  const actLines = activities.slice(0, 6).map(
    (a) => `- [${a.type}] ${a.title}: ${a.subtitle} (${relativeTime(a.timestamp)})`
  );
  const taskLines = tasks
    .filter((t) => t.status !== "done")
    .slice(0, 6)
    .map((t) => `- [${t.status}] ${t.title}`);
  return [
    actLines.length ? `Recent CRM activity:\n${actLines.join("\n")}` : "",
    taskLines.length ? `Current task pipeline:\n${taskLines.join("\n")}` : "",
  ].filter(Boolean).join("\n\n");
}

function normalizeActivities(data: {
  contacts:     { contacts?:     { id: string; firstName?: string; lastName?: string; email?: string; dateAdded?: string }[] };
  appointments: { appointments?: { id: string; title?: string; startTime?: string; status?: string }[] };
  opportunities:{ opportunities?: { id: string; name?: string; monetaryValue?: number; status?: string; stage?: { name?: string }; contact?: { name?: string }; createdAt?: string }[] };
}): Activity[] {
  const out: Activity[] = [];

  for (const c of data.contacts?.contacts ?? []) {
    out.push({ id: `lead-${c.id}`, type: "lead", title: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "New contact", subtitle: c.email ?? "No email", timestamp: c.dateAdded ?? new Date().toISOString(), status: "New" });
  }
  for (const a of data.appointments?.appointments ?? []) {
    out.push({ id: `appt-${a.id}`, type: "appointment", title: a.title ?? "Appointment", subtitle: a.status ? `Status: ${a.status}` : "", timestamp: a.startTime ?? new Date().toISOString(), status: a.status ?? "Booked" });
  }
  for (const o of data.opportunities?.opportunities ?? []) {
    out.push({ id: `opp-${o.id}`, type: "opportunity", title: o.name ?? o.contact?.name ?? "Opportunity", subtitle: o.stage?.name ?? o.status ?? "", timestamp: o.createdAt ?? new Date().toISOString(), status: o.status, value: o.monetaryValue ? `$${o.monetaryValue.toLocaleString()}` : undefined });
  }

  return out.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ── Task Card ─────────────────────────────────────────────────────────────────

function TaskCard({ task, onMove, onDelete }: { task: OdinTask; onMove: (id: string, s: TaskStatus) => void; onDelete: (id: string) => void }) {
  const cat  = categoryConfig[task.category];
  const pri  = priorityConfig[task.priority];
  const [confirm, setConfirm] = useState(false);

  const prev: TaskStatus | null = task.status === "in-progress" ? "planned"     : task.status === "done" ? "in-progress" : null;
  const next: TaskStatus | null = task.status === "planned"     ? "in-progress" : task.status === "in-progress" ? "done"  : null;

  return (
    <div style={{ backgroundColor: "#2C2F33", border: "1px solid #23262A", borderLeft: `3px solid ${cat.color}`, borderRadius: "9px", padding: "12px 13px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>{cat.icon}</span>
        <p style={{ flex: 1, fontSize: "13px", fontWeight: 500, color: "#B0E0E6", margin: 0, lineHeight: 1.4 }}>{task.title}</p>
      </div>

      {/* Description */}
      <p style={{ fontSize: "12px", color: "#7a8a95", margin: 0, lineHeight: 1.5 }}>{task.description}</p>

      {/* Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "20px", backgroundColor: pri.bg, color: pri.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {pri.label}
        </span>
        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "20px", backgroundColor: "rgba(255,255,255,0.05)", color: "#7a8a95", textTransform: "capitalize" }}>
          {task.category}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
        {prev && (
          <button onClick={() => onMove(task.id, prev)} style={{ flex: 1, padding: "5px 8px", borderRadius: "6px", border: "1px solid #36393F", backgroundColor: "transparent", color: "#7a8a95", fontSize: "11px", cursor: "pointer" }}>
            ← Back
          </button>
        )}
        {next && (
          <button onClick={() => onMove(task.id, next)} style={{ flex: 1, padding: "5px 8px", borderRadius: "6px", border: "none", backgroundColor: task.status === "planned" ? "rgba(230,200,122,0.2)" : "rgba(74,222,128,0.2)", color: task.status === "planned" ? "#e6c87a" : "#4ade80", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
            {task.status === "planned" ? "▶ Start" : "✓ Done"}
          </button>
        )}
        {confirm ? (
          <button onClick={() => onDelete(task.id)} style={{ padding: "5px 8px", borderRadius: "6px", border: "none", backgroundColor: "rgba(224,82,82,0.2)", color: "#e05252", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
            Confirm
          </button>
        ) : (
          <button onClick={() => setConfirm(true)} onBlur={() => setConfirm(false)} style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #36393F", backgroundColor: "transparent", color: "#4a5568", fontSize: "11px", cursor: "pointer" }}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ── Pipeline View ─────────────────────────────────────────────────────────────

function PipelineView({ tasks, onMove, onDelete }: { tasks: OdinTask[]; onMove: (id: string, s: TaskStatus) => void; onDelete: (id: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", alignItems: "start" }}>
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div key={col.key}>
            {/* Column header */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: col.color, flexShrink: 0 }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: col.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>{col.label}</span>
              <span style={{ fontSize: "11px", color: "#4a5568", marginLeft: "auto" }}>{colTasks.length}</span>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: "60px" }}>
              {colTasks.length === 0 ? (
                <div style={{ border: "1px dashed #2C2F33", borderRadius: "9px", padding: "20px", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#4a5568", margin: 0 }}>Empty</p>
                </div>
              ) : (
                colTasks.map((t) => (
                  <TaskCard key={t.id} task={t} onMove={onMove} onDelete={onDelete} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

function ActivityFeed({ activities, loading, error }: { activities: Activity[]; loading: boolean; error: string | null }) {
  if (loading) return (
    <div style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#7a8a95", fontSize: "13px" }}>
      Fetching CRM data…
    </div>
  );

  if (error) return (
    <div style={{ padding: "12px 16px", backgroundColor: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.3)", borderRadius: "8px", fontSize: "13px", color: "#e05252" }}>
      {error}
    </div>
  );

  if (activities.length === 0) return (
    <div style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "12px", padding: "40px", textAlign: "center" }}>
      <p style={{ color: "#7a8a95", fontSize: "14px", margin: 0 }}>No recent activity found.</p>
      <p style={{ color: "#4a5568", fontSize: "12px", marginTop: "6px" }}>Check that your GHL credentials are correct in .env.local</p>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {activities.map((a) => {
          const cfg = activityConfig[a.type];
          return (
            <div key={a.id} style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderLeft: `3px solid ${cfg.color}`, borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>{cfg.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{cfg.label}</span>
                  {a.value && <span style={{ fontSize: "11px", color: "#e6c87a", fontWeight: 600 }}>{a.value}</span>}
                </div>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#B0E0E6", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                {a.subtitle && <p style={{ fontSize: "12px", color: "#9aa5b0", margin: 0 }}>{a.subtitle}</p>}
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <p style={{ fontSize: "11px", color: "#7a8a95", margin: "0 0 4px" }}>{relativeTime(a.timestamp)}</p>
                {a.status && (
                  <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: ["booked","confirmed"].includes(a.status.toLowerCase()) ? "rgba(74,222,128,0.15)" : "rgba(154,165,176,0.15)", color: ["booked","confirmed"].includes(a.status.toLowerCase()) ? "#4ade80" : "#9aa5b0" }}>
                    {a.status}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginTop: "16px" }}>
        {(["appointment","lead","opportunity"] as const).map((type) => {
          const count = activities.filter((a) => a.type === type).length;
          const cfg = activityConfig[type];
          return (
            <div key={type} style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
              <p style={{ fontSize: "22px", fontWeight: 700, color: cfg.color, margin: "0 0 2px" }}>{count}</p>
              <p style={{ fontSize: "11px", color: "#7a8a95", margin: 0, textTransform: "capitalize" }}>{type}s</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OdinPage() {
  const { tasks, moveTask, deleteTask } = useOdinTasks();
  const [tab,         setTab]         = useState<"activity" | "pipeline">("pipeline");
  const [extraWidth,  setExtraWidth]  = useState(0);
  const [activities,  setActivities]  = useState<Activity[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [messages,    setMessages]    = useState<ChatMessage[]>([
    { role: "assistant", content: "I'm Eden. Ask me what I'm working on, or check the pipeline for current tasks." },
  ]);
  const [input,       setInput]       = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ghl")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setFetchError(data.error); return; }
        setActivities(normalizeActivities(data));
      })
      .catch(() => setFetchError("Could not reach GHL API."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const refresh = () => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/ghl")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setFetchError(data.error); return; }
        setActivities(normalizeActivities(data));
      })
      .catch(() => setFetchError("Could not reach GHL API."))
      .finally(() => setLoading(false));
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || chatLoading) return;
    setInput("");
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map((m) => ({ role: m.role, content: m.content })), context: buildContext(activities, tasks) }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? data.error ?? "No response." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Pipeline summary stats
  const pipelineStats = columns.map((c) => ({ ...c, count: tasks.filter((t) => t.status === c.key).length }));

  return (
    <div style={{ marginLeft: `-${extraWidth}px`, marginRight: `-${extraWidth}px`, transition: "margin 0.15s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "13px", color: "#7a8a95", margin: "0 0 4px" }}>House of Power · AI Operations</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#B0E0E6", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              ⚡ Eden
            </h1>
            <p style={{ fontSize: "13px", color: "#9aa5b0", margin: 0 }}>
              AI agent operations — tasks, CRM activity, and direct comms
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            {/* Width slider */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "#7a8a95", whiteSpace: "nowrap" }}>↔ Width</span>
              <input
                type="range"
                min={0}
                max={400}
                step={10}
                value={extraWidth}
                onChange={(e) => setExtraWidth(Number(e.target.value))}
                style={{ width: "100px", accentColor: "#B0E0E6", cursor: "pointer" }}
              />
            </div>
            <button onClick={refresh} disabled={loading} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #36393F", backgroundColor: "#36393F", color: loading ? "#7a8a95" : "#B0E0E6", fontSize: "13px", fontWeight: 500, cursor: loading ? "default" : "pointer", whiteSpace: "nowrap" }}>
              {loading ? "Loading…" : "↻ Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Chat panel — full width, compact */}
      <div style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "12px", marginBottom: "20px", display: "flex", flexDirection: "column", height: "220px" }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#4ade80", flexShrink: 0 }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#B0E0E6" }}>Eden</span>
            <span style={{ fontSize: "11px", color: "#4a5568" }}>AI Agent · Online</span>
            <span style={{ fontSize: "10px", color: "#4a5568", marginLeft: "auto" }}>
              Context: {Math.min(activities.length, 6)} CRM events · {tasks.filter(t => t.status !== "done").length} active tasks
            </span>
          </div>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "70%", padding: "7px 11px", borderRadius: msg.role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", backgroundColor: msg.role === "user" ? "#B0E0E6" : "#2C2F33", color: msg.role === "user" ? "#23262A" : "#9aa5b0", fontSize: "13px", lineHeight: 1.5 }}>
                {msg.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "7px 12px", borderRadius: "10px 10px 10px 2px", backgroundColor: "#2C2F33", color: "#7a8a95", fontSize: "13px" }}>…</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "10px 12px", borderTop: "1px solid #2C2F33", display: "flex", gap: "8px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask Eden anything…"
            style={{ flex: 1, backgroundColor: "#2C2F33", border: "1px solid #23262A", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#B0E0E6", outline: "none", fontFamily: "inherit" }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || chatLoading} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: input.trim() && !chatLoading ? "#B0E0E6" : "#2C2F33", color: input.trim() && !chatLoading ? "#23262A" : "#4a5568", fontSize: "13px", fontWeight: 600, cursor: input.trim() && !chatLoading ? "pointer" : "default", flexShrink: 0 }}>
            Send
          </button>
        </div>
      </div>

      {/* Pipeline summary pills + tab toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {pipelineStats.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 11px", backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "20px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: s.color }} />
              <span style={{ fontSize: "12px", color: "#9aa5b0" }}>{s.label}</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: s.color }}>{s.count}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "4px", backgroundColor: "#2C2F33", borderRadius: "8px", padding: "3px" }}>
          {([["pipeline","🗂 Task Pipeline"],["activity","📊 CRM Activity"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: "6px 14px", borderRadius: "6px", border: "none", backgroundColor: tab === key ? "#36393F" : "transparent", color: tab === key ? "#B0E0E6" : "#7a8a95", fontSize: "13px", fontWeight: tab === key ? 600 : 400, cursor: "pointer", transition: "all 0.1s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content — full width */}
      {tab === "pipeline" ? (
        <PipelineView tasks={tasks} onMove={moveTask} onDelete={deleteTask} />
      ) : (
        <ActivityFeed activities={activities} loading={loading} error={fetchError} />
      )}
    </div>
  );
}
