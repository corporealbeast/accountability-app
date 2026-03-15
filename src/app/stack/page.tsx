"use client";

import { useState, useMemo } from "react";
import {
  ExternalLink, Plus, Trash2, GitBranch, Search,
  Check, BookOpen, ChevronDown, ChevronUp,
} from "lucide-react";
import { useStack, StackItem } from "@/hooks/useStack";
import { usePeptides, Peptide } from "@/hooks/usePeptides";
import { usePEDs, PED, PEDStatus } from "@/hooks/usePEDs";
import { useValdNotes } from "@/hooks/useValdNotes";

type Tab = "supplements" | "peptides" | "peds";
const STACK_HUB_TITLE = "The Stack";

// ─────────────────────────────────────────────────────────────────────────────
export default function StackPage() {
  const [tab, setTab] = useState<Tab>("supplements");

  const suppHook   = useStack();
  const pepHook    = usePeptides();
  const pedHook    = usePEDs();
  const valdHook   = useValdNotes();

  const inStock    = suppHook.items.filter((i) => i.status === "In Stock").length;
  const needOrder  = suppHook.items.filter((i) => i.status === "Need to Order").length;
  const activePEDs = pedHook.items.filter((i) => i.status === "Active").length;

  const tabs: { key: Tab; label: string; count?: string }[] = [
    { key: "supplements", label: "Supplements", count: `${suppHook.items.length}` },
    { key: "peptides",    label: "Peptides",    count: `${pepHook.items.length}` },
    { key: "peds",        label: "PEDs",        count: `${activePEDs} active` },
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
  const { items, addItem, deleteItem, toggleStatus, updateItem } = hook;
  const { notes: valdNotes, addNote: addValdNote, updateNote: updateValdNote } = valdHook;
  const [search, setSearch]       = useState("");
  const [formOpen, setFormOpen]   = useState(false);
  const [linkedFlash, setLinkedFlash] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", brand: "", timing: "", purchaseUrl: "" });

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
      <SearchBar value={search} onChange={setSearch} />
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
// PEPTIDES TAB
// ─────────────────────────────────────────────────────────────────────────────
function PeptidesTab({ hook }: { hook: ReturnType<typeof usePeptides> }) {
  const { items, addItem, deleteItem, toggleStatus } = hook;
  const [search, setSearch]     = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "", timing: "", cost: "", purchaseUrl: "", studyLinks: "" });

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
      <SearchBar value={search} onChange={setSearch} placeholder="Search peptides..." />
      <Table>
        <TableHead cols={["Peptide", "Brand", "Timing / Dose", "Cost", "Purchase", "Studies", "Status", ""]}
          widths="1.8fr 1.2fr 1.6fr 100px 100px 90px 120px 80px" />
        {filtered.length === 0 ? (
          <EmptyRow message={search ? "No peptides match your search." : "No peptides yet."} />
        ) : filtered.map((item, idx) => (
          <PepRow
            key={item.id}
            item={item}
            isLast={idx === filtered.length - 1}
            onToggleStatus={() => toggleStatus(item.id)}
            onDelete={() => deleteItem(item.id)}
          />
        ))}
      </Table>
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
// PEDs TAB
// ─────────────────────────────────────────────────────────────────────────────
function PEDsTab({ hook }: { hook: ReturnType<typeof usePEDs> }) {
  const { items, addItem, deleteItem, updateItem } = hook;
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", dose: "", duration: "", status: "Planned" as PEDStatus, notes: "" });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addItem({ name: form.name.trim(), dose: form.dose.trim() || "—", duration: form.duration.trim() || "—", status: form.status, notes: form.notes.trim() });
    setForm({ name: "", dose: "", duration: "", status: "Planned", notes: "" });
    setFormOpen(false);
  };

  const active    = items.filter((i) => i.status === "Active");
  const planned   = items.filter((i) => i.status === "Planned");
  const completed = items.filter((i) => i.status === "Completed");

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

      {/* Grouped sections */}
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

      {items.length === 0 && (
        <div style={{ textAlign: "center", color: "#7a8a95", fontSize: "14px", padding: "48px 0" }}>
          No protocols yet. Add one above.
        </div>
      )}
    </>
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
          <div style={{ padding: "10px 18px 6px", display: "flex", alignItems: "center", gap: "6px" }}>
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

