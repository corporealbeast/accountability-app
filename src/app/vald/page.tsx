"use client";

import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react";
import dynamic from "next/dynamic";
import { X, Plus, Trash2 } from "lucide-react";
import { useValdNotes, ValdNote, Category, categories, categoryColors } from "@/hooks/useValdNotes";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface GraphNode {
  id: string;
  label: string;
  category: Category;
  color: string;
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
}

// ---------------------------------------------------------------------------
// Isolated graph component — only re-renders when node/link count changes.
// selectedIdRef is a ref so canvas picks up the latest value on every frame
// without triggering a React re-render of the graph.
// ---------------------------------------------------------------------------
interface ValdGraphProps {
  graphData: { nodes: GraphNode[]; links: GraphLink[] };
  selectedIdRef: React.MutableRefObject<string | null>;
  onNodeClick: (node: GraphNode) => void;
  width: number;
  height: number;
}

const ValdGraph = memo(
  function ValdGraph({ graphData, selectedIdRef, onNodeClick, width, height }: ValdGraphProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fgRef = useRef<any>(null);

    // After the simulation settles, kill remaining energy so nodes stay put.
    const handleEngineStop = useCallback(() => {
      if (fgRef.current) {
        fgRef.current.d3Force("charge")?.strength(-30);
      }
    }, []);

    // Safety net: regardless of engineStop, freeze after 3 s.
    useEffect(() => {
      const t = setTimeout(() => {
        fgRef.current?.pauseAnimation?.();
        fgRef.current?.resumeAnimation?.();
        // Set alpha target to 0 so simulation stays cold.
        // react-force-graph-2d exposes the underlying d3 simulation via d3Force.
      }, 3000);
      return () => clearTimeout(t);
    }, [graphData]); // restart only when graph structure actually changes

    const paintNode = useCallback(
      (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const n = node as GraphNode & { x: number; y: number };
        const isSelected = n.id === selectedIdRef.current;
        const fontSize = Math.max(10 / globalScale, 3);

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = n.color + "35";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, isSelected ? 7 : 5, 0, 2 * Math.PI);
        ctx.fillStyle = n.color;
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
          ctx.fillText(n.label, n.x, n.y + 8);
        }
      },
      // intentionally omit selectedIdRef — it's a ref, always current on every frame
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
        nodeLabel="label"
        nodeRelSize={6}
        linkColor={() => "rgba(176,224,230,0.15)"}
        linkWidth={1.5}
        onNodeClick={onNodeClick as never}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        cooldownTicks={120}
        d3AlphaDecay={0.025}
        d3VelocityDecay={0.4}
        onEngineStop={handleEngineStop}
      />
    );
  },
  // Custom comparison: only re-render graph when structure (node/link count) changes
  // or when canvas dimensions change. Selection changes are handled via ref.
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

  // Keep a ref in sync with selectedId so the canvas callback can read the
  // latest value on every animation frame without the graph re-rendering.
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

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

  // Structural key: changes only when nodes are added/removed or links change.
  // Does NOT change when a note's title/content/category is edited.
  const structureKey = useMemo(
    () => notes.map((n) => `${n.id}:${[...n.links].sort().join(",")}`).join("|"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notes.length, notes.map((n) => n.links.join(",")).join("|")]
  );

  // Stable graph data — only recomputed on structural changes.
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = notes.map((n) => ({
      id: n.id,
      label: n.title,
      category: n.category,
      color: categoryColors[n.category],
      val: 3,
    }));

    const linkSet = new Set<string>();
    const links: GraphLink[] = [];

    notes.forEach((note) => {
      const wikiIds = getWikiLinks(note);
      const allLinked = [...new Set([...note.links, ...wikiIds])];
      allLinked.forEach((targetId) => {
        const key = [note.id, targetId].sort().join("--");
        if (!linkSet.has(key) && notes.some((n) => n.id === targetId)) {
          linkSet.add(key);
          links.push({ source: note.id, target: targetId });
        }
      });
    });

    return { nodes, links };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structureKey]);

  // Stable click handler — doesn't change between renders.
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
        {/* Header overlay */}
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
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {categories.map((cat) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: categoryColors[cat],
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "11px", color: "#9aa5b0" }}>{cat}</span>
            </div>
          ))}
        </div>

        {/* Node / link count */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 10,
            fontSize: "11px",
            color: "#7a8a95",
          }}
        >
          {notes.length} nodes · {graphData.links.length} links
        </div>

        <ValdGraph
          graphData={graphData}
          selectedIdRef={selectedIdRef}
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
}: {
  note: ValdNote;
  notes: ValdNote[];
  onUpdate: (changes: Partial<Omit<ValdNote, "id">>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const linkedNotes = useMemo(() => {
    const titles = [...note.content.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]);
    return titles.map((t) => notes.find((n) => n.title === t)).filter(Boolean) as ValdNote[];
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
      {/* Panel header */}
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
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  backgroundColor: "#e05252",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  backgroundColor: "transparent",
                  color: "#7a8a95",
                  border: "1px solid #36393F",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
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
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div style={{ height: "1px", backgroundColor: "#36393F", margin: "0 16px" }} />

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

      {linkedNotes.length > 0 && (
        <div
          style={{
            borderTop: "1px solid #36393F",
            padding: "12px 16px",
            maxHeight: "140px",
            overflowY: "auto",
          }}
        >
          <div style={{ fontSize: "10px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            Linked Notes ({linkedNotes.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {linkedNotes.map((ln) => (
              <div key={ln.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#9aa5b0" }}>
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: categoryColors[ln.category],
                    flexShrink: 0,
                  }}
                />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ln.title}
                </span>
                <span style={{ fontSize: "10px", color: "#4a5568", flexShrink: 0 }}>{ln.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
