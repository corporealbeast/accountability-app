"use client";

import { useState } from "react";
import Link from "next/link";

const stats = [
  { label: "Active Goals",         value: "7",   delta: "+2 this week" },
  { label: "Completed",            value: "12",  delta: "+3 this month" },
  { label: "Streak",               value: "14d", delta: "Personal best" },
  { label: "Accountability Score", value: "87%", delta: "+5% vs last week" },
];

const recentActivity = [
  { action: "Goal completed",  detail: "Finish Q1 revenue plan",          time: "2h ago",    type: "success" },
  { action: "Check-in logged", detail: "Morning routine — Day 14",         time: "5h ago",    type: "info" },
  { action: "Goal updated",    detail: "Workout 5x/week → progress 3/5",  time: "Yesterday", type: "warning" },
  { action: "New goal added",  detail: "Read 2 books per month",           time: "2 days ago",type: "info" },
  { action: "Goal completed",  detail: "Cold shower 30-day challenge",     time: "3 days ago",type: "success" },
];

const typeColors: Record<string, string> = {
  success: "#4ade80",
  info:    "#9aa5b0",
  warning: "#e6c87a",
};

export default function HouseOfPowerPage() {
  const [_tab, _setTab] = useState("performance"); // ready for future tabs

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "13px", color: "#7a8a95", margin: "0 0 6px" }}>Goals · Accountability</p>
        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#B0E0E6", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          House of Power
        </h1>
        <p style={{ fontSize: "14px", color: "#9aa5b0", margin: 0 }}>
          Your command center for goals and accountability.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "12px", padding: "20px" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
              {s.label}
            </p>
            <p style={{ fontSize: "32px", fontWeight: 700, color: "#B0E0E6", margin: "0 0 4px" }}>
              {s.value}
            </p>
            <p style={{ fontSize: "12px", color: "#8ACDD4", margin: 0 }}>
              {s.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
        <Link href="/house-of-power/goals"
          style={{ padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, backgroundColor: "#B0E0E6", color: "#23262A", textDecoration: "none" }}>
          🎯 Manage Goals
        </Link>
        <Link href="/house-of-power/accountability"
          style={{ padding: "9px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, backgroundColor: "#36393F", color: "#B0E0E6", border: "1px solid #B0E0E6", textDecoration: "none" }}>
          📋 Accountability Log
        </Link>
      </div>

      {/* Recent activity */}
      <div>
        <p style={{ fontSize: "10px", fontWeight: 600, color: "#7a8a95", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
          Recent Activity
        </p>
        <div style={{ backgroundColor: "#36393F", border: "1px solid #2C2F33", borderRadius: "12px", overflow: "hidden" }}>
          {recentActivity.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 18px", borderBottom: i < recentActivity.length - 1 ? "1px solid #2C2F33" : "none" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: typeColors[item.type], flexShrink: 0, marginTop: "5px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "#B0E0E6", margin: 0 }}>
                  {item.action}
                </p>
                <p style={{ fontSize: "12px", color: "#9aa5b0", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.detail}
                </p>
              </div>
              <span style={{ fontSize: "11px", color: "#7a8a95", flexShrink: 0 }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
