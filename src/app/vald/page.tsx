"use client";

import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react";
import dynamic from "next/dynamic";
import { X, Plus, Trash2 } from "lucide-react";
import { useValdNotes, ValdNote, Category, categories, categoryColors } from "@/hooks/useValdNotes";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface GraphNode {
  id: string;
  label: string;
  color: string;
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
}

// ---------------------------------------------------------------------------
// Isolated graph component.
// Only re-renders when node/link count or canvas size changes.
// nodeTitlesRef / nodeColorsRef are read per animation frame so labels and
// colors stay current without triggering a React re-render.
// ---------------------------------------------------------------------------
interface ValdGraphProps {
  graphData: { nodes: GraphNode[]; links: GraphLink[] };
  selectedIdRef: React.MutableRefObject<string | null>;
  nodeTitlesRef: React.MutableRefObject<Map<string, string>>;
  nodeColorsRef: React.MutableRefObject<Map<string, string>>;
  onNodeClick: (node: GraphNode) => void;
  width: number;
  height: number;
}

const ValdGraph = memo(
  function ValdGraph({
    graphData,
    selectedIdRef,
    nodeTitlesRef,
    nodeColorsRef,
    onNodeClick,
    width,
    height,
  }: ValdGraphProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fgRef = useRef<any>(null);

    const handleEngineStop = useCallback(() => {
      fgRef.current?.d3Force("charge")?.strength(-30);
    }, []);

    useEffect(() => {
      const t = setTimeout(() => {
        // After 3 s the simulation has settled — nothing more to do.
        // The engine already stopped via cooldownTicks.
      }, 3000);
      return () => clearTimeout(t);
    }, [graphData]);

    const paintNode = useCallback(
      (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const n = node as GraphNode & { x: number; y: number };
        const isSelected = n.id === selectedIdRef.current;
        // Read latest label/color from refs — no re-render needed
        const label = nodeTitlesRef.current.get(n.id) ?? n.label;
        const color = nodeColorsRef.current.get(n.id) ?? n.color;
        const fontSize = Math.max(10 / globalScale, 3);

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = color + "35";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, isSelected ? 7 : 5, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5 / globalScale;
          ctx.stroke();
        }

        if (globalScale > 0.4) {
          ctx.font = `${isSelected ? "bold " : ""}${fontSize}px -apple-system, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = isSelected ? "#ffffff" : "rgba(154,165,176,0.85)";
          ctx.fillText(label, n.x, n.y + 8);
        }
      },
      // Refs are stable objects — intentionally omitted from deps
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    return (
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData as never}
        width={width}
        height={height}
        backgroundColor="#1e2124"
        nodeRelSize={6}
        linkColor={() => "rgba(176,224,230,0.2)"}
        linkWidth={1.5}
        onNodeClick={onNodeClick as never}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        cooldownTicks={130}
        d3AlphaDecay={0.025}
        d3VelocityDecay={0.4}
        onEngineStop={handleEngineStop}
      />
    );
  },
  (prev, next) =>
    prev.graphData.nodes.length === next.graphData.nodes.length &&
    prev.graphData.links.length === next.graphData.links.length &&
    prev.width === next.width &&
    prev.height === next.height
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ValdPage() {
  const { notes, addNote, updateNote, deleteNote, getWikiLinks } = useValdNotes();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync selection into a ref so canvas reads latest without re-rendering graph
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

  // Per-frame label / color maps — updated every render, read by canvas callback
  const nodeTitlesRef = useRef<Map<string, string>>(new Map());
  const nodeColorsRef = useRef<Map<string, string>>(new Map());
  notes.forEach((n) => {
    nodeTitlesRef.current.set(n.id, n.title);
    nodeColorsRef.current.set(n.id, categoryColors[n.category]);
  });

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Edge fingerprint — derived from RESOLVED edges (explicit links + wiki links).
  // Physics only restart when the actual edge set changes, not on every keystroke.
  const edgeFingerprint = useMemo(() => {
    const edgeKeys: string[] = [];
    const seen = new Set<string>();
    notes.forEach((note) => {
      const wikiIds = getWikiLinks(note);
      [...new Set([...note.links, ...wikiIds])].forEach((targetId) => {
        const key = [note.id, targetId].sort().join("--");
        if (!seen.has(key) && notes.some((n) => n.id === targetId)) {
          seen.add(key);
          edgeKeys.push(key);
        }
      });
    });
    return `${notes.length}:${edgeKeys.sort().join("|")}`;
  // notes must be in deps so wiki link resolution (which depends on note titles) re-runs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  // Graph data — stable unless edgeFingerprint changes (i.e. actual structure changes)
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = notes.map((n) => ({
      id: n.id,
      label: n.title,
      color: categoryColors[n.category],
      val: 3,
    }));

    const seen = new Set<string>();
    const links: GraphLink[] = [];
    notes.forEach((note) => {
      const wikiIds = getWikiLinks(note);
      [...new Set([...note.links, ...wikiIds])].forEach((targetId) => {
        const key = [note.id, targetId].sort().join("--");
        if (!seen.has(key) && notes.some((n) => n.id === targetId)) {
          seen.add(key);
          links.push({ source: note.id, target: targetId });
        }
      });
    });

    return { nodes, links };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeFingerprint]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const handleAdd = useCallback(() => {
    const id = addNote();
    setSelectedId(id);
  }, [addNote]);

  const graphWidth = selectedNote ? dimensions.width - 360 : dimensions.width;

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 0px)",
        marginTop: "-60px",
        marginLeft: "-48px",
        marginRight: "-48px",
        marginBottom: "-60px",
        overflow: "hidden",
        backgroundColor: "#1e2124",
      }}
    >
      {/* Graph canvas */}
      <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to bottom, rgba(30,33,36,0.95) 60%, transparent)",
            pointerEvents: "none",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>
              Visual Knowledge Graph
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#B0E0E6", letterSpacing: "-0.02em" }}>
              Vald Brain
            </div>
          </div>
          <button
            onClick={handleAdd}
            style={{
              pointerEvents: "all",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              backgroundColor: "#B0E0E6",
              color: "#1e2124",
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={14} /> New Note
          </button>
        </div>

        {/* Category legend */}
        <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 10, display: "flex", flexDirection: "column", gap: "4px" }}>
          {categories.map((cat) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: categoryColors[cat], flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "#9aa5b0" }}>{cat}</span>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 10, fontSize: "11px", color: "#7a8a95" }}>
          {notes.length} nodes · {graphData.links.length} links
        </div>

        <ValdGraph
          graphData={graphData}
          selectedIdRef={selectedIdRef}
          nodeTitlesRef={nodeTitlesRef}
          nodeColorsRef={nodeColorsRef}
          onNodeClick={handleNodeClick}
          width={graphWidth}
          height={dimensions.height}
        />
      </div>

      {/* Side panel */}
      {selectedNote && (
        <SidePanel
          note={selectedNote}
          notes={notes}
          onUpdate={(changes) => updateNote(selectedNote.id, changes)}
          onDelete={() => {
            deleteNote(selectedNote.id);
            setSelectedId(null);
          }}
          onClose={() => setSelectedId(null)}
          onSelectNote={setSelectedId}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Side panel
// ---------------------------------------------------------------------------
function SidePanel({
  note,
  notes,
  onUpdate,
  onDelete,
  onClose,
  onSelectNote,
}: {
  note: ValdNote;
  notes: ValdNote[];
  onUpdate: (changes: Partial<Omit<ValdNote, "id">>) => void;
  onDelete: () => void;
  onClose: () => void;
  onSelectNote: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const linkedNotes = useMemo(() => {
    const titles = [...note.content.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]);
    return titles
      .map((t) => notes.find((n) => n.title === t))
      .filter((n): n is ValdNote => n !== undefined);
  }, [note.content, notes]);

  return (
    <div
      style={{
        width: "360px",
        minWidth: "360px",
        height: "100%",
        backgroundColor: "#23262A",
        borderLeft: "1px solid #36393F",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid #36393F",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            padding: "2px 8px",
            borderRadius: "20px",
            backgroundColor: categoryColors[note.category] + "25",
            color: categoryColors[note.category],
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {note.category}
        </span>

        <div style={{ display: "flex", gap: "4px" }}>
          {confirmDelete ? (
            <>
              <button
                onClick={onDelete}
                style={{ fontSize: "11px", padding: "3px 8px", backgroundColor: "#e05252", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ fontSize: "11px", padding: "3px 8px", backgroundColor: "transparent", color: "#7a8a95", border: "1px solid #36393F", borderRadius: "4px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </>
          ) : (
            <ActionIconBtn onClick={() => setConfirmDelete(true)} title="Delete note" danger>
              <Trash2 size={13} />
            </ActionIconBtn>
          )}
          <ActionIconBtn onClick={onClose} title="Close panel">
            <X size={13} />
          </ActionIconBtn>
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: "20px 16px 8px" }}>
        <input
          value={note.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          style={{
            width: "100%",
            fontSize: "22px",
            fontWeight: 700,
            color: "#B0E0E6",
            background: "none",
            border: "none",
            outline: "none",
            fontFamily: "inherit",
            letterSpacing: "-0.02em",
            padding: 0,
          }}
          placeholder="Note title"
        />

        <select
          value={note.category}
          onChange={(e) => onUpdate({ category: e.target.value as Category })}
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: categoryColors[note.category],
            background: "#2C2F33",
            border: "1px solid #36393F",
            borderRadius: "4px",
            padding: "3px 6px",
            cursor: "pointer",
            outline: "none",
            fontFamily: "inherit",
          }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={{ height: "1px", backgroundColor: "#36393F", margin: "0 16px" }} />

      {/* Content */}
      <textarea
        value={note.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder={"Write your thoughts...\n\nTip: Use [[Note Title]] to link to other notes."}
        style={{
          flex: 1,
          padding: "16px",
          background: "none",
          border: "none",
          outline: "none",
          resize: "none",
          fontSize: "13.5px",
          lineHeight: 1.7,
          color: "#9aa5b0",
          fontFamily: "inherit",
          overflowY: "auto",
        }}
      />

      {/* Linked notes — clickable to jump */}
      {linkedNotes.length > 0 && (
        <div style={{ borderTop: "1px solid #36393F", padding: "12px 16px", maxHeight: "160px", overflowY: "auto" }}>
          <div style={{ fontSize: "10px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            Linked Notes ({linkedNotes.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {linkedNotes.map((ln) => (
              <LinkedNoteRow
                key={ln.id}
                note={ln}
                onClick={() => onSelectNote(ln.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LinkedNoteRow({ note, onClick }: { note: ValdNote; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 8px",
        borderRadius: "5px",
        border: "none",
        backgroundColor: hov ? "rgba(176,224,230,0.07)" : "transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "background-color 0.1s",
        width: "100%",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: categoryColors[note.category],
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: "13px", color: hov ? "#B0E0E6" : "#9aa5b0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, transition: "color 0.1s" }}>
        {note.title}
      </span>
      <span style={{ fontSize: "10px", color: "#4a5568", flexShrink: 0 }}>
        {note.category}
      </span>
    </button>
  );
}

function ActionIconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(255,255,255,0.08)" : "none",
        border: "none",
        cursor: "pointer",
        padding: "5px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        color: hov ? (danger ? "#e05252" : "#B0E0E6") : "#7a8a95",
        transition: "all 0.1s",
      }}
    >
      {children}
    </button>
  );
}
