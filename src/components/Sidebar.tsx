"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  Landmark,
  Dumbbell,
  Zap,
  BarChart2,
  Brain,
  FlaskConical,
  Crosshair,
  ChevronDown,
  Bot,
  Sword,
  Bell,
  Globe,
  Code2,
  Sparkles,
  Users,
  FolderKanban,
} from "lucide-react";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  sub?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    title: "Favorites",
    items: [
      { label: "Dashboard", href: "/", icon: <LayoutDashboard size={16} /> },
      { label: "Projects", href: "/projects", icon: <FolderKanban size={16} /> },
      { label: "Strongman Prep", href: "/strongman-prep", icon: <Swords size={16} /> },
    ],
  },
  {
    title: "Gyms",
    items: [
      { label: "House of Power", href: "/house-of-power", icon: <Landmark size={16} /> },
      { label: "Eden", href: "/house-of-power/odin", icon: <Sparkles size={14} />, sub: true },
      { label: "Davis Legacy", href: "/house-of-power/odin-claude", icon: <Sword size={14} />, sub: true },
      { label: "GymMaster", href: "/gymmaster", icon: <Users size={16} /> },
      { label: "Strength Collective", href: "/strength-collective", icon: <Dumbbell size={16} /> },
      { label: "PowerSource", href: "/powersource", icon: <Zap size={16} /> },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "GrayRevenue", href: "/gray-revenue", icon: <BarChart2 size={16} /> },
      { label: "Web Dev", href: "/webdev", icon: <Globe size={16} /> },
      { label: "Apex Peptides", href: "/webdev/apex-peptides", icon: <Code2 size={14} />, sub: true },
      { label: "Specific Peptides", href: "/webdev/specific-peptides", icon: <Code2 size={14} />, sub: true },
      { label: "House of Power", href: "/webdev/house-of-power", icon: <Code2 size={14} />, sub: true },
    ],
  },
  {
    title: "Health",
    items: [
      { label: "The Stack", href: "/stack", icon: <FlaskConical size={16} /> },
    ],
  },
  {
    title: "Coaching",
    items: [
      { label: "Precision Programming", href: "/precision-programming", icon: <Crosshair size={16} /> },
    ],
  },
  {
    title: "Mind",
    items: [
      { label: "Vald Brain", href: "/vald", icon: <Brain size={16} /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  const toggle = (title: string) =>
    setCollapsed((p) => ({ ...p, [title]: !p[title] }));

  return (
    <aside
      style={{
        width: "260px",
        minWidth: "260px",
        height: "100vh",
        backgroundColor: "#2C2F33",
        borderRight: "1px solid #36393F",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "20px 16px 12px",
          borderBottom: "1px solid #36393F",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "#B0E0E6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "13px",
              color: "#23262A",
              flexShrink: 0,
            }}
          >
            A
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#B0E0E6", lineHeight: 1.2 }}>
              Christian
            </div>
            <div style={{ fontSize: "11px", color: "#7a8a95", lineHeight: 1.2 }}>
              corporealbeast
            </div>
          </div>

          {/* Notification bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setNotifOpen((v) => !v); if (!notifOpen && unreadCount > 0) markAllRead(); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: unreadCount > 0 ? "#B0E0E6" : "#7a8a95",
                padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center",
              }}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: "-2px", right: "-2px",
                  background: "#B0E0E6", color: "#23262A",
                  fontSize: "9px", fontWeight: 700,
                  borderRadius: "999px", minWidth: "14px", height: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 2px",
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification panel */}
            {notifOpen && (
              <div style={{
                position: "fixed", top: "56px", left: "16px",
                width: "300px", maxHeight: "360px", overflowY: "auto",
                background: "#36393F", border: "1px solid #4a4d52",
                borderRadius: "10px", zIndex: 1000, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}>
                <div style={{
                  padding: "10px 14px", borderBottom: "1px solid #4a4d52",
                  fontSize: "12px", fontWeight: 600, color: "#9aa5b0",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "#B0E0E6" }}>
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: "16px", fontSize: "13px", color: "#7a8a95", textAlign: "center" }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid #3e4147",
                        cursor: "pointer",
                        background: n.read ? "transparent" : "rgba(176,224,230,0.04)",
                      }}
                    >
                      <div style={{ fontSize: "13px", color: n.read ? "#9aa5b0" : "#B0E0E6", fontWeight: n.read ? 400 : 500 }}>
                        {n.title}
                      </div>
                      {n.body && (
                        <div style={{ fontSize: "11px", color: "#7a8a95", marginTop: "2px" }}>{n.body}</div>
                      )}
                      <div style={{ fontSize: "10px", color: "#7a8a95", marginTop: "3px" }}>
                        {n.source} · {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {groups.map((group) => {
          const isCollapsed = collapsed[group.title];
          return (
            <div key={group.title} style={{ marginBottom: "4px" }}>
              {/* Group header */}
              <button
                onClick={() => toggle(group.title)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 16px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#7a8a95",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                <span>{group.title}</span>
                <ChevronDown
                  size={12}
                  style={{
                    transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s",
                  }}
                />
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div style={{ marginTop: "2px" }}>
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: item.sub ? "5px 16px 5px 32px" : "6px 16px",
                          margin: "1px 6px",
                          borderRadius: "6px",
                          fontSize: item.sub ? "13px" : "14px",
                          fontWeight: active ? 500 : 400,
                          color: active ? "#B0E0E6" : item.sub ? "#7a8a95" : "#9aa5b0",
                          backgroundColor: active ? "rgba(176,224,230,0.1)" : "transparent",
                          textDecoration: "none",
                          transition: "background-color 0.1s, color 0.1s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                            (e.currentTarget as HTMLAnchorElement).style.color = "#B0E0E6";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                            (e.currentTarget as HTMLAnchorElement).style.color = "#9aa5b0";
                          }
                        }}
                      >
                        <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #36393F",
          fontSize: "11px",
          color: "#7a8a95",
        }}
      >
        Wolf Gray · Powder Blue
      </div>
    </aside>
  );
}
