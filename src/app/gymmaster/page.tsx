"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

interface Member {
  gymmaster_member_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  membership_type: string | null;
  membership_status: string | null;
  expiry_date: string | null;
  last_visit: string | null;
  synced_at: string | null;
}

type FilterTab = "all" | "active" | "expiring" | "expired";

function getMemberStatus(member: Member): "active" | "expiring" | "expired" {
  if (!member.expiry_date) return "active";
  const expiry = new Date(member.expiry_date);
  const now = new Date();
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);
  if (expiry < now) return "expired";
  if (expiry <= in30) return "expiring";
  return "active";
}

function getDaysLabel(member: Member): string {
  if (!member.expiry_date) return "";
  const expiry = new Date(member.expiry_date);
  const now = new Date();
  const diff = Math.round((expiry.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "expires today";
  return `${diff}d left`;
}

const statusStyles: Record<"active" | "expiring" | "expired", { label: string; color: string; bg: string }> = {
  active:   { label: "Active",       color: "#4ade80", bg: "rgba(74,222,128,0.15)"  },
  expiring: { label: "Expiring",     color: "#e6c87a", bg: "rgba(230,200,122,0.15)" },
  expired:  { label: "Expired",      color: "#e05252", bg: "rgba(224,82,82,0.15)"   },
};

export default function GymMasterPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [followupLoading, setFollowupLoading] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  async function fetchMembers() {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("gymmaster_members")
      .select("*")
      .order("expiry_date", { ascending: true });
    setMembers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchMembers(); }, []);

  async function syncNow() {
    setSyncing(true);
    await fetch("/api/gymmaster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync_members" }),
    });
    await fetchMembers();
    setSyncing(false);
  }

  async function sendFollowup(memberId: string) {
    setFollowupLoading(memberId);
    await fetch("/api/gymmaster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send_followup", memberId }),
    });
    setFollowupLoading(null);
  }

  const filtered = members.filter((m) => {
    const name = `${m.first_name ?? ""} ${m.last_name ?? ""}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (m.email ?? "").toLowerCase().includes(search.toLowerCase());
    const status = getMemberStatus(m);
    const matchTab = tab === "all" || status === tab;
    return matchSearch && matchTab;
  });

  const paginated = filtered.slice(0, (page + 1) * PAGE_SIZE);

  const counts = {
    total: members.length,
    active: members.filter((m) => getMemberStatus(m) === "active").length,
    expiring: members.filter((m) => getMemberStatus(m) === "expiring").length,
    expired: members.filter((m) => getMemberStatus(m) === "expired").length,
  };

  const lastSynced = members[0]?.synced_at
    ? new Date(members[0].synced_at).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div style={{ color: "#B0E0E6", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#B0E0E6", margin: 0 }}>GymMaster Members</h1>
          {lastSynced && (
            <p style={{ fontSize: "12px", color: "#7a8a95", margin: "4px 0 0" }}>Last synced: {lastSynced}</p>
          )}
        </div>
        <button
          onClick={syncNow}
          disabled={syncing}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: syncing ? "#36393F" : "#B0E0E6", color: "#2C2F33", fontSize: "13px", fontWeight: 600, cursor: syncing ? "not-allowed" : "pointer" }}
        >
          {syncing ? "Syncing…" : "Sync Now"}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total", value: counts.total, color: "#B0E0E6" },
          { label: "Active", value: counts.active, color: "#4ade80" },
          { label: "Expiring (30d)", value: counts.expiring, color: "#e6c87a" },
          { label: "Expired", value: counts.expired, color: "#e05252" },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: "#36393F", borderRadius: "10px", padding: "14px 16px" }}>
            <p style={{ fontSize: "11px", color: "#7a8a95", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            <p style={{ fontSize: "24px", fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{ flex: 1, minWidth: "200px", padding: "9px 13px", borderRadius: "8px", border: "1px solid #36393F", backgroundColor: "#23262A", color: "#B0E0E6", fontSize: "13px", outline: "none" }}
        />
        <div style={{ display: "flex", gap: "6px" }}>
          {(["all", "active", "expiring", "expired"] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(0); }}
              style={{ padding: "7px 14px", borderRadius: "7px", border: "none", backgroundColor: tab === t ? "#B0E0E6" : "#36393F", color: tab === t ? "#2C2F33" : "#9aa5b0", fontSize: "12px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Member list */}
      {loading ? (
        <p style={{ color: "#7a8a95", fontSize: "14px" }}>Loading members…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "#7a8a95", fontSize: "14px" }}>No members found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {paginated.map((m) => {
            const status = getMemberStatus(m);
            const style = statusStyles[status];
            const name = `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "Unknown";
            const daysLabel = getDaysLabel(m);
            return (
              <div
                key={m.gymmaster_member_id}
                style={{ backgroundColor: "#36393F", borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}
              >
                {/* Name + email */}
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#B0E0E6", margin: "0 0 2px" }}>{name}</p>
                  <p style={{ fontSize: "12px", color: "#7a8a95", margin: 0 }}>{m.email ?? "No email"}</p>
                </div>

                {/* Phone */}
                <p style={{ fontSize: "12px", color: "#9aa5b0", margin: 0, minWidth: "120px" }}>{m.phone ?? "—"}</p>

                {/* Membership type */}
                <p style={{ fontSize: "12px", color: "#9aa5b0", margin: 0, minWidth: "120px" }}>{m.membership_type ?? "—"}</p>

                {/* Status badge */}
                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px", backgroundColor: style.bg, color: style.color, whiteSpace: "nowrap" }}>
                  {style.label}
                </span>

                {/* Expiry */}
                <div style={{ textAlign: "right", minWidth: "100px" }}>
                  <p style={{ fontSize: "12px", color: "#9aa5b0", margin: "0 0 2px" }}>{m.expiry_date ? new Date(m.expiry_date).toLocaleDateString("en-AU") : "—"}</p>
                  {daysLabel && (
                    <p style={{ fontSize: "11px", color: style.color, margin: 0 }}>{daysLabel}</p>
                  )}
                </div>

                {/* Follow-up button */}
                <button
                  onClick={() => sendFollowup(m.gymmaster_member_id)}
                  disabled={followupLoading === m.gymmaster_member_id}
                  style={{ padding: "6px 12px", borderRadius: "7px", border: "1px solid #23262A", backgroundColor: "transparent", color: "#9aa5b0", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  {followupLoading === m.gymmaster_member_id ? "Sending…" : "Follow-up"}
                </button>
              </div>
            );
          })}

          {/* Load more */}
          {paginated.length < filtered.length && (
            <button
              onClick={() => setPage((p) => p + 1)}
              style={{ marginTop: "8px", padding: "10px", borderRadius: "8px", border: "1px solid #36393F", backgroundColor: "transparent", color: "#9aa5b0", fontSize: "13px", cursor: "pointer" }}
            >
              Load more ({filtered.length - paginated.length} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
