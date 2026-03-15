"use client";

import { useState } from "react";
import { Plus, Folder, Clock } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";
import NoteTree from "@/components/gray-revenue/NoteTree";

export default function GrayRevenuePage() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [selectedId, setSelectedId] = useState<string | null>("note-mrr");
  const [editingTitle, setEditingTitle] = useState(false);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const handleAdd = (parentId: string | null, isFolder = false) => {
    const id = addNote(parentId, isFolder);
    setSelectedId(id);
  };

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
      }}
    >
      {/* Notes tree sidebar */}
      <div
        style={{
          width: "220px",
          minWidth: "220px",
          height: "100%",
          backgroundColor: "#23262A",
          borderRight: "1px solid #36393F",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Sidebar header */}
        <div
          style={{
            padding: "16px 12px 8px",
            borderBottom: "1px solid #36393F",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            💰 GrayRevenue
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            <IconBtn title="New note" onClick={() => handleAdd(null, false)}><Plus size={13} /></IconBtn>
            <IconBtn title="New folder" onClick={() => handleAdd(null, true)}><Folder size={13} /></IconBtn>
          </div>
        </div>

        {/* Tree */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
          <NoteTree
            notes={notes}
            parentId={null}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={handleAdd}
            onDelete={(id) => {
              deleteNote(id);
              if (selectedId === id) setSelectedId(null);
            }}
          />
        </div>
      </div>

      {/* Note canvas */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#2C2F33" }}>
        {selectedNote ? (
          selectedNote.isFolder ? (
            /* Folder view */
            <div style={{ flex: 1, padding: "48px", overflowY: "auto" }}>
              <div style={{ maxWidth: "680px" }}>
                <p style={{ fontSize: "12px", color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                  Folder
                </p>
                <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#B0E0E6", margin: "0 0 32px", letterSpacing: "-0.02em" }}>
                  {selectedNote.title}
                </h1>
                {/* Children list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {notes
                    .filter((n) => n.parentId === selectedNote.id)
                    .map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setSelectedId(n.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "14px 18px",
                          backgroundColor: "#36393F",
                          border: "1px solid #2C2F33",
                          borderRadius: "8px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "border-color 0.1s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#B0E0E6")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2C2F33")}
                      >
                        <span style={{ color: "#7a8a95" }}>
                          {n.isFolder ? <Folder size={16} /> : <span style={{ fontSize: "16px" }}>📄</span>}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: 500, color: "#B0E0E6" }}>{n.title}</div>
                          <div style={{ fontSize: "12px", color: "#7a8a95", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={11} /> {n.lastModified}
                          </div>
                        </div>
                      </button>
                    ))}
                  {notes.filter((n) => n.parentId === selectedNote.id).length === 0 && (
                    <p style={{ fontSize: "14px", color: "#7a8a95" }}>No notes yet. Use the + button to add one.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Note editor */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* Title bar */}
              <div style={{ padding: "40px 48px 0" }}>
                {editingTitle ? (
                  <input
                    autoFocus
                    value={selectedNote.title}
                    onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                    style={{
                      fontSize: "32px",
                      fontWeight: 700,
                      color: "#B0E0E6",
                      background: "none",
                      border: "none",
                      outline: "none",
                      width: "100%",
                      letterSpacing: "-0.02em",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <h1
                    onClick={() => setEditingTitle(true)}
                    style={{
                      fontSize: "32px",
                      fontWeight: 700,
                      color: "#B0E0E6",
                      margin: 0,
                      letterSpacing: "-0.02em",
                      cursor: "text",
                    }}
                    title="Click to edit title"
                  >
                    {selectedNote.title}
                  </h1>
                )}
                <div style={{ fontSize: "12px", color: "#7a8a95", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={11} /> Last modified {selectedNote.lastModified}
                </div>
                <div style={{ height: "1px", backgroundColor: "#36393F", marginTop: "20px" }} />
              </div>

              {/* Content textarea */}
              <textarea
                value={selectedNote.content}
                onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                placeholder="Start writing... (supports Markdown)"
                style={{
                  flex: 1,
                  padding: "24px 48px 48px",
                  background: "none",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "#9aa5b0",
                  fontFamily: "inherit",
                  overflowY: "auto",
                }}
              />
            </div>
          )
        ) : (
          /* Empty state */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#7a8a95",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "32px" }}>💰</span>
            <p style={{ fontSize: "15px", margin: 0 }}>Select a note or create a new one</p>
            <button
              onClick={() => handleAdd(null, false)}
              style={{
                marginTop: "8px",
                padding: "8px 16px",
                backgroundColor: "#B0E0E6",
                color: "#23262A",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
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
        padding: "4px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        color: hov ? "#B0E0E6" : "#7a8a95",
        transition: "all 0.1s",
      }}
    >
      {children}
    </button>
  );
}
