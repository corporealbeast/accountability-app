"use client";

import { useState } from "react";
import { ChevronRight, Folder, FolderOpen, FileText, Plus, Trash2 } from "lucide-react";
import { Note } from "@/hooks/useNotes";

interface NoteTreeProps {
  notes: Note[];
  parentId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (parentId: string | null, isFolder?: boolean) => void;
  onDelete: (id: string) => void;
  depth?: number;
}

export default function NoteTree({
  notes,
  parentId,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  depth = 0,
}: NoteTreeProps) {
  const children = notes.filter((n) => n.parentId === parentId);
  if (children.length === 0 && depth > 0) return null;

  return (
    <div>
      {children.map((note) => (
        <NoteTreeItem
          key={note.id}
          note={note}
          notes={notes}
          selectedId={selectedId}
          onSelect={onSelect}
          onAdd={onAdd}
          onDelete={onDelete}
          depth={depth}
        />
      ))}
    </div>
  );
}

function NoteTreeItem({
  note,
  notes,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  depth,
}: {
  note: Note;
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (parentId: string | null, isFolder?: boolean) => void;
  onDelete: (id: string) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedId === note.id;
  const hasChildren = notes.some((n) => n.parentId === note.id);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: `4px 8px 4px ${12 + depth * 16}px`,
          borderRadius: "5px",
          margin: "1px 4px",
          cursor: "pointer",
          backgroundColor: isSelected
            ? "rgba(176,224,230,0.12)"
            : hovered
            ? "rgba(255,255,255,0.04)"
            : "transparent",
          color: isSelected ? "#B0E0E6" : "#9aa5b0",
          transition: "background-color 0.1s",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          if (note.isFolder) setOpen((v) => !v);
          onSelect(note.id);
        }}
      >
        {/* Chevron for folders */}
        {note.isFolder ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              transition: "transform 0.15s",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              color: "#7a8a95",
              flexShrink: 0,
            }}
          >
            <ChevronRight size={12} />
          </span>
        ) : (
          <span style={{ width: "12px", flexShrink: 0 }} />
        )}

        {/* Icon */}
        <span style={{ flexShrink: 0, color: isSelected ? "#B0E0E6" : "#7a8a95" }}>
          {note.isFolder ? (
            open && hasChildren ? <FolderOpen size={14} /> : <Folder size={14} />
          ) : (
            <FileText size={14} />
          )}
        </span>

        {/* Title */}
        <span
          style={{
            flex: 1,
            fontSize: "13px",
            fontWeight: isSelected ? 500 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {note.title}
        </span>

        {/* Action buttons (show on hover) */}
        {hovered && (
          <span style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
            {note.isFolder && (
              <>
                <ActionBtn
                  onClick={(e) => { e.stopPropagation(); onAdd(note.id, false); setOpen(true); }}
                  title="New note"
                >
                  <Plus size={11} />
                </ActionBtn>
                <ActionBtn
                  onClick={(e) => { e.stopPropagation(); onAdd(note.id, true); setOpen(true); }}
                  title="New folder"
                >
                  <Folder size={11} />
                </ActionBtn>
              </>
            )}
            <ActionBtn
              onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
              title="Delete"
              danger
            >
              <Trash2 size={11} />
            </ActionBtn>
          </span>
        )}
      </div>

      {/* Children */}
      {note.isFolder && open && (
        <NoteTree
          notes={notes}
          parentId={note.id}
          selectedId={selectedId}
          onSelect={onSelect}
          onAdd={onAdd}
          onDelete={onDelete}
          depth={depth + 1}
        />
      )}
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
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
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px",
        borderRadius: "3px",
        display: "flex",
        alignItems: "center",
        color: hov ? (danger ? "#e6c87a" : "#B0E0E6") : "#7a8a95",
        backgroundColor: hov ? "rgba(255,255,255,0.08)" : "transparent",
        transition: "color 0.1s",
      }}
    >
      {children}
    </button>
  );
}
