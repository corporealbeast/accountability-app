"use client";

import { useState, useMemo } from "react";
import { ExternalLink, Plus, Trash2, GitBranch, Search, Check } from "lucide-react";
import { useStack, StackItem } from "@/hooks/useStack";
import { useValdNotes } from "@/hooks/useValdNotes";

const STACK_HUB_TITLE = "The Stack";

export default function StackPage() {
  const { items, addItem, deleteItem, toggleStatus, updateItem } = useStack();
  const { notes: valdNotes, addNote: addValdNote, updateNote: updateValdNote } = useValdNotes();

  const [search, setSearch] = useState("");
  const [linkedFlash, setLinkedFlash] = useState<string | null>(null);

  // Quick-add form state
  const [form, setForm] = useState({ name: "", brand: "", timing: "", purchaseUrl: "" });
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.timing.toLowerCase().includes(q)
    );
  }, [items, search]);

  const inStock = items.filter((i) => i.status === "In Stock").length;
  const needOrder = items.filter((i) => i.status === "Need to Order").length;

  // ---------- Vald integration ----------
  const ensureStackHub = (): string => {
    const existing = valdNotes.find((n) => n.title === STACK_HUB_TITLE);
    if (existing) return existing.id;
    const id = addValdNote("Health");
    updateValdNote(id, {
      title: STACK_HUB_TITLE,
      content:
        "Central hub for the supplement stack.\n\nAll individual supplements link back here.",
      links: [],
    });
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

  // ---------- Quick-add submit ----------
  const handleAdd = () => {
    if (!form.name.trim()) return;
    addItem({
      name: form.name.trim(),
      brand: form.brand.trim() || "—",
      timing: form.timing.trim() || "—",
      purchaseUrl: form.purchaseUrl.trim(),
      status: "In Stock",
    });
    setForm({ name: "", brand: "", timing: "", purchaseUrl: "" });
    setFormOpen(false);
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "13px", color: "#7a8a95", margin: "0 0 6px" }}>Performance · Health</p>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#B0E0E6",
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}
        >
          The Stack
        </h1>
        <p style={{ fontSize: "14px", color: "#9aa5b0", margin: 0 }}>
          Supplement tracker · {inStock} in stock · {needOrder} to order
        </p>
      </div>

      {/* Quick-add bar */}
      <div
        style={{
          backgroundColor: "#36393F",
          border: "1px solid #2C2F33",
          borderRadius: "10px",
          marginBottom: "24px",
          overflow: "hidden",
        }}
      >
        <button
          onClick={() => setFormOpen((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 18px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: formOpen ? "#B0E0E6" : "#7a8a95",
            fontSize: "13px",
            fontWeight: 500,
            textAlign: "left",
          }}
        >
          <Plus size={15} />
          Quick-add supplement
        </button>

        {formOpen && (
          <div
            style={{
              padding: "0 18px 18px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
              gap: "10px",
              alignItems: "end",
              borderTop: "1px solid #2C2F33",
              paddingTop: "16px",
            }}
          >
            {[
              { key: "name",        placeholder: "Supplement name *", label: "Name" },
              { key: "brand",       placeholder: "Brand",              label: "Brand" },
              { key: "timing",      placeholder: "5g · Post-Workout",  label: "Timing / Dose" },
              { key: "purchaseUrl", placeholder: "https://...",        label: "Purchase URL" },
            ].map(({ key, placeholder, label }) => (
              <div key={key}>
                <div style={{ fontSize: "10px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>
                  {label}
                </div>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder={placeholder}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    backgroundColor: "#2C2F33",
                    border: "1px solid #36393F",
                    borderRadius: "6px",
                    color: "#B0E0E6",
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleAdd}
              style={{
                padding: "8px 18px",
                backgroundColor: "#B0E0E6",
                color: "#23262A",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
          backgroundColor: "#36393F",
          border: "1px solid #2C2F33",
          borderRadius: "8px",
          padding: "0 14px",
        }}
      >
        <Search size={14} color="#7a8a95" style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search supplements..."
          style={{
            flex: 1,
            padding: "11px 0",
            background: "none",
            border: "none",
            outline: "none",
            color: "#B0E0E6",
            fontSize: "13px",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "#36393F",
          border: "1px solid #2C2F33",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.4fr 1.6fr 120px 130px 110px",
            padding: "10px 18px",
            borderBottom: "1px solid #2C2F33",
            gap: "12px",
          }}
        >
          {["Supplement", "Brand", "Timing / Dose", "Purchase", "Status", ""].map((h) => (
            <div
              key={h}
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#7a8a95",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#7a8a95", fontSize: "14px" }}>
            {search ? "No supplements match your search." : "No supplements yet. Add one above."}
          </div>
        ) : (
          filtered.map((item, idx) => (
            <StackRow
              key={item.id}
              item={item}
              isLast={idx === filtered.length - 1}
              flash={linkedFlash === item.id}
              onToggleStatus={() => toggleStatus(item.id)}
              onDelete={() => deleteItem(item.id)}
              onValdLink={() => handleValdLink(item)}
            />
          ))
        )}
      </div>

      {/* Footer note */}
      <p style={{ fontSize: "12px", color: "#4a5568", marginTop: "16px", textAlign: "center" }}>
        Click "Visual Link" to add a supplement as a node in Vald Brain under Health (Sea Green).
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------
function StackRow({
  item,
  isLast,
  flash,
  onToggleStatus,
  onDelete,
  onValdLink,
}: {
  item: StackItem;
  isLast: boolean;
  flash: boolean;
  onToggleStatus: () => void;
  onDelete: () => void;
  onValdLink: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.4fr 1.6fr 120px 130px 110px",
        padding: "14px 18px",
        gap: "12px",
        alignItems: "center",
        borderBottom: isLast ? "none" : "1px solid #2C2F33",
        backgroundColor: hovered ? "rgba(255,255,255,0.025)" : "transparent",
        transition: "background-color 0.1s",
      }}
    >
      {/* Name */}
      <div>
        <div style={{ fontSize: "14px", fontWeight: 500, color: "#B0E0E6" }}>{item.name}</div>
        {item.valdLinked && (
          <div style={{ fontSize: "11px", color: "#20B2AA", marginTop: "2px", display: "flex", alignItems: "center", gap: "3px" }}>
            <GitBranch size={10} /> Vald linked
          </div>
        )}
      </div>

      {/* Brand */}
      <div style={{ fontSize: "13px", color: "#9aa5b0" }}>{item.brand}</div>

      {/* Timing */}
      <div style={{ fontSize: "13px", color: "#9aa5b0", fontVariantNumeric: "tabular-nums" }}>
        {item.timing}
      </div>

      {/* Purchase link */}
      <div>
        {item.purchaseUrl ? (
          <a
            href={item.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: "#B0E0E6",
              textDecoration: "none",
              padding: "4px 10px",
              border: "1px solid rgba(176,224,230,0.3)",
              borderRadius: "5px",
              transition: "border-color 0.1s, background-color 0.1s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#B0E0E6";
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(176,224,230,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(176,224,230,0.3)";
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
            }}
          >
            <ExternalLink size={11} /> Shop
          </a>
        ) : (
          <span style={{ fontSize: "12px", color: "#4a5568" }}>—</span>
        )}
      </div>

      {/* Status toggle */}
      <div>
        <StatusBadge status={item.status} onClick={onToggleStatus} />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Visual Link button */}
        {flash ? (
          <span style={{ fontSize: "11px", color: "#20B2AA", display: "flex", alignItems: "center", gap: "3px", fontWeight: 600 }}>
            <Check size={12} /> Linked!
          </span>
        ) : (
          <button
            onClick={onValdLink}
            title={item.valdLinked ? "Already in Vald Brain" : "Add to Vald Brain"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              padding: "4px 8px",
              backgroundColor: item.valdLinked ? "rgba(32,178,170,0.1)" : "transparent",
              color: item.valdLinked ? "#20B2AA" : "#7a8a95",
              border: `1px solid ${item.valdLinked ? "rgba(32,178,170,0.3)" : "#36393F"}`,
              borderRadius: "5px",
              cursor: item.valdLinked ? "default" : "pointer",
              transition: "all 0.1s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!item.valdLinked)
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#20B2AA";
            }}
            onMouseLeave={(e) => {
              if (!item.valdLinked)
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#36393F";
            }}
          >
            <GitBranch size={11} />
            {item.valdLinked ? "Linked" : "Link"}
          </button>
        )}

        {/* Delete */}
        {hovered && (
          confirmDelete ? (
            <button
              onClick={onDelete}
              style={{
                fontSize: "11px",
                padding: "3px 7px",
                backgroundColor: "#e05252",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Sure?
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete"
              style={{
                display: "flex",
                alignItems: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#4a5568",
                borderRadius: "4px",
                transition: "color 0.1s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#e05252")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#4a5568")}
            >
              <Trash2 size={13} />
            </button>
          )
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, onClick }: { status: StackItem["status"]; onClick: () => void }) {
  const inStock = status === "In Stock";
  return (
    <button
      onClick={onClick}
      title="Click to toggle status"
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: "20px",
        border: "none",
        cursor: "pointer",
        backgroundColor: inStock ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)",
        color: inStock ? "#4ade80" : "#f87171",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {inStock ? "✓ In Stock" : "⚠ Order"}
    </button>
  );
}
