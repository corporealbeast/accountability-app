"use client";

import { useState, useMemo } from "react";
import {
  ExternalLink, Plus, Trash2, GitBranch, Search,
  Check, BookOpen, ChevronDown, ChevronUp, GripVertical,
  Pencil, LayoutList, Layers,
} from "lucide-react";
import { useStack, StackItem, StackSection } from "@/hooks/useStack";
import { usePeptides, Peptide, PeptideSection } from "@/hooks/usePeptides";
import { usePEDs, PED, PEDStatus, PEDSection } from "@/hooks/usePEDs";
import { useBloodwork, BloodworkEntry } from "@/hooks/useBloodwork";
import { useValdNotes } from "@/hooks/useValdNotes";

type Tab = "supplements" | "peptides" | "peds" | "bloodwork";
const STACK_HUB_TITLE = "The Stack";

// ─────────────────────────────────────────────────────────────────────────────
export default function StackPage() {
  const [tab, setTab] = useState<Tab>("supplements");

  const suppHook   = useStack();
  const pepHook    = usePeptides();
  const pedHook    = usePEDs();
  const bwHook     = useBloodwork();
  const valdHook   = useValdNotes();

  const inStock    = suppHook.items.filter((i) => i.status === "In Stock").length;
  const needOrder  = suppHook.items.filter((i) => i.status === "Need to Order").length;
  const activePEDs = pedHook.items.filter((i) => i.status === "Active").length;

  const tabs: { key: Tab; label: string; count?: string }[] = [
    { key: "supplements", label: "Supplements", count: `${suppHook.items.length}` },
    { key: "peptides",    label: "Peptides",    count: `${pepHook.items.length}` },
    { key: "peds",        label: "PEDs",        count: `${activePEDs} active` },
    { key: "bloodwork",   label: "Bloodwork",   count: `${bwHook.items.length}` },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "13px", color: "#7a8a95", margin: "0 0 6px" }}>Performance · Health</p>
        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#B0E0E6", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          The Stack
        </h1>
        <p style={{ fontSize: "14px", color: "#9aa5b0", margin: 0 }}>
          {inStock} in stock · {needOrder} to order · {activePEDs} active protocols
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid #36393F", paddingBottom: "0" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? "#B0E0E6" : "#7a8a95",
              background: "none",
              border: "none",
              borderBottom: tab === t.key ? "2px solid #B0E0E6" : "2px solid transparent",
              cursor: "pointer",
              transition: "color 0.1s",
              marginBottom: "-1px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {t.label}
            {t.count && (
              <span style={{
                fontSize: "10px",
                padding: "1px 6px",
                borderRadius: "10px",
                backgroundColor: tab === t.key ? "rgba(176,224,230,0.15)" : "rgba(255,255,255,0.06)",
                color: tab === t.key ? "#B0E0E6" : "#7a8a95",
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "supplements" && <SupplementsTab hook={suppHook} valdHook={valdHook} />}
      {tab === "peptides"    && <PeptidesTab    hook={pepHook} />}
      {tab === "peds"        && <PEDsTab        hook={pedHook} />}
      {tab === "bloodwork"   && <BloodworkTab   hook={bwHook} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPLEMENTS TAB
// ─────────────────────────────────────────────────────────────────────────────
function SupplementsTab({
  hook,
  valdHook,
}: {
  hook: ReturnType<typeof useStack>;
  valdHook: ReturnType<typeof useValdNotes>;
}) {
  const { items, addItem, deleteItem, toggleStatus, updateItem, sections, addSection, updateSection, deleteSection, moveItemToSection } = hook;
  const { notes: valdNotes, addNote: addValdNote, updateNote: updateValdNote } = valdHook;
  const [search, setSearch]         = useState("");
  const [formOpen, setFormOpen]     = useState(false);
  const [linkedFlash, setLinkedFlash] = useState<string | null>(null);
  const [viewMode, setViewMode]     = useState<"table" | "supplies">("table");
  const [form, setForm] = useState<Record<string, string>>({ name: "", brand: "", timing: "", purchaseUrl: "" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (i) => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q) || i.timing.toLowerCase().includes(q)
    );
  }, [items, search]);

  const ensureStackHub = (): string => {
    const existing = valdNotes.find((n) => n.title === STACK_HUB_TITLE);
    if (existing) return existing.id;
    const id = addValdNote("Health");
    updateValdNote(id, { title: STACK_HUB_TITLE, content: "Central hub for the supplement stack.", links: [] });
    return id;
  };

  const handleValdLink = (item: StackItem) => {
    if (item.valdLinked) return;
    const hubId = ensureStackHub();
    const nodeId = addValdNote("Health");
    updateValdNote(nodeId, {
      title: item.name,
      content: `**Brand:** ${item.brand}\n**Dose / Timing:** ${item.timing}\n\nPart of [[${STACK_HUB_TITLE}]]`,
      links: [hubId],
    });
    updateItem(item.id, { valdLinked: true });
    setLinkedFlash(item.id);
    setTimeout(() => setLinkedFlash(null), 2000);
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addItem({ name: form.name.trim(), brand: form.brand.trim() || "—", timing: form.timing.trim() || "—", purchaseUrl: form.purchaseUrl.trim(), status: "In Stock" });
    setForm({ name: "", brand: "", timing: "", purchaseUrl: "" });
    setFormOpen(false);
  };

  return (
    <>
      <QuickAddBar
        open={formOpen}
        onToggle={() => setFormOpen((v) => !v)}
        fields={[
          { key: "name",        label: "Name",          placeholder: "Supplement name *" },
          { key: "brand",       label: "Brand",         placeholder: "Brand" },
          { key: "timing",      label: "Timing / Dose", placeholder: "5g · Post-Workout" },
          { key: "purchaseUrl", label: "Purchase URL",  placeholder: "https://..." },
        ]}
        form={form}
        setForm={setForm}
        onSubmit={handleAdd}
      />

      {/* View toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <SearchBar value={search} onChange={setSearch} />
        <ViewToggle value={viewMode} onChange={setViewMode} secondLabel="Sections" />
      </div>

      {viewMode === "table" ? (
        <Table>
          <TableHead cols={["Supplement", "Brand", "Timing / Dose", "Purchase", "Status", ""]}
            widths="2fr 1.4fr 1.6fr 110px 130px 110px" />
          {filtered.length === 0 ? (
            <EmptyRow message={search ? "No supplements match your search." : "No supplements yet."} />
          ) : filtered.map((item, idx) => (
            <SuppRow
              key={item.id}
              item={item}
              isLast={idx === filtered.length - 1}
              flash={linkedFlash === item.id}
              onToggleStatus={() => toggleStatus(item.id)}
              onDelete={() => deleteItem(item.id)}
              onValdLink={() => handleValdLink(item)}
            />
          ))}
        </Table>
      ) : (
        <SectionsView
          items={filtered}
          sections={sections}
          onToggleStatus={(id) => toggleStatus(id)}
          onDelete={(id) => deleteItem(id)}
          onValdLink={(item) => handleValdLink(item)}
          linkedFlash={linkedFlash}
          onAddSection={addSection}
          onUpdateSection={updateSection}
          onDeleteSection={deleteSection}
          onMove={moveItemToSection}
        />
      )}
    </>
  );
}

function SuppRow({ item, isLast, flash, onToggleStatus, onDelete, onValdLink }: {
  item: StackItem; isLast: boolean; flash: boolean;
  onToggleStatus: () => void; onDelete: () => void; onValdLink: () => void;
}) {
  const [hov, setHov] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirm(false); }}
      style={rowStyle(isLast, hov)}
    >
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1.6fr 110px 130px 110px", gap: "12px", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 500, color: "#B0E0E6" }}>{item.name}</div>
          {item.valdLinked && <div style={{ fontSize: "11px", color: "#20B2AA", marginTop: "2px", display: "flex", alignItems: "center", gap: "3px" }}><GitBranch size={10} /> Vald linked</div>}
        </div>
        <Cell>{item.brand}</Cell>
        <Cell>{item.timing}</Cell>
        <div><PurchaseLink url={item.purchaseUrl} /></div>
        <div><StatusBadge status={item.status} onClick={onToggleStatus} /></div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {flash ? (
            <span style={{ fontSize: "11px", color: "#20B2AA", display: "flex", alignItems: "center", gap: "3px", fontWeight: 600 }}><Check size={12} /> Linked!</span>
          ) : (
            <ValdLinkBtn linked={item.valdLinked} onClick={onValdLink} />
          )}
          {hov && <DeleteBtn confirm={confirm} onConfirm={onDelete} onRequest={() => setConfirm(true)} />}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTIONS VIEW
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_COLORS = [
  "#B0E0E6","#4ade80","#fb923c","#f87171",
  "#c084fc","#60a5fa","#facc15","#34d399","#f472b6",
];

// ── Generic add-section bar (shared) ─────────────────────────────────────────
function AddSupplyBar({ onAdd }: { onAdd: (name: string, color: string) => void }) {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState("");
  const [color, setColor]     = useState(SECTION_COLORS[0]);

  const commit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), color);
    setName(""); setColor(SECTION_COLORS[0]); setOpen(false);
  };

  return (
    <div style={{ marginBottom: "18px" }}>
      {open ? (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "8px" }}>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setOpen(false); }}
            placeholder="Section name…"
            style={{ flex: 1, padding: "6px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
            {SECTION_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: c, border: color === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer", padding: 0 }}
              />
            ))}
          </div>
          <button onClick={commit} style={{ padding: "6px 14px", backgroundColor: "#B0E0E6", color: "#23262A", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Create</button>
          <button onClick={() => setOpen(false)} style={{ padding: "6px 10px", background: "none", border: "1px solid #36393F", borderRadius: "6px", fontSize: "12px", color: "#7a8a95", cursor: "pointer" }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "none", border: "1px dashed #36393F", borderRadius: "7px", color: "#7a8a95", fontSize: "12px", cursor: "pointer" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#B0E0E6"; (e.currentTarget as HTMLButtonElement).style.color = "#B0E0E6"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#36393F"; (e.currentTarget as HTMLButtonElement).style.color = "#7a8a95"; }}
        >
          <Plus size={13} /> New section
        </button>
      )}
    </div>
  );
}

// ── Generic SectionGroup (reused by all tabs) ─────────────────────────────────
type AnySection = { id: string; name: string; color: string; collapsed: boolean };

function SectionGroup({
  section, itemCount, isDragOver, isUnsorted,
  onUpdate, onDeleteSection,
  onDragOver, onDragLeave, onDrop,
  emptyLabel, children,
}: {
  section: AnySection;
  itemCount: number;
  isDragOver: boolean;
  isUnsorted?: boolean;
  onUpdate?: (ch: Partial<Omit<AnySection, "id">>) => void;
  onDeleteSection?: () => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
  emptyLabel?: string;
  children: React.ReactNode;
}) {
  const [editing, setEditing]           = useState(false);
  const [nameVal, setNameVal]           = useState(section.name);
  const [hoverHeader, setHoverHeader]   = useState(false);
  const [pickingColor, setPickingColor] = useState(false);

  const commitName = () => {
    if (nameVal.trim() && nameVal.trim() !== section.name) onUpdate?.({ name: nameVal.trim() });
    setEditing(false); setPickingColor(false);
  };

  if (isUnsorted && itemCount === 0) return null;

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* Header */}
      <div
        onMouseEnter={() => setHoverHeader(true)}
        onMouseLeave={() => { setHoverHeader(false); setPickingColor(false); }}
        style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", padding: "7px 10px", borderRadius: "7px", backgroundColor: hoverHeader ? "rgba(255,255,255,0.03)" : "transparent" }}
      >
        <button onClick={() => onUpdate?.({ collapsed: !section.collapsed })}
          style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: isUnsorted ? "default" : "pointer", color: "#4a5568", padding: "2px" }}>
          {section.collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>

        {!isUnsorted ? (
          <div style={{ position: "relative" }}>
            <button onClick={() => setPickingColor((v) => !v)}
              style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: section.color, border: "none", cursor: "pointer", padding: 0 }}
            />
            {pickingColor && (
              <div style={{ position: "absolute", top: "18px", left: 0, zIndex: 20, display: "flex", gap: "5px", padding: "8px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
                {SECTION_COLORS.map((c) => (
                  <button key={c} onClick={() => { onUpdate?.({ color: c }); setPickingColor(false); }}
                    style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: c, border: section.color === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer", padding: 0 }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: section.color }} />
        )}

        {editing && !isUnsorted ? (
          <input autoFocus value={nameVal} onChange={(e) => setNameVal(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === "Enter") commitName(); if (e.key === "Escape") { setEditing(false); setNameVal(section.name); } }}
            style={{ fontSize: "12px", fontWeight: 600, color: "#B0E0E6", background: "none", border: "none", borderBottom: "1px solid #B0E0E6", outline: "none", fontFamily: "inherit", width: "160px" }}
          />
        ) : (
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#9aa5b0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{section.name}</span>
        )}

        <span style={{ fontSize: "11px", color: "#4a5568" }}>{itemCount}</span>

        {!isUnsorted && hoverHeader && (
          <div style={{ display: "flex", gap: "4px", marginLeft: "4px" }}>
            <button onClick={() => { setEditing(true); setNameVal(section.name); }}
              style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "#4a5568", padding: "2px 4px", borderRadius: "3px" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#B0E0E6")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#4a5568")}
            ><Pencil size={11} /></button>
            <button onClick={onDeleteSection}
              style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "#4a5568", padding: "2px 4px", borderRadius: "3px" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#f87171")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#4a5568")}
            ><Trash2 size={11} /></button>
          </div>
        )}
      </div>

      {/* Drop zone + items */}
      {!section.collapsed && (
        <div
          onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
          onDragLeave={onDragLeave}
          onDrop={(e) => { e.preventDefault(); onDrop(); }}
          style={{
            minHeight: "42px", borderRadius: "8px",
            border: isDragOver ? `1px dashed ${section.color}` : "1px solid transparent",
            backgroundColor: isDragOver ? `${section.color}0d` : "transparent",
            transition: "all 0.1s",
            padding: isDragOver && itemCount === 0 ? "16px" : "0",
          }}
        >
          {itemCount === 0 && !isDragOver && (
            <div style={{ padding: "10px 12px", fontSize: "12px", color: "#4a5568", fontStyle: "italic" }}>
              {emptyLabel ?? "Drag items here…"}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

// ── Supplements supplies view ─────────────────────────────────────────────────
function SectionsView({
  items, sections, linkedFlash,
  onToggleStatus, onDelete, onValdLink,
  onAddSection, onUpdateSection, onDeleteSection, onMove,
}: {
  items: StackItem[];
  sections: StackSection[];
  linkedFlash: string | null;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onValdLink: (item: StackItem) => void;
  onAddSection: (name: string, color: string) => string;
  onUpdateSection: (id: string, ch: Partial<Omit<StackSection, "id">>) => void;
  onDeleteSection: (id: string) => void;
  onMove: (itemId: string, sectionId: string | undefined) => void;
}) {
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState<string | null>(null);

  const unsorted = items.filter((i) => !i.sectionId || !sections.find((s) => s.id === i.sectionId));

  const dragHandlers = (secId: string | "unsorted") => ({
    onDragOver: () => setDragOver(secId),
    onDragLeave: () => setDragOver((p) => p === secId ? null : p),
    onDrop: () => { if (dragItemId) { onMove(dragItemId, secId === "unsorted" ? undefined : secId); setDragItemId(null); setDragOver(null); } },
  });

  return (
    <div>
      <AddSupplyBar onAdd={onAddSection} />
      {sections.map((sec) => {
        const secItems = items.filter((i) => i.sectionId === sec.id);
        return (
          <SectionGroup key={sec.id} section={sec} itemCount={secItems.length} isDragOver={dragOver === sec.id}
            onUpdate={(ch) => onUpdateSection(sec.id, ch)} onDeleteSection={() => onDeleteSection(sec.id)}
            emptyLabel="Drag supplements here…" {...dragHandlers(sec.id)}
          >
            {secItems.map((item, idx) => (
              <SectionItemRow key={item.id} item={item} sectionColor={sec.color} isLast={idx === secItems.length - 1}
                flash={linkedFlash === item.id} onToggleStatus={() => onToggleStatus(item.id)}
                onDelete={() => onDelete(item.id)} onValdLink={() => onValdLink(item)}
                onDragStart={() => setDragItemId(item.id)} onDragEnd={() => { setDragItemId(null); setDragOver(null); }}
              />
            ))}
          </SectionGroup>
        );
      })}
      <SectionGroup section={{ id: "unsorted", name: "Unsorted", color: "#4a5568", collapsed: false }}
        itemCount={unsorted.length} isDragOver={dragOver === "unsorted"} isUnsorted
        emptyLabel="Drag supplements here…" {...dragHandlers("unsorted")}
      >
        {unsorted.map((item, idx) => (
          <SectionItemRow key={item.id} item={item} sectionColor="#4a5568" isLast={idx === unsorted.length - 1}
            flash={linkedFlash === item.id} onToggleStatus={() => onToggleStatus(item.id)}
            onDelete={() => onDelete(item.id)} onValdLink={() => onValdLink(item)}
            onDragStart={() => setDragItemId(item.id)} onDragEnd={() => { setDragItemId(null); setDragOver(null); }}
          />
        ))}
      </SectionGroup>
    </div>
  );
}

function SectionItemRow({ item, sectionColor, isLast, flash, onToggleStatus, onDelete, onValdLink, onDragStart, onDragEnd }: {
  item: StackItem;
  sectionColor: string;
  isLast: boolean;
  flash: boolean;
  onToggleStatus: () => void;
  onDelete: () => void;
  onValdLink: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const [hov, setHov]         = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirm(false); }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "7px",
        marginBottom: isLast ? 0 : "3px",
        backgroundColor: hov ? "rgba(255,255,255,0.03)" : "#36393F",
        border: "1px solid #2C2F33",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      {/* Drag handle */}
      <GripVertical size={13} color={hov ? "#7a8a95" : "#2C2F33"} style={{ flexShrink: 0 }} />

      {/* Color accent */}
      <div style={{ width: "3px", height: "28px", borderRadius: "2px", backgroundColor: sectionColor, flexShrink: 0, opacity: 0.7 }} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "#B0E0E6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
        <div style={{ fontSize: "11px", color: "#4a5568" }}>{item.brand} · {item.timing}</div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
        <StatusBadge status={item.status} onClick={onToggleStatus} />
        {item.purchaseUrl && <PurchaseLink url={item.purchaseUrl} />}
        {flash ? (
          <span style={{ fontSize: "11px", color: "#20B2AA", display: "flex", alignItems: "center", gap: "3px", fontWeight: 600 }}><Check size={12} /> Linked!</span>
        ) : (
          <ValdLinkBtn linked={item.valdLinked} onClick={onValdLink} />
        )}
        {hov && <DeleteBtn confirm={confirm} onConfirm={onDelete} onRequest={() => setConfirm(true)} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PEPTIDES TAB
// ─────────────────────────────────────────────────────────────────────────────
function PeptidesTab({ hook }: { hook: ReturnType<typeof usePeptides> }) {
  const { items, addItem, deleteItem, toggleStatus, sections, addSection, updateSection, deleteSection, moveItemToSection } = hook;
  const [search, setSearch]     = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "supplies">("table");
  const [form, setForm] = useState<Record<string, string>>({ name: "", brand: "", timing: "", cost: "", purchaseUrl: "", studyLinks: "" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q));
  }, [items, search]);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addItem({
      name: form.name.trim(),
      brand: form.brand.trim() || "—",
      timing: form.timing.trim() || "—",
      cost: form.cost.trim() || "—",
      purchaseUrl: form.purchaseUrl.trim(),
      studyLinks: form.studyLinks.split(",").map((s) => s.trim()).filter(Boolean),
      status: "In Stock",
    });
    setForm({ name: "", brand: "", timing: "", cost: "", purchaseUrl: "", studyLinks: "" });
    setFormOpen(false);
  };

  return (
    <>
      <QuickAddBar
        open={formOpen}
        onToggle={() => setFormOpen((v) => !v)}
        fields={[
          { key: "name",        label: "Name",          placeholder: "Peptide name *" },
          { key: "brand",       label: "Brand",         placeholder: "Supplier" },
          { key: "timing",      label: "Timing / Dose", placeholder: "250mcg · 2x daily" },
          { key: "cost",        label: "Cost",          placeholder: "$45 / vial" },
          { key: "purchaseUrl", label: "Purchase URL",  placeholder: "https://..." },
          { key: "studyLinks",  label: "Study Links",   placeholder: "PubMed URLs, comma-separated" },
        ]}
        form={form}
        setForm={setForm}
        onSubmit={handleAdd}
        wide
      />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <SearchBar value={search} onChange={(v) => setSearch(v)} placeholder="Search peptides..." />
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === "table" ? (
        <Table>
          <TableHead cols={["Peptide", "Brand", "Timing / Dose", "Cost", "Purchase", "Studies", "Status", ""]}
            widths="1.8fr 1.2fr 1.6fr 100px 100px 90px 120px 80px" />
          {filtered.length === 0 ? (
            <EmptyRow message={search ? "No peptides match your search." : "No peptides yet."} />
          ) : filtered.map((item, idx) => (
            <PepRow key={item.id} item={item} isLast={idx === filtered.length - 1}
              onToggleStatus={() => toggleStatus(item.id)} onDelete={() => deleteItem(item.id)} />
          ))}
        </Table>
      ) : (
        <PeptidesSuppliesView
          items={filtered} sections={sections}
          onToggleStatus={(id) => toggleStatus(id)} onDelete={(id) => deleteItem(id)}
          onAddSection={addSection} onUpdateSection={updateSection}
          onDeleteSection={deleteSection} onMove={moveItemToSection}
        />
      )}
    </>
  );
}

function PepRow({ item, isLast, onToggleStatus, onDelete }: {
  item: Peptide; isLast: boolean; onToggleStatus: () => void; onDelete: () => void;
}) {
  const [hov, setHov]       = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirm(false); }}
      style={rowStyle(isLast, hov)}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr 1.6fr 100px 100px 90px 120px 80px", gap: "12px", alignItems: "center" }}>
        <div style={{ fontSize: "14px", fontWeight: 500, color: "#B0E0E6" }}>{item.name}</div>
        <Cell>{item.brand}</Cell>
        <Cell>{item.timing}</Cell>
        <Cell>{item.cost}</Cell>
        <div><PurchaseLink url={item.purchaseUrl} /></div>
        {/* Study links */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {item.studyLinks.length === 0 ? (
            <span style={{ fontSize: "12px", color: "#4a5568" }}>—</span>
          ) : item.studyLinks.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={url}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "11px",
                color: "#9370DB",
                textDecoration: "none",
                padding: "3px 7px",
                border: "1px solid rgba(147,112,219,0.3)",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#9370DB")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(147,112,219,0.3)")}
            >
              <BookOpen size={10} /> {i + 1}
            </a>
          ))}
        </div>
        <div><StatusBadge status={item.status} onClick={onToggleStatus} /></div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {hov && <DeleteBtn confirm={confirm} onConfirm={onDelete} onRequest={() => setConfirm(true)} />}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PED CALENDAR
// ─────────────────────────────────────────────────────────────────────────────
function parseWeekCount(duration: string): number {
  const m = duration.match(/(\d+)\s*week/i);
  return m ? parseInt(m[1]) : 16;
}

function PEDCalendar({ ped, onUpdate }: { ped: PED; onUpdate: (ch: Partial<Omit<PED, "id">>) => void }) {
  const weekCount = parseWeekCount(ped.duration);
  const checked = new Set(ped.weekChecks ?? []);
  const startDate = new Date(ped.createdAt + "T00:00:00");

  const toggleWeek = (idx: number) => {
    const next = new Set(checked);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    onUpdate({ weekChecks: Array.from(next) });
  };

  const getWeekRange = (idx: number) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + idx * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${fmt(start)}–${fmt(end)}`;
  };

  return (
    <div style={{ padding: "14px 18px", borderTop: "1px solid #2C2F33" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <span style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Cycle Tracker
        </span>
        <span style={{ fontSize: "10px", color: "#4a5568" }}>
          {checked.size} / {weekCount} weeks
        </span>
        {checked.size > 0 && (
          <div style={{ flex: 1, height: "3px", borderRadius: "2px", backgroundColor: "#2C2F33", overflow: "hidden" }}>
            <div style={{ width: `${(checked.size / weekCount) * 100}%`, height: "100%", backgroundColor: "#4ade80", borderRadius: "2px", transition: "width 0.2s" }} />
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "5px" }}>
        {Array.from({ length: weekCount }, (_, i) => {
          const isChecked = checked.has(i);
          return (
            <button
              key={i}
              onClick={() => toggleWeek(i)}
              title={`Week ${i + 1}: ${getWeekRange(i)}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "7px 4px",
                borderRadius: "6px",
                border: `1px solid ${isChecked ? "rgba(74,222,128,0.4)" : "#2C2F33"}`,
                backgroundColor: isChecked ? "rgba(74,222,128,0.12)" : "#2C2F33",
                cursor: "pointer",
                transition: "all 0.1s",
                color: isChecked ? "#4ade80" : "#4a5568",
                minHeight: "38px",
              }}
              onMouseEnter={(e) => { if (!isChecked) (e.currentTarget as HTMLButtonElement).style.borderColor = "#4a5568"; }}
              onMouseLeave={(e) => { if (!isChecked) (e.currentTarget as HTMLButtonElement).style.borderColor = "#2C2F33"; }}
            >
              <span style={{ fontSize: "9px", fontWeight: 700, lineHeight: 1 }}>W{i + 1}</span>
              {isChecked && <Check size={9} style={{ marginTop: "3px" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PEDs TAB
// ─────────────────────────────────────────────────────────────────────────────
function PEDsTab({ hook }: { hook: ReturnType<typeof usePEDs> }) {
  const { items, addItem, deleteItem, updateItem, sections, addSection, updateSection, deleteSection, moveItemToSection } = hook;
  const [formOpen, setFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "supplies">("table");
  const [search, setSearch]     = useState("");
  const [form, setForm] = useState({ name: "", dose: "", duration: "", status: "Planned" as PEDStatus, notes: "" });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addItem({ name: form.name.trim(), dose: form.dose.trim() || "—", duration: form.duration.trim() || "—", status: form.status, notes: form.notes.trim() });
    setForm({ name: "", dose: "", duration: "", status: "Planned", notes: "" });
    setFormOpen(false);
  };

  const filtered  = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.dose.toLowerCase().includes(q));
  }, [items, search]);

  const active    = filtered.filter((i) => i.status === "Active");
  const planned   = filtered.filter((i) => i.status === "Planned");
  const completed = filtered.filter((i) => i.status === "Completed");

  return (
    <>
      {/* Quick-add */}
      <div style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "10px", marginBottom: "24px", overflow: "hidden" }}>
        <button
          onClick={() => setFormOpen((v) => !v)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "14px 18px", background: "none", border: "none", cursor: "pointer", color: formOpen ? "#B0E0E6" : "#7a8a95", fontSize: "13px", fontWeight: 500, textAlign: "left" }}
        >
          <Plus size={15} /> Add protocol
        </button>
        {formOpen && (
          <div style={{ padding: "0 18px 18px", borderTop: "1px solid #2C2F33", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "10px" }}>
              {[
                { key: "name",     label: "Compound *",   placeholder: "e.g. Testosterone Cypionate" },
                { key: "dose",     label: "Dose",         placeholder: "200mg / week · IM" },
                { key: "duration", label: "Duration",     placeholder: "12 weeks" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <FormInput
                    value={form[key as keyof typeof form] as string}
                    onChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                    placeholder={placeholder}
                    onEnter={handleAdd}
                  />
                </div>
              ))}
              <div>
                <FieldLabel>Status</FieldLabel>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PEDStatus }))}
                  style={{ width: "100%", padding: "8px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit" }}
                >
                  <option value="Active">Active</option>
                  <option value="Planned">Planned</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <FieldLabel>Notes</FieldLabel>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Protocol notes, bloodwork schedule, side management..."
                rows={3}
                style={{ width: "100%", padding: "8px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <button onClick={handleAdd} style={{ padding: "8px 20px", backgroundColor: "#B0E0E6", color: "#23262A", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                Add Protocol
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search + view toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search protocols..." />
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === "table" ? (
        <>
          {[
            { label: "Active",    color: "#4ade80", items: active },
            { label: "Planned",   color: "#B0E0E6", items: planned },
            { label: "Completed", color: "#7a8a95", items: completed },
          ].map(({ label, color, items: group }) =>
            group.length === 0 ? null : (
              <div key={label} style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color }} />
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {label} · {group.length}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {group.map((ped) => (
                    <PEDCard key={ped.id} ped={ped} onUpdate={(ch) => updateItem(ped.id, ch)} onDelete={() => deleteItem(ped.id)} />
                  ))}
                </div>
              </div>
            )
          )}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "#7a8a95", fontSize: "14px", padding: "48px 0" }}>
              {search ? "No protocols match your search." : "No protocols yet. Add one above."}
            </div>
          )}
        </>
      ) : (
        <PEDsSuppliesView
          items={filtered} sections={sections}
          onUpdate={(id, ch) => updateItem(id, ch)} onDelete={(id) => deleteItem(id)}
          onAddSection={addSection} onUpdateSection={updateSection}
          onDeleteSection={deleteSection} onMove={moveItemToSection}
        />
      )}
    </>
  );
}

// ── Shared view toggle ────────────────────────────────────────────────────────
function ViewToggle({ value, onChange, secondLabel = "Supplies" }: { value: "table" | "supplies"; onChange: (v: "table" | "supplies") => void; secondLabel?: string }) {
  return (
    <div style={{ display: "flex", gap: "2px", backgroundColor: "#2C2F33", borderRadius: "7px", padding: "3px", flexShrink: 0 }}>
      {(["table", "supplies"] as const).map((mode) => (
        <button key={mode} onClick={() => onChange(mode)}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "5px 12px", borderRadius: "5px", border: "none", cursor: "pointer",
            fontSize: "12px", fontWeight: 500,
            backgroundColor: value === mode ? "#36393F" : "transparent",
            color: value === mode ? "#B0E0E6" : "#7a8a95",
            transition: "all 0.1s",
          }}
        >
          {mode === "table" ? <LayoutList size={13} /> : <Layers size={13} />}
          {mode === "table" ? "Table" : secondLabel}
        </button>
      ))}
    </div>
  );
}

// ── Peptides Supplies view ────────────────────────────────────────────────────
function PeptidesSuppliesView({
  items, sections, onToggleStatus, onDelete,
  onAddSection, onUpdateSection, onDeleteSection, onMove,
}: {
  items: Peptide[];
  sections: PeptideSection[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSection: (name: string, color: string) => string;
  onUpdateSection: (id: string, ch: Partial<Omit<PeptideSection, "id">>) => void;
  onDeleteSection: (id: string) => void;
  onMove: (itemId: string, sectionId: string | undefined) => void;
}) {
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState<string | null>(null);

  const unsorted = items.filter((i) => !i.sectionId || !sections.find((s) => s.id === i.sectionId));

  const dragHandlers = (secId: string | "unsorted") => ({
    onDragOver: () => setDragOver(secId),
    onDragLeave: () => setDragOver((p) => p === secId ? null : p),
    onDrop: () => { if (dragItemId) { onMove(dragItemId, secId === "unsorted" ? undefined : secId); setDragItemId(null); setDragOver(null); } },
  });

  return (
    <div>
      <AddSupplyBar onAdd={onAddSection} />
      {sections.map((sec) => {
        const secItems = items.filter((i) => i.sectionId === sec.id);
        return (
          <SectionGroup key={sec.id} section={sec} itemCount={secItems.length} isDragOver={dragOver === sec.id}
            onUpdate={(ch) => onUpdateSection(sec.id, ch)} onDeleteSection={() => onDeleteSection(sec.id)}
            emptyLabel="Drag peptides here…" {...dragHandlers(sec.id)}
          >
            {secItems.map((item, idx) => (
              <PepSupplyRow key={item.id} item={item} sectionColor={sec.color} isLast={idx === secItems.length - 1}
                onToggleStatus={() => onToggleStatus(item.id)} onDelete={() => onDelete(item.id)}
                onDragStart={() => setDragItemId(item.id)} onDragEnd={() => { setDragItemId(null); setDragOver(null); }}
              />
            ))}
          </SectionGroup>
        );
      })}
      <SectionGroup section={{ id: "unsorted", name: "Unsorted", color: "#4a5568", collapsed: false }}
        itemCount={unsorted.length} isDragOver={dragOver === "unsorted"} isUnsorted
        emptyLabel="Drag peptides here…" {...dragHandlers("unsorted")}
      >
        {unsorted.map((item, idx) => (
          <PepSupplyRow key={item.id} item={item} sectionColor="#4a5568" isLast={idx === unsorted.length - 1}
            onToggleStatus={() => onToggleStatus(item.id)} onDelete={() => onDelete(item.id)}
            onDragStart={() => setDragItemId(item.id)} onDragEnd={() => { setDragItemId(null); setDragOver(null); }}
          />
        ))}
      </SectionGroup>
    </div>
  );
}

function PepSupplyRow({ item, sectionColor, isLast, onToggleStatus, onDelete, onDragStart, onDragEnd }: {
  item: Peptide; sectionColor: string; isLast: boolean;
  onToggleStatus: () => void; onDelete: () => void; onDragStart: () => void; onDragEnd: () => void;
}) {
  const [hov, setHov]         = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => { setHov(false); setConfirm(false); }}
      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "7px", marginBottom: isLast ? 0 : "3px", backgroundColor: hov ? "rgba(255,255,255,0.03)" : "#36393F", border: "1px solid #2C2F33", cursor: "grab", userSelect: "none" }}
    >
      <GripVertical size={13} color={hov ? "#7a8a95" : "#2C2F33"} style={{ flexShrink: 0 }} />
      <div style={{ width: "3px", height: "28px", borderRadius: "2px", backgroundColor: sectionColor, flexShrink: 0, opacity: 0.7 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "#B0E0E6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
        <div style={{ fontSize: "11px", color: "#4a5568" }}>{item.brand} · {item.timing} · {item.cost}</div>
      </div>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
        <StatusBadge status={item.status} onClick={onToggleStatus} />
        {item.purchaseUrl && <PurchaseLink url={item.purchaseUrl} />}
        {hov && <DeleteBtn confirm={confirm} onConfirm={onDelete} onRequest={() => setConfirm(true)} />}
      </div>
    </div>
  );
}

// ── PEDs Supplies view ────────────────────────────────────────────────────────
function PEDsSuppliesView({
  items, sections, onUpdate, onDelete,
  onAddSection, onUpdateSection, onDeleteSection, onMove,
}: {
  items: PED[];
  sections: PEDSection[];
  onUpdate: (id: string, ch: Partial<Omit<PED, "id">>) => void;
  onDelete: (id: string) => void;
  onAddSection: (name: string, color: string) => string;
  onUpdateSection: (id: string, ch: Partial<Omit<PEDSection, "id">>) => void;
  onDeleteSection: (id: string) => void;
  onMove: (itemId: string, sectionId: string | undefined) => void;
}) {
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState<string | null>(null);

  const unsorted = items.filter((i) => !i.sectionId || !sections.find((s) => s.id === i.sectionId));

  const dragHandlers = (secId: string | "unsorted") => ({
    onDragOver: () => setDragOver(secId),
    onDragLeave: () => setDragOver((p) => p === secId ? null : p),
    onDrop: () => { if (dragItemId) { onMove(dragItemId, secId === "unsorted" ? undefined : secId); setDragItemId(null); setDragOver(null); } },
  });

  return (
    <div>
      <AddSupplyBar onAdd={onAddSection} />
      {sections.map((sec) => {
        const secItems = items.filter((i) => i.sectionId === sec.id);
        return (
          <SectionGroup key={sec.id} section={sec} itemCount={secItems.length} isDragOver={dragOver === sec.id}
            onUpdate={(ch) => onUpdateSection(sec.id, ch)} onDeleteSection={() => onDeleteSection(sec.id)}
            emptyLabel="Drag protocols here…" {...dragHandlers(sec.id)}
          >
            {secItems.map((item, idx) => (
              <PEDSupplyRow key={item.id} item={item} sectionColor={sec.color} isLast={idx === secItems.length - 1}
                onUpdate={(ch) => onUpdate(item.id, ch)} onDelete={() => onDelete(item.id)}
                onDragStart={() => setDragItemId(item.id)} onDragEnd={() => { setDragItemId(null); setDragOver(null); }}
              />
            ))}
          </SectionGroup>
        );
      })}
      <SectionGroup section={{ id: "unsorted", name: "Unsorted", color: "#4a5568", collapsed: false }}
        itemCount={unsorted.length} isDragOver={dragOver === "unsorted"} isUnsorted
        emptyLabel="Drag protocols here…" {...dragHandlers("unsorted")}
      >
        {unsorted.map((item, idx) => (
          <PEDSupplyRow key={item.id} item={item} sectionColor="#4a5568" isLast={idx === unsorted.length - 1}
            onUpdate={(ch) => onUpdate(item.id, ch)} onDelete={() => onDelete(item.id)}
            onDragStart={() => setDragItemId(item.id)} onDragEnd={() => { setDragItemId(null); setDragOver(null); }}
          />
        ))}
      </SectionGroup>
    </div>
  );
}

function PEDSupplyRow({ item, sectionColor, isLast, onUpdate, onDelete, onDragStart, onDragEnd }: {
  item: PED; sectionColor: string; isLast: boolean;
  onUpdate: (ch: Partial<Omit<PED, "id">>) => void;
  onDelete: () => void; onDragStart: () => void; onDragEnd: () => void;
}) {
  const [hov, setHov]         = useState(false);
  const [confirm, setConfirm] = useState(false);

  const statusColor: Record<PEDStatus, string> = { Active: "#4ade80", Planned: "#B0E0E6", Completed: "#7a8a95" };

  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => { setHov(false); setConfirm(false); }}
      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "7px", marginBottom: isLast ? 0 : "3px", backgroundColor: hov ? "rgba(255,255,255,0.03)" : "#36393F", border: "1px solid #2C2F33", cursor: "grab", userSelect: "none" }}
    >
      <GripVertical size={13} color={hov ? "#7a8a95" : "#2C2F33"} style={{ flexShrink: 0 }} />
      <div style={{ width: "3px", height: "28px", borderRadius: "2px", backgroundColor: sectionColor, flexShrink: 0, opacity: 0.7 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "#B0E0E6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
        <div style={{ fontSize: "11px", color: "#4a5568" }}>{item.dose} · {item.duration}</div>
      </div>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
        <select value={item.status} onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ status: e.target.value as PEDStatus })}
          style={{ fontSize: "11px", padding: "2px 6px", backgroundColor: statusColor[item.status] + "18", border: `1px solid ${statusColor[item.status]}50`, borderRadius: "4px", color: statusColor[item.status], cursor: "pointer", outline: "none", fontFamily: "inherit", fontWeight: 600 }}
        >
          <option value="Active">Active</option>
          <option value="Planned">Planned</option>
          <option value="Completed">Completed</option>
        </select>
        {hov && <DeleteBtn confirm={confirm} onConfirm={onDelete} onRequest={() => setConfirm(true)} />}
      </div>
    </div>
  );
}

function PEDCard({ ped, onUpdate, onDelete }: {
  ped: PED;
  onUpdate: (changes: Partial<Omit<PED, "id">>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirm, setConfirm]   = useState(false);
  const [hov, setHov]           = useState(false);

  const statusColor: Record<PEDStatus, string> = {
    Active: "#4ade80", Planned: "#B0E0E6", Completed: "#7a8a95",
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirm(false); }}
      style={{
        backgroundColor: "#36393F",
        border: "1px solid #2C2F33",
        borderRadius: "10px",
        overflow: "hidden",
        transition: "border-color 0.1s",
        borderColor: hov ? "#4a5568" : "#2C2F33",
      }}
    >
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#B0E0E6" }}>{ped.name}</span>
            {/* Status selector */}
            <select
              value={ped.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onUpdate({ status: e.target.value as PEDStatus })}
              style={{
                fontSize: "11px",
                padding: "2px 6px",
                backgroundColor: statusColor[ped.status] + "18",
                border: `1px solid ${statusColor[ped.status]}50`,
                borderRadius: "4px",
                color: statusColor[ped.status],
                cursor: "pointer",
                outline: "none",
                fontFamily: "inherit",
                fontWeight: 600,
              }}
            >
              <option value="Active">Active</option>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#9aa5b0" }}>
            <span>💉 {ped.dose}</span>
            <span>🗓 {ped.duration}</span>
            <span style={{ color: "#4a5568", fontSize: "11px" }}>Added {ped.createdAt}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {hov && <DeleteBtn confirm={confirm} onConfirm={onDelete} onRequest={() => setConfirm(true)} />}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#7a8a95", background: "none", border: "1px solid #36393F", borderRadius: "5px", padding: "5px 10px", cursor: "pointer" }}
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Collapse" : "View Doc"}
          </button>
        </div>
      </div>

      {/* Expanded notes doc */}
      {expanded && (
        <div style={{ borderTop: "1px solid #2C2F33" }}>
          <PEDCalendar ped={ped} onUpdate={onUpdate} />
          <div style={{ borderTop: "1px solid #2C2F33", padding: "10px 18px 6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <BookOpen size={12} color="#7a8a95" />
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Protocol Notes — auto-saves
            </span>
          </div>
          <textarea
            value={ped.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Document your protocol: dosing schedule, bloodwork results, side effects, adjustments..."
            style={{
              width: "100%",
              minHeight: "180px",
              padding: "12px 18px 18px",
              background: "none",
              border: "none",
              outline: "none",
              resize: "vertical",
              fontSize: "13.5px",
              lineHeight: 1.75,
              color: "#9aa5b0",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOODWORK TAB
// ─────────────────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

function daysUntil(iso: string): number {
  const target = new Date(iso + "T00:00:00");
  const now    = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

function NextBloodworkBanner({ items }: { items: BloodworkEntry[] }) {
  const upcoming = items
    .filter((i) => i.nextDate)
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))[0];

  if (!upcoming) return null;

  const days  = daysUntil(upcoming.nextDate);
  const overdue = days < 0;
  const urgent  = days >= 0 && days <= 7;
  const color   = overdue ? "#f87171" : urgent ? "#fb923c" : "#4ade80";
  const bg      = overdue ? "rgba(248,113,113,0.08)" : urgent ? "rgba(251,146,60,0.08)" : "rgba(74,222,128,0.08)";
  const border  = overdue ? "rgba(248,113,113,0.25)" : urgent ? "rgba(251,146,60,0.25)" : "rgba(74,222,128,0.2)";

  const label = overdue
    ? `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""}`
    : days === 0
    ? "Today"
    : `In ${days} day${days !== 1 ? "s" : ""}`;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 18px",
      backgroundColor: bg,
      border: `1px solid ${border}`,
      borderRadius: "10px",
      marginBottom: "20px",
    }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color }}>
          Next Bloodwork: {formatDate(upcoming.nextDate)}
        </span>
        <span style={{ fontSize: "12px", color: "#7a8a95", marginLeft: "10px" }}>{label}</span>
        {upcoming.lab && (
          <span style={{ fontSize: "12px", color: "#4a5568", marginLeft: "10px" }}>· {upcoming.lab}</span>
        )}
      </div>
    </div>
  );
}

function BloodworkTab({ hook }: { hook: ReturnType<typeof useBloodwork> }) {
  const { items, addItem, updateItem, deleteItem } = hook;
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", lab: "", nextDate: "", notes: "" });
  const [fileData, setFileData] = useState<{ name: string; type: string; data: string } | null>(null);
  const [fileErr, setFileErr] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileErr("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setFileErr("File too large — max 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      setFileData({ name: file.name, type: file.type, data: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addItem({
      title:    form.title.trim(),
      date:     form.date,
      lab:      form.lab.trim(),
      nextDate: form.nextDate,
      notes:    form.notes.trim(),
      fileName: fileData?.name ?? "",
      fileType: fileData?.type ?? "",
      fileData: fileData?.data ?? "",
    });
    setForm({ title: "", date: "", lab: "", nextDate: "", notes: "" });
    setFileData(null);
    setFileErr("");
    setFormOpen(false);
  };

  return (
    <>
      <NextBloodworkBanner items={items} />

      {/* Quick-add form */}
      <div style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "10px", marginBottom: "24px", overflow: "hidden" }}>
        <button
          onClick={() => setFormOpen((v) => !v)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "14px 18px", background: "none", border: "none", cursor: "pointer", color: formOpen ? "#B0E0E6" : "#7a8a95", fontSize: "13px", fontWeight: 500, textAlign: "left" }}
        >
          <Plus size={15} /> Log bloodwork
        </button>
        {formOpen && (
          <div style={{ padding: "0 18px 18px", borderTop: "1px solid #2C2F33", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "10px" }}>
              <div>
                <FieldLabel>Title *</FieldLabel>
                <FormInput value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="Full Panel – Mar 2026" onEnter={handleAdd} />
              </div>
              <div>
                <FieldLabel>Draw Date</FieldLabel>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div>
                <FieldLabel>Lab / Clinic</FieldLabel>
                <FormInput value={form.lab} onChange={(v) => setForm((f) => ({ ...f, lab: v }))} placeholder="LabCorp, Quest…" onEnter={handleAdd} />
              </div>
              <div>
                <FieldLabel>Next Draw Date</FieldLabel>
                <input type="date" value={form.nextDate} onChange={(e) => setForm((f) => ({ ...f, nextDate: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* File upload */}
            <div>
              <FieldLabel>Results File (PDF or image · max 8 MB)</FieldLabel>
              <label style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
                backgroundColor: "#2C2F33", border: "1px dashed #4a5568", borderRadius: "6px",
                cursor: "pointer", color: fileData ? "#4ade80" : "#7a8a95", fontSize: "13px",
              }}>
                <input type="file" accept=".pdf,image/*" onChange={handleFile} style={{ display: "none" }} />
                {fileData ? `✓ ${fileData.name}` : "Click to attach results file…"}
              </label>
              {fileErr && <div style={{ fontSize: "11px", color: "#f87171", marginTop: "4px" }}>{fileErr}</div>}
            </div>

            {/* Notes */}
            <div>
              <FieldLabel>Notes</FieldLabel>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Key markers, flags, follow-ups…" rows={3}
                style={{ width: "100%", padding: "8px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div>
              <button onClick={handleAdd} style={{ padding: "8px 20px", backgroundColor: "#B0E0E6", color: "#23262A", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                Save Entry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entries */}
      {items.length === 0 ? (
        <div style={{ textAlign: "center", color: "#7a8a95", fontSize: "14px", padding: "48px 0" }}>
          No bloodwork logged yet. Add an entry above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.map((entry) => (
            <BloodworkCard
              key={entry.id}
              entry={entry}
              onUpdate={(ch) => updateItem(entry.id, ch)}
              onDelete={() => deleteItem(entry.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function BloodworkCard({ entry, onUpdate, onDelete }: {
  entry: BloodworkEntry;
  onUpdate: (ch: Partial<Omit<BloodworkEntry, "id">>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded]   = useState(false);
  const [hov, setHov]             = useState(false);
  const [confirm, setConfirm]     = useState(false);
  const [fileErr, setFileErr]     = useState("");

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileErr("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setFileErr("File too large — max 8 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      onUpdate({ fileName: file.name, fileType: file.type, fileData: base64 });
    };
    reader.readAsDataURL(file);
  };

  const openFile = () => {
    if (!entry.fileData) return;
    const mime  = entry.fileType || "application/octet-stream";
    const bytes = atob(entry.fileData);
    const arr   = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob  = new Blob([arr], { type: mime });
    const url   = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const days     = entry.nextDate ? daysUntil(entry.nextDate) : null;
  const overdue  = days !== null && days < 0;
  const urgent   = days !== null && days >= 0 && days <= 7;
  const nextColor = overdue ? "#f87171" : urgent ? "#fb923c" : "#4ade80";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirm(false); }}
      style={{
        backgroundColor: "#36393F",
        border: `1px solid ${hov ? "#4a5568" : "#2C2F33"}`,
        borderRadius: "10px",
        overflow: "hidden",
        transition: "border-color 0.1s",
      }}
    >
      {/* Card header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#B0E0E6" }}>{entry.title}</span>
            {entry.date && (
              <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(176,224,230,0.1)", color: "#9aa5b0", fontWeight: 500 }}>
                {formatDate(entry.date)}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#7a8a95", flexWrap: "wrap" }}>
            {entry.lab && <span>🏥 {entry.lab}</span>}
            {entry.nextDate && (
              <span style={{ color: nextColor, fontWeight: 500 }}>
                Next: {formatDate(entry.nextDate)}{days !== null && ` (${days === 0 ? "today" : overdue ? `${Math.abs(days)}d overdue` : `in ${days}d`})`}
              </span>
            )}
            {entry.fileName && <span style={{ color: "#4a5568" }}>📎 {entry.fileName}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {hov && <DeleteBtn confirm={confirm} onConfirm={onDelete} onRequest={() => setConfirm(true)} />}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#7a8a95", background: "none", border: "1px solid #36393F", borderRadius: "5px", padding: "5px 10px", cursor: "pointer" }}
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Collapse" : "View"}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: "1px solid #2C2F33" }}>

          {/* Next draw date editor */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #2C2F33", display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <FieldLabel>Draw Date</FieldLabel>
              <input type="date" value={entry.date}
                onChange={(e) => onUpdate({ date: e.target.value })}
                style={{ padding: "6px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
            </div>
            <div>
              <FieldLabel>Lab / Clinic</FieldLabel>
              <input value={entry.lab} onChange={(e) => onUpdate({ lab: e.target.value })} placeholder="LabCorp, Quest…"
                style={{ padding: "6px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit", width: "180px" }} />
            </div>
            <div>
              <FieldLabel>Next Draw Date</FieldLabel>
              <input type="date" value={entry.nextDate}
                onChange={(e) => onUpdate({ nextDate: e.target.value })}
                style={{ padding: "6px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
            </div>
          </div>

          {/* File section */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #2C2F33" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em" }}>Results File</span>
              {entry.fileData && (
                <button onClick={openFile} style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", padding: "3px 10px", backgroundColor: "rgba(176,224,230,0.1)", color: "#B0E0E6", border: "1px solid rgba(176,224,230,0.25)", borderRadius: "5px", cursor: "pointer" }}>
                  <ExternalLink size={10} /> Open {entry.fileName}
                </button>
              )}
            </div>
            <label style={{
              display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 14px",
              backgroundColor: "#2C2F33", border: "1px dashed #4a5568", borderRadius: "6px",
              cursor: "pointer", color: "#7a8a95", fontSize: "12px",
            }}>
              <input type="file" accept=".pdf,image/*" onChange={handleReplaceFile} style={{ display: "none" }} />
              {entry.fileName ? `Replace file…` : "Attach results file…"}
            </label>
            {fileErr && <div style={{ fontSize: "11px", color: "#f87171", marginTop: "4px" }}>{fileErr}</div>}
          </div>

          {/* Notes */}
          <div style={{ padding: "10px 18px 6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <BookOpen size={12} color="#7a8a95" />
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em" }}>Notes — auto-saves</span>
          </div>
          <textarea
            value={entry.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Key markers, flags, trends, follow-up items…"
            style={{
              width: "100%", minHeight: "160px", padding: "8px 18px 18px",
              background: "none", border: "none", outline: "none", resize: "vertical",
              fontSize: "13.5px", lineHeight: 1.75, color: "#9aa5b0",
              fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function QuickAddBar({
  open, onToggle, fields, form, setForm, onSubmit, wide,
}: {
  open: boolean;
  onToggle: () => void;
  fields: { key: string; label: string; placeholder: string }[];
  form: Record<string, string>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmit: () => void;
  wide?: boolean;
}) {
  const cols = wide ? Math.min(fields.length, 3) : fields.length;
  return (
    <div style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "10px", marginBottom: "16px", overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "14px 18px", background: "none", border: "none", cursor: "pointer", color: open ? "#B0E0E6" : "#7a8a95", fontSize: "13px", fontWeight: 500, textAlign: "left" }}
      >
        <Plus size={15} /> Quick-add
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid #2C2F33", paddingTop: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr) auto`, gap: "10px", alignItems: "end", flexWrap: "wrap" }}>
            {fields.slice(0, cols).map(({ key, label, placeholder }) => (
              <div key={key}>
                <FieldLabel>{label}</FieldLabel>
                <FormInput
                  value={form[key] ?? ""}
                  onChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                  placeholder={placeholder}
                  onEnter={onSubmit}
                />
              </div>
            ))}
            <button onClick={onSubmit} style={{ padding: "8px 18px", backgroundColor: "#B0E0E6", color: "#23262A", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              Add
            </button>
          </div>
          {wide && fields.length > cols && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${fields.length - cols}, 1fr)`, gap: "10px", marginTop: "10px" }}>
              {fields.slice(cols).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <FormInput
                    value={form[key] ?? ""}
                    onChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                    placeholder={placeholder}
                    onEnter={onSubmit}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "8px", padding: "0 14px" }}>
      <Search size={14} color="#7a8a95" style={{ flexShrink: 0 }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, padding: "11px 0", background: "none", border: "none", outline: "none", color: "#B0E0E6", fontSize: "13px", fontFamily: "inherit" }} />
    </div>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
      {children}
    </div>
  );
}

function TableHead({ cols, widths }: { cols: string[]; widths: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: widths, padding: "10px 18px", borderBottom: "1px solid #2C2F33", gap: "12px" }}>
      {cols.map((h) => (
        <div key={h} style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
      ))}
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return <div style={{ padding: "36px", textAlign: "center", color: "#7a8a95", fontSize: "14px" }}>{message}</div>;
}

function Cell({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "13px", color: "#9aa5b0" }}>{children}</div>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "10px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>{children}</div>;
}

function FormInput({ value, onChange, placeholder, onEnter }: { value: string; onChange: (v: string) => void; placeholder: string; onEnter: () => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter()}
      placeholder={placeholder}
      style={{ width: "100%", padding: "8px 10px", backgroundColor: "#2C2F33", border: "1px solid #36393F", borderRadius: "6px", color: "#B0E0E6", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
    />
  );
}

function PurchaseLink({ url }: { url: string }) {
  if (!url) return <span style={{ fontSize: "12px", color: "#4a5568" }}>—</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#B0E0E6", textDecoration: "none", padding: "4px 10px", border: "1px solid rgba(176,224,230,0.3)", borderRadius: "5px", transition: "all 0.1s" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#B0E0E6"; e.currentTarget.style.backgroundColor = "rgba(176,224,230,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(176,224,230,0.3)"; e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      <ExternalLink size={11} /> Shop
    </a>
  );
}

function StatusBadge({ status, onClick }: { status: string; onClick: () => void }) {
  const inStock = status === "In Stock";
  return (
    <button onClick={onClick} title="Click to toggle"
      style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px", border: "none", cursor: "pointer", backgroundColor: inStock ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)", color: inStock ? "#4ade80" : "#f87171", whiteSpace: "nowrap" }}>
      {inStock ? "✓ In Stock" : "⚠ Order"}
    </button>
  );
}

function ValdLinkBtn({ linked, onClick }: { linked: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={linked ? "Already in Vald Brain" : "Add to Vald Brain"}
      style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", padding: "4px 8px", backgroundColor: linked ? "rgba(32,178,170,0.1)" : "transparent", color: linked ? "#20B2AA" : "#7a8a95", border: `1px solid ${linked ? "rgba(32,178,170,0.3)" : "#36393F"}`, borderRadius: "5px", cursor: linked ? "default" : "pointer", whiteSpace: "nowrap" }}
      onMouseEnter={(e) => { if (!linked) (e.currentTarget as HTMLButtonElement).style.borderColor = "#20B2AA"; }}
      onMouseLeave={(e) => { if (!linked) (e.currentTarget as HTMLButtonElement).style.borderColor = "#36393F"; }}
    >
      <GitBranch size={11} />
      {linked ? "Linked" : "Link"}
    </button>
  );
}

function DeleteBtn({ confirm, onConfirm, onRequest }: { confirm: boolean; onConfirm: () => void; onRequest: () => void }) {
  if (confirm) {
    return (
      <button onClick={onConfirm} style={{ fontSize: "11px", padding: "3px 7px", backgroundColor: "#e05252", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}>
        Sure?
      </button>
    );
  }
  return (
    <button onClick={onRequest} title="Delete" style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#4a5568", borderRadius: "4px" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#e05252")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#4a5568")}
    >
      <Trash2 size={13} />
    </button>
  );
}

function rowStyle(isLast: boolean, hovered: boolean): React.CSSProperties {
  return {
    padding: "14px 18px",
    borderBottom: isLast ? "none" : "1px solid #2C2F33",
    backgroundColor: hovered ? "rgba(255,255,255,0.025)" : "transparent",
    transition: "background-color 0.1s",
  };
}

