"use client";

import { useState } from "react";
import { Trophy, AlertTriangle, Target, Calendar, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useStrongmanPrep, EventStatus, StrongmanEvent, PeakDay } from "@/hooks/useStrongmanPrep";

const statusConfig: Record<EventStatus, { label: string; color: string; bg: string }> = {
  ready:   { label: "Ready",   color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
  caution: { label: "Caution", color: "#e6c87a", bg: "rgba(230,200,122,0.12)" },
  hold:    { label: "Hold",    color: "#9aa5b0", bg: "rgba(154,165,176,0.12)" },
};

export default function StrongmanPrepPage() {
  const { data, updateStats, updateInjuryAlert, updateEvent, addEvent, deleteEvent, updatePeakDay, addPeakDay, deletePeakDay } = useStrongmanPrep();
  const { stats, injuryAlert, events, peakWeek } = data;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "36px" }}>
        <p style={{ fontSize: "12px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
          Competition Prep
        </p>
        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#B0E0E6", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Strongman Prep
        </h1>
        <EditableText
          value={stats.competitionSub}
          onChange={(v) => updateStats({ competitionSub: v })}
          style={{ fontSize: "15px", color: "#9aa5b0" }}
          placeholder="Competition name & date"
        />
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "28px" }}>
        <StatCard
          icon={<Calendar size={18} />}
          label="Competition"
          value={stats.competition}
          sub={stats.competitionSub}
          onChangeValue={(v) => updateStats({ competition: v })}
          onChangeSub={(v) => updateStats({ competitionSub: v })}
        />
        <StatCard
          icon={<Trophy size={18} />}
          label="Target"
          value={stats.target}
          sub={stats.targetSub}
          onChangeValue={(v) => updateStats({ target: v })}
          onChangeSub={(v) => updateStats({ targetSub: v })}
        />
        <StatCard
          icon={<Target size={18} />}
          label="Weight"
          value={stats.weight}
          sub={stats.weightSub}
          onChangeValue={(v) => updateStats({ weight: v })}
          onChangeSub={(v) => updateStats({ weightSub: v })}
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Injury Status"
          value={stats.injuryStatus}
          sub={stats.injurySub}
          onChangeValue={(v) => updateStats({ injuryStatus: v })}
          onChangeSub={(v) => updateStats({ injurySub: v })}
        />
      </div>

      {/* Injury alert */}
      <div style={{ backgroundColor: "#2e2a1a", border: "1px solid #e6c87a", borderRadius: "10px", padding: "16px 20px", marginBottom: "32px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <AlertTriangle size={18} color="#e6c87a" style={{ marginTop: "3px", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <EditableText
            value={injuryAlert.title}
            onChange={(v) => updateInjuryAlert({ title: v })}
            style={{ fontSize: "14px", fontWeight: 600, color: "#e6c87a", marginBottom: "6px" }}
            placeholder="Injury / alert title"
          />
          <EditableTextarea
            value={injuryAlert.body}
            onChange={(v) => updateInjuryAlert({ body: v })}
            style={{ fontSize: "13px", color: "#9aa5b0", lineHeight: 1.6 }}
            placeholder="Notes on injury status and protocol..."
          />
        </div>
      </div>

      {/* Events */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Competition Events
        </div>
        <button
          onClick={addEvent}
          style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#7a8a95", background: "none", border: "1px solid #36393F", borderRadius: "6px", padding: "5px 10px", cursor: "pointer" }}
        >
          <Plus size={12} /> Add Event
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onChange={(ch) => updateEvent(event.id, ch)}
            onDelete={() => deleteEvent(event.id)}
          />
        ))}
      </div>

      {/* Peak week */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Peak Week Plan
        </div>
        <button
          onClick={addPeakDay}
          style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#7a8a95", background: "none", border: "1px solid #36393F", borderRadius: "6px", padding: "5px 10px", cursor: "pointer" }}
        >
          <Plus size={12} /> Add Day
        </button>
      </div>

      <div style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "10px", overflow: "hidden" }}>
        {peakWeek.map((day, i) => (
          <PeakWeekRow
            key={day.id}
            day={day}
            isFirst={i === 0}
            onChange={(ch) => updatePeakDay(day.id, ch)}
            onDelete={() => deletePeakDay(day.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD — click any value or sub to edit inline
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, onChangeValue, onChangeSub }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  onChangeValue: (v: string) => void;
  onChangeSub: (v: string) => void;
}) {
  return (
    <div style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "10px", padding: "18px" }}>
      <div style={{ color: "#7a8a95", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "11px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
        {label}
      </div>
      <EditableText
        value={value}
        onChange={onChangeValue}
        style={{ fontSize: "20px", fontWeight: 700, color: "#B0E0E6", display: "block" }}
        placeholder="Value"
      />
      <EditableText
        value={sub}
        onChange={onChangeSub}
        style={{ fontSize: "12px", color: "#9aa5b0", marginTop: "3px", display: "block" }}
        placeholder="Sub-label"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT CARD — collapsed shows summary, expanded shows full edit fields
// ─────────────────────────────────────────────────────────────────────────────
function EventCard({ event, onChange, onDelete }: {
  event: StrongmanEvent;
  onChange: (ch: Partial<Omit<StrongmanEvent, "id">>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hov, setHov] = useState(false);
  const sc = statusConfig[event.status];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirmDelete(false); }}
      style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "10px", overflow: "hidden", transition: "border-color 0.1s", borderColor: hov ? "#4a5568" : "#2C2F33" }}
    >
      {/* Summary row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px" }}>
        {/* Status toggle */}
        <button
          onClick={() => {
            const next: EventStatus[] = ["ready", "caution", "hold"];
            const idx = next.indexOf(event.status);
            onChange({ status: next[(idx + 1) % next.length] });
          }}
          title="Click to cycle status"
          style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: sc.color, border: "none", cursor: "pointer", flexShrink: 0, padding: 0, boxShadow: `0 0 6px ${sc.color}80` }}
        />

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <EditableText
            value={event.name}
            onChange={(v) => onChange({ name: v })}
            style={{ fontSize: "14px", fontWeight: 500, color: "#B0E0E6" }}
            placeholder="Event name"
          />
          {/* Quick stats inline */}
          {(event.currentBest || event.opener || event.goal) && !expanded && (
            <div style={{ display: "flex", gap: "16px", marginTop: "4px", flexWrap: "wrap" }}>
              {event.currentBest && <QuickStat label="Best" value={event.currentBest} />}
              {event.opener && <QuickStat label="Opener" value={event.opener} />}
              {event.goal && <QuickStat label="Goal" value={event.goal} />}
            </div>
          )}
        </div>

        {/* Status badge */}
        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", backgroundColor: sc.bg, color: sc.color, flexShrink: 0 }}>
          {sc.label}
        </span>

        {/* Actions */}
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {hov && (
            confirmDelete ? (
              <>
                <button onClick={onDelete} style={{ fontSize: "11px", padding: "3px 7px", backgroundColor: "#e05252", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}>Delete</button>
                <button onClick={() => setConfirmDelete(false)} style={{ fontSize: "11px", padding: "3px 7px", color: "#7a8a95", background: "none", border: "1px solid #36393F", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#4a5568", borderRadius: "4px", display: "flex", alignItems: "center" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#e05252")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#4a5568")}
              >
                <Trash2 size={13} />
              </button>
            )
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#7a8a95", display: "flex", alignItems: "center", borderRadius: "4px" }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: "1px solid #2C2F33", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Performance stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
            {[
              { key: "currentBest", label: "Current Best",  placeholder: "e.g. 725 lbs" },
              { key: "opener",      label: "Opener",         placeholder: "e.g. 685 lbs" },
              { key: "goal",        label: "Competition Goal",placeholder: "e.g. 705 lbs" },
              { key: "lastTrained", label: "Last Trained",   placeholder: "YYYY-MM-DD" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <div style={{ fontSize: "10px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>{label}</div>
                <input
                  value={event[key as keyof StrongmanEvent] as string}
                  onChange={(e) => onChange({ [key]: e.target.value })}
                  placeholder={placeholder}
                  style={{ width: "100%", padding: "7px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <div style={{ fontSize: "10px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>Notes</div>
            <textarea
              value={event.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="Coaching notes, cues, strategy..."
              rows={2}
              style={{ width: "100%", padding: "8px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#9aa5b0", fontSize: "13px", lineHeight: 1.6, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>

          {/* Status selector */}
          <div style={{ display: "flex", gap: "6px" }}>
            {(["ready", "caution", "hold"] as EventStatus[]).map((s) => {
              const sc2 = statusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => onChange({ status: s })}
                  style={{ fontSize: "12px", fontWeight: 600, padding: "5px 14px", borderRadius: "20px", border: "none", cursor: "pointer", backgroundColor: event.status === s ? sc2.bg : "transparent", color: event.status === s ? sc2.color : "#7a8a95", outline: event.status === s ? `1px solid ${sc2.color}60` : "none" }}
                >
                  {sc2.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PEAK WEEK ROW
// ─────────────────────────────────────────────────────────────────────────────
function PeakWeekRow({ day, isFirst, onChange, onDelete }: {
  day: PeakDay;
  isFirst: boolean;
  onChange: (ch: Partial<Omit<PeakDay, "id">>) => void;
  onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirm(false); }}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "12px 18px",
        borderTop: isFirst ? "none" : "1px solid #2C2F33",
        backgroundColor: day.isCompDay ? "rgba(176,224,230,0.07)" : "transparent",
      }}
    >
      <div style={{ minWidth: "120px" }}>
        <EditableText
          value={day.day}
          onChange={(v) => onChange({ day: v })}
          style={{ fontSize: "13px", fontWeight: 500, color: day.isCompDay ? "#B0E0E6" : "#9aa5b0" }}
          placeholder="Day"
        />
      </div>
      <div style={{ flex: 1 }}>
        <EditableText
          value={day.focus}
          onChange={(v) => onChange({ focus: v })}
          style={{ fontSize: "13px", color: day.isCompDay ? "#B0E0E6" : "#9aa5b0" }}
          placeholder="Focus / activity"
        />
      </div>
      <div style={{ minWidth: "60px", textAlign: "right" }}>
        <EditableText
          value={day.load}
          onChange={(v) => onChange({ load: v })}
          style={{ fontSize: "13px", fontWeight: 600, color: "#B0E0E6", textAlign: "right" }}
          placeholder="%"
        />
      </div>
      {hov && (
        confirm ? (
          <div style={{ display: "flex", gap: "4px" }}>
            <button onClick={onDelete} style={{ fontSize: "11px", padding: "2px 7px", backgroundColor: "#e05252", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}>Del</button>
            <button onClick={() => setConfirm(false)} style={{ fontSize: "11px", padding: "2px 5px", color: "#7a8a95", background: "none", border: "1px solid #36393F", borderRadius: "4px", cursor: "pointer" }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setConfirm(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#4a5568", display: "flex", flexShrink: 0 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#e05252")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#4a5568")}
          >
            <Trash2 size={12} />
          </button>
        )
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: inline editable text — click to edit, blur/enter to save
// ─────────────────────────────────────────────────────────────────────────────
function EditableText({ value, onChange, style, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
        placeholder={placeholder}
        style={{
          ...style,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(176,224,230,0.3)",
          borderRadius: "4px",
          outline: "none",
          fontFamily: "inherit",
          padding: "1px 6px",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{
        ...style,
        cursor: "text",
        borderBottom: "1px dashed transparent",
        paddingBottom: "1px",
        transition: "border-color 0.1s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLSpanElement).style.borderBottomColor = "rgba(176,224,230,0.3)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLSpanElement).style.borderBottomColor = "transparent")}
    >
      {value || <span style={{ color: "#4a5568", fontStyle: "italic" }}>{placeholder}</span>}
    </span>
  );
}

function EditableTextarea({ value, onChange, style, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        placeholder={placeholder}
        rows={3}
        style={{ ...style, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(176,224,230,0.3)", borderRadius: "4px", outline: "none", fontFamily: "inherit", padding: "4px 8px", width: "100%", resize: "vertical", boxSizing: "border-box" }}
      />
    );
  }

  return (
    <p
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{ ...style, cursor: "text", margin: 0, borderBottom: "1px dashed transparent", transition: "border-color 0.1s" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLParagraphElement).style.borderBottomColor = "rgba(176,224,230,0.3)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLParagraphElement).style.borderBottomColor = "transparent")}
    >
      {value || <span style={{ color: "#4a5568", fontStyle: "italic" }}>{placeholder}</span>}
    </p>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ fontSize: "12px", color: "#7a8a95" }}>
      <span style={{ color: "#4a5568" }}>{label}: </span>
      <span style={{ color: "#9aa5b0", fontWeight: 500 }}>{value}</span>
    </span>
  );
}

