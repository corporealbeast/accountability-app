"use client";

import { useState, useRef, useCallback } from "react";
import {
  Users, Calendar, Sparkles, ChevronRight, X,
  Plus, Trash2, GripHorizontal, Check, ClipboardList, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  useAthletes,
  Athlete, MacroBlock, BlockType, ExerciseRow,
  blockColors, blockDefaults,
} from "@/hooks/useAthletes";

type Tab = "athletes" | "macrocycle";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BLOCK_TYPES: BlockType[] = ["Hypertrophy", "Strength", "Peaking", "Deload", "Transition"];

// ─────────────────────────────────────────────────────────────────────────────
export default function PrecisionPage() {
  const hook = useAthletes();
  const [tab, setTab] = useState<Tab>("athletes");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(hook.athletes[0]?.id ?? null);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "13px", color: "#7a8a95", margin: "0 0 6px" }}>Coaching · Performance</p>
        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#B0E0E6", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Precision Programming
        </h1>
        <p style={{ fontSize: "14px", color: "#9aa5b0", margin: 0 }}>
          {hook.athletes.length} athletes · {hook.athletes.filter((a) => a.checkInStatus === "checked-in").length} checked in
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "28px", borderBottom: "1px solid #36393F" }}>
        {([
          { key: "athletes",   label: "Athlete Dashboard", icon: <Users size={13} /> },
          { key: "macrocycle", label: "Macrocycle Visualizer", icon: <Calendar size={13} /> },
        ] as { key: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", fontSize: "13px", fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? "#B0E0E6" : "#7a8a95",
              background: "none", border: "none",
              borderBottom: tab === t.key ? "2px solid #B0E0E6" : "2px solid transparent",
              cursor: "pointer", marginBottom: "-1px",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "athletes" && (
        <AthletesTab
          hook={hook}
          selectedId={selectedAthleteId}
          onSelect={setSelectedAthleteId}
        />
      )}
      {tab === "macrocycle" && (
        <MacrocycleTab hook={hook} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ATHLETES TAB
// ─────────────────────────────────────────────────────────────────────────────
function AthletesTab({
  hook,
  selectedId,
  onSelect,
}: {
  hook: ReturnType<typeof useAthletes>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { athletes, addAthlete, updateAthlete, deleteAthlete } = hook;
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", sport: "", goal: "", bodyweight: "" });

  const selectedAthlete = athletes.find((a) => a.id === selectedId) ?? null;

  const handleAdd = () => {
    if (!newForm.name.trim()) return;
    const id = addAthlete({
      name: newForm.name.trim(),
      sport: newForm.sport.trim() || "—",
      goal: newForm.goal.trim() || "—",
      bodyweight: newForm.bodyweight.trim() || "—",
      currentBlock: "Hypertrophy",
      lastCheckIn: new Date().toISOString().split("T")[0],
      checkInStatus: "pending",
      program: "Unassigned",
      notes: "",
    });
    setNewForm({ name: "", sport: "", goal: "", bodyweight: "" });
    setAddingNew(false);
    onSelect(id);
  };

  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
      {/* Left: card grid */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Add athlete button */}
        <button
          onClick={() => setAddingNew((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            marginBottom: "16px", padding: "8px 14px",
            backgroundColor: addingNew ? "rgba(176,224,230,0.1)" : "transparent",
            border: "1px solid #36393F", borderRadius: "7px",
            color: "#7a8a95", fontSize: "13px", cursor: "pointer",
          }}
        >
          <Plus size={13} /> Add Athlete
        </button>

        {/* New athlete form */}
        {addingNew && (
          <div style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "10px", padding: "16px", marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { key: "name",        label: "Name *",       placeholder: "Athlete name" },
              { key: "sport",       label: "Sport",        placeholder: "Strongman, Powerlifting..." },
              { key: "goal",        label: "Primary Goal", placeholder: "Competition target" },
              { key: "bodyweight",  label: "Bodyweight",   placeholder: "265 lbs" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <div style={{ fontSize: "10px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>{label}</div>
                <input
                  value={newForm[key as keyof typeof newForm]}
                  onChange={(e) => setNewForm((f) => ({ ...f, [key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder={placeholder}
                  style={{ width: "100%", padding: "8px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "8px" }}>
              <button onClick={handleAdd} style={{ padding: "8px 18px", backgroundColor: "#B0E0E6", color: "#23262A", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                Add Athlete
              </button>
              <button onClick={() => setAddingNew(false)} style={{ padding: "8px 14px", backgroundColor: "transparent", color: "#7a8a95", border: "1px solid #36393F", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
          {athletes.map((athlete) => (
            <AthleteCard
              key={athlete.id}
              athlete={athlete}
              isSelected={athlete.id === selectedId}
              onClick={() => onSelect(athlete.id === selectedId ? null : athlete.id)}
            />
          ))}
        </div>
      </div>

      {/* Right: athlete detail */}
      {selectedAthlete && (
        <AthleteDetail
          athlete={selectedAthlete}
          onUpdate={(ch) => updateAthlete(selectedAthlete.id, ch)}
          onDelete={() => { deleteAthlete(selectedAthlete.id); onSelect(null); }}
          onClose={() => onSelect(null)}
        />
      )}
    </div>
  );
}

function AthleteCard({ athlete, isSelected, onClick }: { athlete: Athlete; isSelected: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const statusColor = athlete.checkInStatus === "checked-in" ? "#4ade80"
    : athlete.checkInStatus === "missed" ? "#f87171"
    : "#FFD700";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        padding: "18px", borderRadius: "10px", cursor: "pointer", textAlign: "left",
        backgroundColor: isSelected ? "rgba(176,224,230,0.1)" : "#36393F",
        border: `1px solid ${isSelected ? "#B0E0E6" : hov ? "#4a5568" : "#2C2F33"}`,
        transition: "all 0.15s",
      }}
    >
      {/* Status dot + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", marginBottom: "10px" }}>
        <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: statusColor, flexShrink: 0, boxShadow: `0 0 6px ${statusColor}80` }} />
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#B0E0E6", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {athlete.name}
        </span>
        <ChevronRight size={14} color={isSelected ? "#B0E0E6" : "#4a5568"} />
      </div>

      {/* Sport */}
      <div style={{ fontSize: "11px", color: "#7a8a95", marginBottom: "8px" }}>{athlete.sport}</div>

      {/* Block badge */}
      <div style={{
        fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px",
        backgroundColor: blockColors[athlete.currentBlock] + "25",
        color: blockColors[athlete.currentBlock],
        marginBottom: "8px",
      }}>
        {athlete.currentBlock}
      </div>

      {/* Goal */}
      <div style={{ fontSize: "12px", color: "#9aa5b0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
        {athlete.goal}
      </div>

      {/* Last check-in */}
      <div style={{ marginTop: "10px", fontSize: "11px", color: athlete.checkInStatus === "missed" ? "#f87171" : "#7a8a95" }}>
        {athlete.checkInStatus === "missed" ? "⚠ Missed check-in" : `✓ ${athlete.lastCheckIn}`}
      </div>
    </button>
  );
}

function AthleteDetail({
  athlete,
  onUpdate,
  onDelete,
  onClose,
}: {
  athlete: Athlete;
  onUpdate: (changes: Partial<Omit<Athlete, "id">>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [generateModal, setGenerateModal] = useState(false);

  const BLOCKS: BlockType[] = ["Hypertrophy", "Strength", "Peaking", "Deload", "Transition"];
  const CHECK_STATUSES = [
    { value: "checked-in", label: "Checked In",  color: "#4ade80" },
    { value: "missed",     label: "Missed",      color: "#f87171" },
    { value: "pending",    label: "Pending",     color: "#FFD700" },
  ] as const;

  return (
    <div style={{ width: "340px", minWidth: "340px", backgroundColor: "#23262A", border: "1px solid #36393F", borderRadius: "12px", overflow: "hidden", position: "sticky", top: "20px" }}>
      {/* Header */}
      <div style={{ padding: "16px 18px", borderBottom: "1px solid #36393F", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: blockColors[athlete.currentBlock] + "30", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: blockColors[athlete.currentBlock] }}>
              {athlete.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </span>
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#B0E0E6" }}>{athlete.name}</div>
            <div style={{ fontSize: "11px", color: "#7a8a95" }}>{athlete.sport}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {confirmDelete ? (
            <>
              <button onClick={onDelete} style={{ fontSize: "11px", padding: "3px 8px", backgroundColor: "#e05252", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}>Delete</button>
              <button onClick={() => setConfirmDelete(false)} style={{ fontSize: "11px", padding: "3px 8px", color: "#7a8a95", background: "none", border: "1px solid #36393F", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
            </>
          ) : (
            <>
              <IconBtn onClick={() => setConfirmDelete(true)} danger><Trash2 size={13} /></IconBtn>
              <IconBtn onClick={onClose}><X size={13} /></IconBtn>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Bodyweight + Check-in status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <Label>Bodyweight</Label>
            <InlineInput value={athlete.bodyweight} onChange={(v) => onUpdate({ bodyweight: v })} placeholder="265 lbs" />
          </div>
          <div>
            <Label>Check-In</Label>
            <select
              value={athlete.checkInStatus}
              onChange={(e) => onUpdate({ checkInStatus: e.target.value as Athlete["checkInStatus"] })}
              style={{ width: "100%", padding: "6px 8px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "5px", color: CHECK_STATUSES.find((s) => s.value === athlete.checkInStatus)?.color ?? "#9aa5b0", fontSize: "12px", outline: "none", fontFamily: "inherit" }}
            >
              {CHECK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Current block */}
        <div>
          <Label>Current Block</Label>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {BLOCKS.map((b) => (
              <button
                key={b}
                onClick={() => onUpdate({ currentBlock: b })}
                style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", border: "none", cursor: "pointer",
                  backgroundColor: athlete.currentBlock === b ? blockColors[b] + "30" : "rgba(255,255,255,0.04)",
                  color: athlete.currentBlock === b ? blockColors[b] : "#7a8a95",
                  outline: athlete.currentBlock === b ? `1px solid ${blockColors[b]}60` : "none",
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Program name */}
        <div>
          <Label>Program</Label>
          <InlineInput value={athlete.program} onChange={(v) => onUpdate({ program: v })} placeholder="Program name" />
        </div>

        {/* Goal */}
        <div>
          <Label>Goal</Label>
          <InlineInput value={athlete.goal} onChange={(v) => onUpdate({ goal: v })} placeholder="Competition target" />
        </div>

        {/* Notes */}
        <div>
          <Label>Coaching Notes</Label>
          <textarea
            value={athlete.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Progress notes, cues, observations..."
            rows={4}
            style={{ width: "100%", padding: "8px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#9aa5b0", fontSize: "13px", lineHeight: 1.6, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        {/* ── GENERATE PROGRAM BUTTON ── */}
        <div style={{ borderTop: "1px solid #36393F", paddingTop: "14px" }}>
          <button
            onClick={() => setGenerateModal(true)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "12px 0",
              background: "linear-gradient(135deg, rgba(176,224,230,0.08) 0%, rgba(147,112,219,0.08) 100%)",
              border: "1px solid rgba(176,224,230,0.25)",
              borderRadius: "8px", cursor: "pointer",
              color: "#B0E0E6", fontSize: "14px", fontWeight: 600,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(176,224,230,0.6)";
              (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(176,224,230,0.14) 0%, rgba(147,112,219,0.14) 100%)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(176,224,230,0.25)";
              (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(176,224,230,0.08) 0%, rgba(147,112,219,0.08) 100%)";
            }}
          >
            <Sparkles size={16} color="#9370DB" />
            Generate Program
            <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "10px", backgroundColor: "rgba(147,112,219,0.2)", color: "#9370DB", marginLeft: "4px" }}>
              AI
            </span>
          </button>
          <p style={{ fontSize: "11px", color: "#4a5568", textAlign: "center", margin: "8px 0 0" }}>
            Uses your training books + athlete data
          </p>
        </div>
      </div>

      {/* Generate modal */}
      {generateModal && (
        <GenerateModal athlete={athlete} onClose={() => setGenerateModal(false)} />
      )}
    </div>
  );
}

function GenerateModal({ athlete, onClose }: { athlete: Athlete; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "480px", backgroundColor: "#23262A", border: "1px solid #36393F", borderRadius: "14px", padding: "32px", position: "relative" }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", background: "none", border: "none", cursor: "pointer", color: "#7a8a95" }}>
          <X size={16} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(176,224,230,0.15), rgba(147,112,219,0.15))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(147,112,219,0.3)" }}>
            <Sparkles size={20} color="#9370DB" />
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#B0E0E6" }}>AI Program Generator</div>
            <div style={{ fontSize: "12px", color: "#7a8a95" }}>Precision Programming · Coming Soon</div>
          </div>
        </div>

        <div style={{ backgroundColor: "#2C2F33", borderRadius: "10px", padding: "16px", marginBottom: "20px", border: "1px solid #36393F" }}>
          <div style={{ fontSize: "12px", color: "#7a8a95", marginBottom: "8px" }}>Will generate for:</div>
          <div style={{ fontSize: "14px", color: "#B0E0E6", fontWeight: 600 }}>{athlete.name}</div>
          <div style={{ fontSize: "12px", color: "#9aa5b0", marginTop: "4px" }}>{athlete.sport} · {athlete.currentBlock} block · {athlete.goal}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
          {[
            "Reads your uploaded training books and methodology notes",
            "Analyzes athlete data, current block, and goal",
            "Generates a week-by-week program with sets, reps, and percentages",
            "Exports as a formatted PDF or pastes directly into your notes",
          ].map((line, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "#9aa5b0" }}>
              <Check size={14} color="#4ade80" style={{ flexShrink: 0, marginTop: "2px" }} />
              {line}
            </div>
          ))}
        </div>

        <div style={{ padding: "14px 16px", borderRadius: "8px", backgroundColor: "rgba(147,112,219,0.08)", border: "1px solid rgba(147,112,219,0.25)", fontSize: "13px", color: "#9aa5b0", lineHeight: 1.6 }}>
          <strong style={{ color: "#9370DB" }}>To activate:</strong> Connect your Claude API key in Settings. Upload your training methodology PDFs. This button will generate a full program in seconds.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MACROCYCLE VISUALIZER TAB
// ─────────────────────────────────────────────────────────────────────────────
function MacrocycleTab({ hook }: { hook: ReturnType<typeof useAthletes> }) {
  const { athletes, blocks, addBlock, updateBlock, deleteBlock, getPhase, updatePhaseNotes, addExercise, updateExercise, deleteExercise } = hook;
  const [selectedAthleteId, setSelectedAthleteId] = useState(athletes[0]?.id ?? "");
  const [year, setYear] = useState(2026);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [phaseOpen, setPhaseOpen] = useState(false);
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // What's being dragged: palette item or existing block
  const dragInfo = useRef<
    | { kind: "new"; blockType: BlockType }
    | { kind: "move"; blockId: string; monthOffset: number }
    | null
  >(null);

  const athleteBlocks = blocks.filter(
    (b) => b.athleteId === selectedAthleteId && b.year === year
  );

  const getMonthFromEvent = useCallback((e: React.DragEvent | React.MouseEvent): number => {
    if (!gridRef.current) return 0;
    const rect = gridRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left);
    return Math.min(11, Math.floor((x / rect.width) * 12));
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setHoverMonth(getMonthFromEvent(e));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const month = getMonthFromEvent(e);
    const info = dragInfo.current;
    if (!info) return;

    if (info.kind === "new") {
      addBlock({
        athleteId: selectedAthleteId,
        type: info.blockType,
        startMonth: month,
        duration: Math.min(blockDefaults[info.blockType].duration, 12 - month),
        year,
        label: info.blockType,
      });
    } else {
      const newStart = Math.max(0, month - info.monthOffset);
      const block = blocks.find((b) => b.id === info.blockId);
      if (block) {
        updateBlock(info.blockId, {
          startMonth: Math.min(newStart, 12 - block.duration),
        });
      }
    }
    setHoverMonth(null);
    dragInfo.current = null;
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  return (
    <div>
      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {/* Athlete selector */}
        <select
          value={selectedAthleteId}
          onChange={(e) => { setSelectedAthleteId(e.target.value); setSelectedBlockId(null); }}
          style={{ padding: "8px 12px", backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "7px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit", cursor: "pointer" }}
        >
          {athletes.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        {/* Year selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button onClick={() => setYear((y) => y - 1)} style={yearBtnStyle}>&lt;</button>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#B0E0E6", minWidth: "40px", textAlign: "center" }}>{year}</span>
          <button onClick={() => setYear((y) => y + 1)} style={yearBtnStyle}>&gt;</button>
        </div>

        <span style={{ fontSize: "12px", color: "#7a8a95" }}>
          {athleteBlocks.length} block{athleteBlocks.length !== 1 ? "s" : ""} planned
        </span>
      </div>

      {/* Block palette */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "10px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          Drag blocks onto the timeline
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {BLOCK_TYPES.map((type) => (
            <div
              key={type}
              draggable
              onDragStart={() => { dragInfo.current = { kind: "new", blockType: type }; }}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "7px 13px", borderRadius: "7px", cursor: "grab",
                backgroundColor: blockColors[type] + "20",
                border: `1px solid ${blockColors[type]}50`,
                userSelect: "none",
              }}
            >
              <GripHorizontal size={12} color={blockColors[type]} />
              <span style={{ fontSize: "12px", fontWeight: 600, color: blockColors[type] }}>{type}</span>
              <span style={{ fontSize: "10px", color: "#7a8a95" }}>{blockDefaults[type].duration}mo</span>
            </div>
          ))}
        </div>
      </div>

      {/* Year grid */}
      <div style={{ backgroundColor: "#23262A", border: "1px solid #36393F", borderRadius: "12px", overflow: "hidden" }}>
        {/* Month headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", borderBottom: "1px solid #36393F" }}>
          {MONTHS.map((m, i) => (
            <div
              key={m}
              style={{
                padding: "10px 4px", textAlign: "center",
                fontSize: "11px", fontWeight: 600, color: "#7a8a95",
                textTransform: "uppercase", letterSpacing: "0.06em",
                borderRight: i < 11 ? "1px solid #36393F" : "none",
                backgroundColor: hoverMonth === i ? "rgba(176,224,230,0.05)" : "transparent",
                transition: "background-color 0.1s",
              }}
            >
              {m}
            </div>
          ))}
        </div>

        {/* Drop zone */}
        <div
          ref={gridRef}
          onDragOver={handleDragOver}
          onDragLeave={() => setHoverMonth(null)}
          onDrop={handleDrop}
          onClick={() => setSelectedBlockId(null)}
          style={{ position: "relative", height: "120px", cursor: "default" }}
        >
          {/* Month cell backgrounds */}
          {MONTHS.map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${(i / 12) * 100}%`,
                width: `${(1 / 12) * 100}%`,
                height: "100%",
                borderRight: i < 11 ? "1px solid #36393F" : "none",
                backgroundColor: hoverMonth === i ? "rgba(176,224,230,0.06)" : "transparent",
                transition: "background-color 0.1s",
                boxSizing: "border-box",
              }}
            />
          ))}

          {/* Empty state */}
          {athleteBlocks.length === 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5568", fontSize: "13px", pointerEvents: "none" }}>
              Drag blocks from the palette above to plan the year
            </div>
          )}

          {/* Blocks */}
          {athleteBlocks.map((block) => (
            <MacroBlockBar
              key={block.id}
              block={block}
              isSelected={block.id === selectedBlockId}
              onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id === selectedBlockId ? null : block.id); }}
              onDragStart={(monthOffset) => { dragInfo.current = { kind: "move", blockId: block.id, monthOffset }; }}
            />
          ))}
        </div>

        {/* Legend row */}
        <div style={{ borderTop: "1px solid #36393F", padding: "8px 14px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {BLOCK_TYPES.map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: blockColors[t] }} />
              <span style={{ fontSize: "11px", color: "#7a8a95" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Block editor panel */}
      {selectedBlock && (
        <BlockEditor
          block={selectedBlock}
          onUpdate={(ch) => updateBlock(selectedBlock.id, ch)}
          onDelete={() => { deleteBlock(selectedBlock.id); setSelectedBlockId(null); setPhaseOpen(false); }}
          onClose={() => { setSelectedBlockId(null); setPhaseOpen(false); }}
          phaseOpen={phaseOpen}
          onTogglePhase={() => setPhaseOpen((v) => !v)}
        />
      )}

      {/* Phase plan panel */}
      {selectedBlock && phaseOpen && (
        <PhasePanel
          block={selectedBlock}
          phase={getPhase(selectedBlock.id)}
          onUpdateNotes={(n) => updatePhaseNotes(selectedBlock.id, n)}
          onAddExercise={(week) => addExercise(selectedBlock.id, week)}
          onUpdateExercise={(rowId, ch) => updateExercise(selectedBlock.id, rowId, ch)}
          onDeleteExercise={(rowId) => deleteExercise(selectedBlock.id, rowId)}
        />
      )}
    </div>
  );
}

function MacroBlockBar({
  block,
  isSelected,
  onClick,
  onDragStart,
}: {
  block: MacroBlock;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (monthOffset: number) => void;
}) {
  const color = blockColors[block.type];
  const left  = (block.startMonth / 12) * 100;
  const width = (block.duration / 12) * 100;

  const handleDragStart = (e: React.DragEvent) => {
    if (!e.currentTarget.parentElement) return;
    const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
    const x = e.clientX - parentRect.left;
    const clickMonth = Math.floor((x / parentRect.width) * 12);
    const monthOffset = clickMonth - block.startMonth;
    onDragStart(monthOffset);
  };

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={handleDragStart}
      title={`${block.type} — ${block.label} (${MONTHS[block.startMonth]} – ${MONTHS[Math.min(11, block.startMonth + block.duration - 1)]})`}
      style={{
        position: "absolute",
        left: `${left}%`,
        width: `calc(${width}% - 4px)`,
        top: "12px",
        height: "72px",
        marginLeft: "2px",
        borderRadius: "7px",
        backgroundColor: color + (isSelected ? "55" : "30"),
        border: `1.5px solid ${color}${isSelected ? "cc" : "70"}`,
        cursor: "grab",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 10px",
        overflow: "hidden",
        transition: "border-color 0.1s, background-color 0.1s",
        boxShadow: isSelected ? `0 0 0 2px ${color}40` : "none",
      }}
    >
      <div style={{ fontSize: "11px", fontWeight: 700, color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {block.type}
      </div>
      {block.label !== block.type && (
        <div style={{ fontSize: "10px", color: color + "cc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
          {block.label}
        </div>
      )}
      <div style={{ fontSize: "10px", color: "#7a8a95", marginTop: "4px" }}>
        {block.duration} mo
      </div>
    </div>
  );
}

function BlockEditor({
  block, onUpdate, onDelete, onClose, phaseOpen, onTogglePhase,
}: {
  block: MacroBlock;
  onUpdate: (ch: Partial<Omit<MacroBlock, "id">>) => void;
  onDelete: () => void;
  onClose: () => void;
  phaseOpen: boolean;
  onTogglePhase: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const color = blockColors[block.type];
  const totalWeeks = block.duration * 4;

  return (
    <div style={{ marginTop: "12px", backgroundColor: "#23262A", border: `1px solid ${color}40`, borderRadius: "10px", padding: "16px", display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "0 0 auto" }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: color, flexShrink: 0 }} />
        <span style={{ fontSize: "13px", fontWeight: 600, color }}>{block.type}</span>
      </div>

      <div>
        <Label>Label</Label>
        <input value={block.label} onChange={(e) => onUpdate({ label: e.target.value })}
          style={{ padding: "5px 8px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "5px", color: "#B0E0E6", fontSize: "12px", outline: "none", fontFamily: "inherit", width: "130px" }} />
      </div>

      <div>
        <Label>Start</Label>
        <select value={block.startMonth} onChange={(e) => onUpdate({ startMonth: Number(e.target.value) })}
          style={{ padding: "5px 8px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "5px", color: "#B0E0E6", fontSize: "12px", outline: "none", fontFamily: "inherit" }}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      <div>
        <Label>Duration</Label>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button onClick={() => onUpdate({ duration: Math.max(1, block.duration - 1) })} style={adjBtn}>−</button>
          <span style={{ fontSize: "13px", color: "#B0E0E6", minWidth: "50px", textAlign: "center" }}>{block.duration} mo · {totalWeeks} wks</span>
          <button onClick={() => onUpdate({ duration: Math.min(12 - block.startMonth, block.duration + 1) })} style={adjBtn}>+</button>
        </div>
      </div>

      {/* Phase plan toggle */}
      <button
        onClick={onTogglePhase}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600,
          backgroundColor: phaseOpen ? color + "25" : "transparent",
          border: `1px solid ${phaseOpen ? color + "70" : "#36393F"}`,
          color: phaseOpen ? color : "#9aa5b0",
          transition: "all 0.15s",
        }}
      >
        <ClipboardList size={13} />
        Phase Plan
        {phaseOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", marginLeft: "auto" }}>
        {confirm ? (
          <>
            <button onClick={onDelete} style={{ fontSize: "12px", padding: "6px 10px", backgroundColor: "#e05252", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: 600 }}>Delete</button>
            <button onClick={() => setConfirm(false)} style={{ fontSize: "12px", padding: "6px 10px", color: "#7a8a95", background: "none", border: "1px solid #36393F", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
          </>
        ) : (
          <>
            <IconBtn danger onClick={() => setConfirm(true)}><Trash2 size={13} /></IconBtn>
            <IconBtn onClick={onClose}><X size={13} /></IconBtn>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE PLAN PANEL
// ─────────────────────────────────────────────────────────────────────────────
function PhasePanel({
  block, phase, onUpdateNotes, onAddExercise, onUpdateExercise, onDeleteExercise,
}: {
  block: MacroBlock;
  phase: { notes: string; exercises: ExerciseRow[] };
  onUpdateNotes: (n: string) => void;
  onAddExercise: (week: number) => void;
  onUpdateExercise: (rowId: string, ch: Partial<Omit<ExerciseRow, "id">>) => void;
  onDeleteExercise: (rowId: string) => void;
}) {
  const color = blockColors[block.type];
  const totalWeeks = block.duration * 4;
  const weekNums = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const [activeWeek, setActiveWeek] = useState<number | "all">(1);

  const visibleExercises = activeWeek === "all"
    ? phase.exercises
    : phase.exercises.filter((e) => e.week === activeWeek);

  const groupedByWeek = weekNums.map((w) => ({
    week: w,
    rows: phase.exercises.filter((e) => e.week === w),
  }));

  return (
    <div style={{ marginTop: "8px", backgroundColor: "#1e2124", border: `1px solid ${color}30`, borderRadius: "12px", overflow: "hidden" }}>
      {/* Panel header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #36393F", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ClipboardList size={15} color={color} />
          <span style={{ fontSize: "14px", fontWeight: 700, color }}>
            {block.label} · Phase Plan
          </span>
          <span style={{ fontSize: "11px", color: "#7a8a95" }}>
            {block.duration} months · {totalWeeks} weeks · {MONTHS[block.startMonth]}–{MONTHS[Math.min(11, block.startMonth + block.duration - 1)]}
          </span>
        </div>
        <div style={{ fontSize: "11px", color: "#7a8a95" }}>
          {phase.exercises.length} exercises programmed
        </div>
      </div>

      {/* Week tabs */}
      <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #36393F", overflowX: "auto" }}>
        <WeekTab active={activeWeek === "all"} onClick={() => setActiveWeek("all")} color={color}>
          All
        </WeekTab>
        {weekNums.map((w) => (
          <WeekTab key={w} active={activeWeek === w} onClick={() => setActiveWeek(w)} color={color}>
            Wk {w}
            {phase.exercises.filter((e) => e.week === w).length > 0 && (
              <span style={{ marginLeft: "4px", fontSize: "9px", opacity: 0.7 }}>
                ·{phase.exercises.filter((e) => e.week === w).length}
              </span>
            )}
          </WeekTab>
        ))}
      </div>

      {/* Exercise table */}
      <div style={{ padding: "16px 18px" }}>
        {activeWeek === "all" ? (
          /* All weeks view — grouped */
          groupedByWeek.some((g) => g.rows.length > 0) ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {groupedByWeek.filter((g) => g.rows.length > 0).map(({ week, rows }) => (
                <div key={week}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                    Week {week}
                  </div>
                  <ExerciseTable
                    rows={rows}
                    onUpdate={onUpdateExercise}
                    onDelete={onDeleteExercise}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyPhase color={color} onAdd={() => onAddExercise(1)} />
          )
        ) : (
          /* Single week view */
          <div>
            <ExerciseTable
              rows={visibleExercises}
              onUpdate={onUpdateExercise}
              onDelete={onDeleteExercise}
            />
            {visibleExercises.length === 0 && (
              <EmptyPhase color={color} onAdd={() => onAddExercise(activeWeek as number)} label={`Week ${activeWeek}`} />
            )}
            <button
              onClick={() => onAddExercise(activeWeek as number)}
              style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#7a8a95", background: "none", border: "1px dashed #36393F", borderRadius: "6px", padding: "7px 14px", cursor: "pointer", width: "100%" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = color; (e.currentTarget as HTMLButtonElement).style.color = color; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#36393F"; (e.currentTarget as HTMLButtonElement).style.color = "#7a8a95"; }}
            >
              <Plus size={13} /> Add exercise to Week {activeWeek}
            </button>
          </div>
        )}
      </div>

      {/* Phase notes */}
      <div style={{ borderTop: "1px solid #36393F", padding: "14px 18px" }}>
        <div style={{ fontSize: "10px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
          Phase Notes
        </div>
        <textarea
          value={phase.notes}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="Programming rationale, phase goals, key indicators, periodization notes..."
          rows={3}
          style={{ width: "100%", padding: "8px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#9aa5b0", fontSize: "13px", lineHeight: 1.6, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
        />
      </div>
    </div>
  );
}

function WeekTab({ children, active, onClick, color }: { children: React.ReactNode; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px", fontSize: "11px", fontWeight: active ? 600 : 400,
        color: active ? color : "#7a8a95",
        background: "none", border: "none", borderBottom: active ? `2px solid ${color}` : "2px solid transparent",
        cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.1s",
      }}
    >
      {children}
    </button>
  );
}

function ExerciseTable({
  rows, onUpdate, onDelete,
}: {
  rows: ExerciseRow[];
  onUpdate: (rowId: string, ch: Partial<Omit<ExerciseRow, "id">>) => void;
  onDelete: (rowId: string) => void;
}) {
  if (rows.length === 0) return null;

  const cols = [
    { key: "day",       label: "Day",       width: "80px",  placeholder: "Day 1" },
    { key: "exercise",  label: "Exercise",  width: "1fr",   placeholder: "Squat, Log Press..." },
    { key: "sets",      label: "Sets",      width: "60px",  placeholder: "4" },
    { key: "reps",      label: "Reps",      width: "70px",  placeholder: "5" },
    { key: "percentRM", label: "% 1RM",     width: "80px",  placeholder: "80%" },
    { key: "notes",     label: "Notes",     width: "1fr",   placeholder: "Cues, rest, tempo..." },
  ];

  const gridCols = cols.map((c) => c.width).join(" ") + " 36px";

  return (
    <div style={{ border: "1px solid #36393F", borderRadius: "8px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "8px", padding: "8px 12px", borderBottom: "1px solid #36393F", backgroundColor: "#23262A" }}>
        {cols.map((c) => (
          <div key={c.key} style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {c.label}
          </div>
        ))}
        <div />
      </div>

      {/* Rows */}
      {rows.map((row, idx) => (
        <ExerciseRowComp
          key={row.id}
          row={row}
          cols={cols}
          gridCols={gridCols}
          isLast={idx === rows.length - 1}
          onUpdate={(ch) => onUpdate(row.id, ch)}
          onDelete={() => onDelete(row.id)}
        />
      ))}
    </div>
  );
}

function ExerciseRowComp({ row, cols, gridCols, isLast, onUpdate, onDelete }: {
  row: ExerciseRow;
  cols: { key: string; label: string; width: string; placeholder: string }[];
  gridCols: string;
  isLast: boolean;
  onUpdate: (ch: Partial<Omit<ExerciseRow, "id">>) => void;
  onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirm(false); }}
      style={{
        display: "grid", gridTemplateColumns: gridCols, gap: "8px",
        padding: "8px 12px",
        borderBottom: isLast ? "none" : "1px solid #36393F",
        backgroundColor: hov ? "rgba(255,255,255,0.02)" : "transparent",
        alignItems: "center",
      }}
    >
      {cols.map(({ key, placeholder }) => (
        <input
          key={key}
          value={row[key as keyof ExerciseRow] as string}
          onChange={(e) => onUpdate({ [key]: e.target.value })}
          placeholder={placeholder}
          style={{
            padding: "4px 7px", backgroundColor: "transparent",
            border: "1px solid transparent", borderRadius: "4px",
            color: key === "exercise" ? "#B0E0E6" : "#9aa5b0",
            fontSize: "12px", outline: "none", fontFamily: "inherit",
            width: "100%", boxSizing: "border-box",
            transition: "border-color 0.1s, background-color 0.1s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#36393F"; e.currentTarget.style.backgroundColor = "#2C2F33"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.backgroundColor = "transparent"; }}
        />
      ))}
      <div style={{ display: "flex", justifyContent: "center" }}>
        {confirm ? (
          <button onClick={onDelete} style={{ fontSize: "10px", padding: "2px 6px", backgroundColor: "#e05252", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}>✓</button>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: hov ? "#e05252" : "transparent", padding: "2px", display: "flex", alignItems: "center" }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyPhase({ color, onAdd, label }: { color: string; onAdd: () => void; label?: string }) {
  return (
    <div style={{ padding: "32px 0", textAlign: "center" }}>
      <div style={{ fontSize: "13px", color: "#4a5568", marginBottom: "12px" }}>
        No exercises programmed{label ? ` for ${label}` : ""} yet.
      </div>
      <button
        onClick={onAdd}
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, padding: "8px 16px", borderRadius: "6px", cursor: "pointer", backgroundColor: color + "20", border: `1px solid ${color}50`, color }}
      >
        <Plus size={13} /> Add First Exercise
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "10px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>{children}</div>;
}

function InlineInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "6px 8px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "5px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
  );
}

function IconBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? "rgba(255,255,255,0.07)" : "none", border: "none", cursor: "pointer", padding: "5px", borderRadius: "4px", display: "flex", alignItems: "center", color: hov ? (danger ? "#e05252" : "#B0E0E6") : "#7a8a95", transition: "all 0.1s" }}>
      {children}
    </button>
  );
}

const yearBtnStyle: React.CSSProperties = {
  padding: "4px 10px", backgroundColor: "#36393F", border: "1px solid #2C2F33",
  borderRadius: "5px", color: "#9aa5b0", cursor: "pointer", fontSize: "13px",
};

const adjBtn: React.CSSProperties = {
  padding: "2px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F",
  borderRadius: "4px", color: "#B0E0E6", cursor: "pointer", fontSize: "14px", fontWeight: 700,
};

